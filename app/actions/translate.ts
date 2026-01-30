'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { Stage, StageBlock } from '@/types/schema'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function translateStageContent(stageId: string, targetLanguages: string[]) {
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
    // We will extract all text that needs translation into a simplified structure
    // Key: BlockID, Value: { content?: string, overlay?: string, quiz?: ... }
    const translatableData: Record<string, any> = {}

    blocks.forEach((block: StageBlock) => {
        const item: any = {}
        let hasContent = false

        // A. Main Content
        if (block.type === 'text' && typeof block.content === 'string') {
            item.content = block.content
            hasContent = true
        } else if (block.type === 'quiz') {
            // Complex structure handling
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
            // Only translate captions
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

    // 3. Process each target language
    const updatedBlocks = [...blocks]

    for (const lang of targetLanguages) {
        try {
            const systemPrompt = `You are a professional translator for a museum app. 
            Translate the values in the JSON object provided by the user into language code: "${lang}". 
            Keep the keys exactly the same. 
            Preserve any HTML tags or Markdown formatting. 
            Return ONLY the valid JSON.`

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify(translatableData) }
                ],
                response_format: { type: "json_object" }
            })

            const content = response.choices[0].message.content
            if (!content) continue

            const translatedData = JSON.parse(content)

            // 4. Merge back into blocks
            updatedBlocks.forEach((block, index) => {
                const translatedItem = translatedData[block.id]
                if (!translatedItem) return

                const newBlock = { ...block }

                // Init i18n containers if missing
                if (!newBlock.content_i18n) newBlock.content_i18n = {}
                if (!newBlock.overlay_i18n) newBlock.overlay_i18n = {}

                // Merge Content
                if (translatedItem.content && block.type === 'text') {
                    newBlock.content_i18n[lang] = translatedItem.content
                } else if (translatedItem.quiz && block.type === 'quiz') {
                    // Reconstruct quiz object with translated strings but keeping structure
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
            // Continue to next language if one fails
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
        throw new Error(updateError.message)
    }

    return { success: true }
}
