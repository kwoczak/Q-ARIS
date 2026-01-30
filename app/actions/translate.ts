'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { Stage, StageBlock } from '@/types/schema'

export async function translateStageContent(stageId: string, targetLanguages: string[]) {
    console.log("--- Starting Translation ---");
    console.log("StageID:", stageId);
    console.log("Target Languages:", targetLanguages);

    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing OPENAI_API_KEY");
        return { success: false, message: "Server configuration error: Missing API Key" };
    }

    // Initialize OpenAI client inside the action to avoid build-time errors if env is missing
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

    blocks.forEach((block: StageBlock) => {
        const item: any = {}
        let hasContent = false

        // A. Main Content
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

        // B. Overlay
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
            // Enhanced System Prompt for Quality and Style
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

            const content = response.choices[0].message.content
            if (!content) {
                console.error(`Empty response from OpenAI for ${lang}`);
                continue;
            }

            console.log(`Received translation for ${lang}`);
            const translatedData = JSON.parse(content)

            // 4. Merge back into blocks
            updatedBlocks.forEach((block, index) => {
                const translatedItem = translatedData[block.id]
                if (!translatedItem) return

                const newBlock = { ...block }

                if (!newBlock.content_i18n) newBlock.content_i18n = {}
                if (!newBlock.overlay_i18n) newBlock.overlay_i18n = {}

                // Merge Content
                if (translatedItem.content && block.type === 'text') {
                    newBlock.content_i18n[lang] = translatedItem.content
                } else if (translatedItem.quiz && block.type === 'quiz') {
                    const originalQuiz = block.content as any
                    newBlock.content_i18n[lang] = {
                        ...originalQuiz,
                        question: translatedItem.quiz.question,
                        answers: originalQuiz.answers.map((ans: any, i: number) => ({
                            ...ans,
                            text: translatedItem.quiz.answers[i]?.text || ans.text,
                            feedback: translatedItem.quiz.answers[i]?.feedback || ans.feedback
                        }))
                    }
                } else if (translatedItem.accordion && block.type === 'accordion') {
                    const originalAcc = block.content as any[]
                    newBlock.content_i18n[lang] = originalAcc.map((item, i) => ({
                        ...item,
                        title: translatedItem.accordion[i]?.title || item.title,
                        content: translatedItem.accordion[i]?.content || item.content
                    }))
                } else if (translatedItem.carousel && block.type === 'carousel') {
                    const originalCar = block.content as any[]
                    newBlock.content_i18n[lang] = originalCar.map((item, i) => ({
                        ...item,
                        caption: translatedItem.carousel[i]?.caption || item.caption
                    }))
                }

                // Merge Overlay
                if (translatedItem.overlay) {
                    newBlock.overlay_i18n[lang] = { text: translatedItem.overlay }
                }

                updatedBlocks[index] = newBlock
            })

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
