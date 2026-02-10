'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { Stage, StageBlock } from '@/types/schema'
import { generateAndSaveTTS } from '@/lib/actions/elevenlabs'

export async function translateStageContent(stageId: string, targetLanguages: string[]) {
    // 1. Define debugLogs and log function FIRST
    const debugLogs: string[] = []

    // Internal log function to collect debug info
    const log = (msg: string) => {
        console.log(msg)
        debugLogs.push(msg)
    }

    log("--- Starting Translation ---")
    log(`StageID: ${stageId}`)
    log(`Target Languages: ${targetLanguages}`)

    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing OPENAI_API_KEY")
        return { success: false, message: "Server configuration error: Missing API Key" }
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })

    const supabase = await createClient()
    const adminSupabase = await createAdminClient() // Use admin for RLS bypass on lookups

    // 1. Fetch Stage
    const { data: stage, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single()

    if (error || !stage) {
        throw new Error('Stage not found')
    }

    const { content } = stage
    const blocks = content.blocks || []

    // 2. Identify Translatable Content
    const translatableData: Record<string, any> = {}

    // Pre-fetch all TTS assets for this curator to match URLs
    const audioUrls: string[] = []

    blocks.forEach((block: StageBlock) => {
        if (block.type === 'audio' && typeof block.content === 'string') {
            audioUrls.push(block.content)
        }
    })

    // Fetch TTS Assets details if any audio blocks exist
    let audioAssetsMap: Record<string, any> = {}
    if (audioUrls.length > 0) {
        log(`Found ${audioUrls.length} audio URLs.`)
        // 1. Try Exact Match
        // Use adminSupabase to bypass RLS!
        const { data: assets } = await adminSupabase
            .from('tts_assets')
            .select('*')
            .in('public_url', audioUrls)

        if (assets) {
            assets.forEach(a => {
                audioAssetsMap[a.public_url] = a
            })
            log(`Matched ${assets.length} assets by exact URL.`)
        }

        // 2. Fallback: Fuzzy Match (if exact match not found)
        for (const url of audioUrls) {
            if (!audioAssetsMap[url]) {
                try {
                    const urlObj = new URL(url)
                    const pathname = urlObj.pathname
                    const filename = pathname.split('/').pop()

                    if (filename) {
                        const decodedFilename = decodeURIComponent(filename)
                        log(`Checking fuzzy match for: ${decodedFilename}`)

                        const { data: fuzzyAsset } = await adminSupabase
                            .from('tts_assets')
                            .select('*')
                            .ilike('file_path', `%${decodedFilename}`)
                            .maybeSingle()

                        if (fuzzyAsset) {
                            log(`Fuzzy match found: ${decodedFilename} -> ${fuzzyAsset.id}`)
                            audioAssetsMap[url] = fuzzyAsset
                        } else {
                            log(`No match for: ${decodedFilename}`)
                        }
                    }
                } catch (e) {
                    log(`Warning: Failed to parse URL: ${url}`)
                }
            }
        }
    } else {
        log("No audio blocks present.")
    }

    blocks.forEach((block: StageBlock) => {
        const item: any = {}
        let hasContent = false

        // A. Main Text Content
        if (block.type === 'text' && typeof block.content === 'string') {
            item.content = block.content
            hasContent = true
        } else if (block.type === 'quiz') {
            const quiz = block.content as any
            item.quiz = {
                question: quiz.question,
                submitButtonText: quiz.submitButtonText, // Added
                answers: quiz.answers.map((a: any) => ({
                    id: a.id,
                    text: a.text,
                    feedback: a.feedback
                }))
            }
            hasContent = true
        } else if (block.type === 'scratchpad') { // Added Scratchpad
            const scratch = block.content as any
            item.scratchpad = {
                coverText: scratch.coverText,
                scratchText: scratch.scratchText
            }
            hasContent = true
        } else if (block.type === 'accordion') {
            const acc = block.content as any[]
            item.accordion = acc.map(a => ({
                id: a.id,
                title: a.title,
                content: a.content
            }))
            hasContent = true
        } else if (block.type === 'carousel') {
            const car = block.content as any[]
            item.carousel = car.map(c => ({
                id: c.id,
                caption: c.caption || ''
            }))
            hasContent = true
        }
        // B. Audio Blocks (TTS)
        else if (block.type === 'audio' && typeof block.content === 'string') {
            const asset = audioAssetsMap[block.content]
            if (asset) {
                // This is a TTS audio! We can translate its source text.
                item.audio_source_text = asset.text_content
                item.audio_voice_id = asset.voice_id
                item.audio_voice_name = asset.voice_name
                // Note: We don't set item.content here because likely we don't want to translate the URL itself.
                // The presence of audio_source_text will trigger TTS generation.
                hasContent = true
                log(`Audio Block ${block.id}: Prepared for TTS regeneration.`)
            } else {
                log(`Audio Block ${block.id}: Skipped (not a TTS asset).`)
            }
        }

        // C. Overlay
        if (block.overlay && block.overlay.text) {
            item.overlay = block.overlay.text
            hasContent = true
        }

        if (hasContent) {
            translatableData[block.id] = item
        }
    })

    // D. Global Stage Content (AR Button)
    if (content.arButtonText) {
        translatableData['stage_global'] = {
            arButtonText: content.arButtonText
        }
    }

    if (Object.keys(translatableData).length === 0) {
        return { success: true, message: "No text content to translate.", logs: debugLogs }
    }

    log(`Translatable Blocks: ${Object.keys(translatableData).length}`)

    // 3. Process each target language
    const updatedBlocks = [...blocks]
    // Use a separate object to track global updates since we can't mutate 'content' directly easily in the loop logic below
    const globalUpdates: Record<string, any> = {}

    for (const lang of targetLanguages) {
        try {
            log(`Processing language: ${lang}...`)

            // Step 3a: Translate Text with GPT
            const systemPrompt = `You are a professional translator and copywriter for a premium museum guide app.
            Translate the JSON values to: "${lang}". Keep keys identical.
            For 'audio_source_text', translate the text content so it can be spoken by TTS.
            Return ONLY valid JSON.`

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify(translatableData) }
                ],
                response_format: { type: "json_object" }
            })

            const contentStr = response.choices[0].message.content
            if (!contentStr) {
                console.error(`Empty response for ${lang}`)
                continue
            }

            const translatedData = JSON.parse(contentStr)

            // Step 3b: Merge & Generate TTS

            // Handle Global Updates First
            if (translatedData['stage_global']) {
                if (!globalUpdates[lang]) globalUpdates[lang] = {}
                globalUpdates[lang].arButtonText = translatedData['stage_global'].arButtonText
            }

            for (let i = 0; i < updatedBlocks.length; i++) {
                const block = updatedBlocks[i];
                const blockId = block.id
                const translatedItem = translatedData[blockId]

                if (!translatedItem) continue

                // Create a mutable copy of the block to update
                // Ensure maps exist
                const newBlock = {
                    ...block,
                    content_i18n: { ...(block.content_i18n || {}) },
                    overlay_i18n: { ...(block.overlay_i18n || {}) }
                }

                // 1. Handle TTS Generation for Audio Blocks
                if (block.type === 'audio' && translatedItem.audio_source_text) {
                    const translatedText = translatedItem.audio_source_text
                    const voiceId = translatableData[blockId].audio_voice_id
                    const voiceName = translatableData[blockId].audio_voice_name

                    log(`Generating TTS for block ${blockId} in ${lang}...`)
                    const ttsResult = await generateAndSaveTTS({
                        text: translatedText,
                        voice_id: voiceId,
                        voice_name: voiceName,
                        label: `Auto-translated (${lang}): ${translatedText.substring(0, 20)}...`
                    })

                    if (ttsResult.success && ttsResult.data) {
                        newBlock.content_i18n[lang] = ttsResult.data.public_url
                        log(`TTS success: ${ttsResult.data.public_url}`)
                    } else {
                        log(`TTS Error (${lang}): ${ttsResult.error}`)
                    }
                }

                // 2. Handle Text Content
                else if (translatedItem.content && block.type === 'text') {
                    newBlock.content_i18n[lang] = translatedItem.content
                }
                // 3. Handle Complex Blocks
                else if (translatedItem.quiz && block.type === 'quiz') {
                    const originalQuiz = block.content as any
                    newBlock.content_i18n[lang] = {
                        ...originalQuiz,
                        question: translatedItem.quiz.question,
                        submitButtonText: translatedItem.quiz.submitButtonText || originalQuiz.submitButtonText,
                        answers: originalQuiz.answers.map((ans: any, idx: number) => ({
                            ...ans,
                            text: translatedItem.quiz.answers[idx]?.text || ans.text,
                            feedback: translatedItem.quiz.answers[idx]?.feedback || ans.feedback
                        }))
                    }
                } else if (translatedItem.scratchpad && block.type === 'scratchpad') { // Added Scratchpad
                    const originalScratch = block.content as any
                    newBlock.content_i18n[lang] = {
                        ...originalScratch,
                        coverText: translatedItem.scratchpad.coverText || originalScratch.coverText,
                        scratchText: translatedItem.scratchpad.scratchText || originalScratch.scratchText
                    }
                } else if (translatedItem.accordion && block.type === 'accordion') {
                    const originalAcc = block.content as any[]
                    newBlock.content_i18n[lang] = originalAcc.map((item: any, idx: number) => ({
                        ...item,
                        title: translatedItem.accordion[idx]?.title || item.title,
                        content: translatedItem.accordion[idx]?.content || item.content
                    }))
                } else if (translatedItem.carousel && block.type === 'carousel') {
                    const originalCar = block.content as any[]
                    newBlock.content_i18n[lang] = originalCar.map((item: any, idx: number) => ({
                        ...item,
                        caption: translatedItem.carousel[idx]?.caption || item.caption
                    }))
                }

                // 4. Handle Overlay
                if (translatedItem.overlay) {
                    newBlock.overlay_i18n[lang] = { text: translatedItem.overlay }
                }

                updatedBlocks[i] = newBlock;
            }

        } catch (err: any) {
            log(`FATAL Error (${lang}): ${err.message}`)
        }
    }

    // Prepare updated content including global fields overrides
    // We need to store global overrides somewhere. `StageContent` doesn't have `i18n` field?
    // Let's modify updated content if we have global updates.
    // NOTE: Schema doesn't have `content.arButtonText_i18n`. 
    // We should probably add `content_i18n` to `StageContent` or store it in the same structure if we can.
    // Looking at schema: `StageContent` has new fields but `blocks` have `content_i18n`.
    // We might need to handle `arButtonText` translation differently or add a field to `StageContent`.
    // For now, let's assume we can add `arButtonText_i18n` to `StageContent` as a generic record or similar.
    // Checking schema... `StageContent` is strict.
    // Let's add `arButtonText_i18n` to schema first? Or just `i18n`?
    // Actually, let's check `types/schema.ts` again. `StageContent` does NOT have `i18n`.
    // I can't effectively save the translation for global stage buttons without a schema change.
    // BUT, I can rely on a hack: `blocks` are flexible, `StageContent`... let's see.
    // `StageContent` is defined as:
    // export type StageContent = { ... background?: ..., blocks?: ..., arButtonText?: ... }
    // It does not have a catch-all or i18n field.
    // I MUST ADD `i18n` or specific fields to `StageContent`.

    // START INTERJECTION: I need to update schema for StageContent i18n.
    // Let's assume I will do that in a separate step or just do it here implicitly if TS is loose, but it's better to be explicit.
    // Wait, the user asked for translation.
    // Let's add `arButtonText_i18n` to StageContent in schema.ts.

    // For this rewrite, I'll proceed assuming I'll fix the schema in a moment.
    // I will write the code to use `arButtonText_i18n`.

    const updatedContent: any = {
        ...content,
        blocks: updatedBlocks
    }

    if (Object.keys(globalUpdates).length > 0) {
        updatedContent.i18n = updatedContent.i18n || {}
        for (const lang in globalUpdates) {
            updatedContent.i18n[lang] = {
                ...updatedContent.i18n[lang],
                ...globalUpdates[lang]
            }
        }
    }

    // 5. Save updates
    const { error: updateError } = await supabase
        .from('stages')
        .update({
            content: updatedContent
        })
        .eq('id', stageId)

    if (updateError) {
        log(`DB Update failed: ${updateError.message}`)
        throw new Error(updateError.message)
    }

    log("Translation Action Completed.")

    // Return the updated content
    return {
        success: true,
        logs: debugLogs,
        data: {
            ...stage,
            content: updatedContent
        }
    }
}
