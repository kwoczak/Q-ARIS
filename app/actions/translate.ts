'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { Stage, StageBlock } from '@/types/schema'
import { generateAndSaveTTS } from '@/lib/actions/elevenlabs'

export async function translateStageContent(stageId: string, targetLanguages: string[]) {
    log("--- Starting Translation ---");
    log(`StageID: ${stageId}`);
    log(`Target Languages: ${targetLanguages}`);

    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing OPENAI_API_KEY");
        return { success: false, message: "Server configuration error: Missing API Key" };
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })

    const supabase = await createClient()

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
        const { data: assets } = await supabase
            .from('tts_assets')
            .select('*')
            .in('public_url', audioUrls)

        if (assets) {
            assets.forEach(a => {
                audioAssetsMap[a.public_url] = a
            })
        }
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
                answers: quiz.answers.map((a: any) => ({
                    id: a.id,
                    text: a.text,
                    feedback: a.feedback
                }))
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

    if (Object.keys(translatableData).length === 0) {
        return { success: true, message: "No text content to translate." }
    }

    console.log("Translatable Blocks Found:", Object.keys(translatableData).length);

    // 3. Process each target language
    const updatedBlocks = [...blocks]

    for (const lang of targetLanguages) {
        try {
            console.log(`Processing language: ${lang}...`)

            // Step 3a: Translate Text with GPT
            const systemPrompt = `You are a professional translator and copywriter for a premium museum guide app.
            Your goal is to provide high-quality localized content that sounds natural and engaging to native speakers of the target language: "${lang}".

            Guidelines:
            1. Tone: Professional, educational, yet accessible and engaging. Avoid overly academic jargon unless present in the source.
            2. Style: Flowing and idiomatic. Avoid literal word-for-word translation. Rephrase if necessary to convey the meaning better in the target language.
            3. Formatting: PRESERVE all HTML tags, Markdown, and special characters exactly.
            4. Context: The content is for a mobile tour guide. Short texts (headlines) should be catchy. Long texts should be readable and well-structured.

            Instruction:
            Translate the values in the JSON object provided by the user into language code: "${lang}". 
            Keep the keys exactly the same. 
            Return ONLY the valid JSON object.`

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

            console.log(`Received translation for ${lang}`);
            const translatedData = JSON.parse(contentStr)

            // Step 3b: Merge & Generate TTS
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

                    console.log(`Generating TTS for block ${blockId} in ${lang}...`)
                    const ttsResult = await generateAndSaveTTS({
                        text: translatedText,
                        voice_id: voiceId,
                        voice_name: voiceName,
                        label: `Auto-translated (${lang}): ${translatedText.substring(0, 20)}...`
                    })

                    if (ttsResult.success && ttsResult.data) {
                        newBlock.content_i18n[lang] = ttsResult.data.public_url
                        console.log(`TTS generated: ${ttsResult.data.public_url}`)
                    } else {
                        console.error(`TTS Generation failed for ${lang}:`, ttsResult.error)
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
                        answers: originalQuiz.answers.map((ans: any, idx: number) => ({
                            ...ans,
                            text: translatedItem.quiz.answers[idx]?.text || ans.text,
                            feedback: translatedItem.quiz.answers[idx]?.feedback || ans.feedback
                        }))
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

        } catch (err) {
            console.error(`Translation failed for ${lang}`, err)
        }
    }

    // 5. Save updates
    const { error: updateError } = await supabase
        .from('stages')
        .update({
            content: {
                ...content,
                blocks: updatedBlocks
            }
        })
        .eq('id', stageId)

    if (updateError) {
        console.error("Database update failed:", updateError);
        throw new Error(updateError.message)
    }

    console.log("Translation completed successfully.");

    // Return the updated content so the UI can refresh immediately
    return {
        success: true,
        data: {
            ...stage,
            content: {
                ...content,
                blocks: updatedBlocks
            }
        }
    }
}
