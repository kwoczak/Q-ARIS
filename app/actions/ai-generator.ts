'use server'

import OpenAI from 'openai'
import { AIAttachment, AIGenerationRequest, AIGenerationResponse, AITokenUsage } from '@/types/schema'

import { getSession } from '@/lib/auth-lib'
import { createAdminClient } from '@/lib/supabase/server'

// Pricing per 1,000,000 tokens (USD)
const PRICING: Record<string, { input: number; output: number }> = {
    'gpt-5.6-terra': { input: 3.00, output: 12.00 },
    'o3-mini': { input: 1.10, output: 4.40 },
    'o1': { input: 15.00, output: 60.00 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'default': { input: 2.50, output: 10.00 },
}

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const rate = PRICING[model] || PRICING['default']
    const cost = (promptTokens / 1_000_000) * rate.input + (completionTokens / 1_000_000) * rate.output
    return Number(cost.toFixed(6))
}

export async function generateStageWithAI(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // 1. Enforce closed beta access: only curator_demo or admin can generate with AI
    const session = await getSession()
    if (session) {
        let isAllowed = session.role === 'admin' || session.username === 'curator_demo'
        if (!isAllowed && session.userId) {
            const adminSupabase = await createAdminClient()
            const { data: user } = await adminSupabase.from('users').select('username, role').eq('id', session.userId).single()
            if (user?.username === 'curator_demo' || user?.role === 'admin') {
                isAllowed = true
            }
        }
        if (!isAllowed) {
            return {
                success: false,
                error: 'Generator AI jest obecnie w fazie testowej i jest dostępny wyłącznie dla konta curator_demo.'
            }
        }
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        return {
            success: false,
            error: 'Brak klucza API OpenAI (OPENAI_API_KEY). Ustaw zmienną w pliku .env.local.'
        }
    }

    const openai = new OpenAI({ apiKey })

    // Determine target model
    const requestedModel = process.env.OPENAI_MODEL || 'gpt-4o'
    const modelToUse = requestedModel

    // Separate exhibit content assets from visual bug report screenshots
    const isVisualFeedback = (m: AIAttachment) =>
        m.purpose === 'visual_feedback' ||
        m.name.toLowerCase().startsWith('screenshot_') ||
        m.name.toLowerCase().includes('screenshot') ||
        m.name.toLowerCase().includes('pasted_image')

    const contentMaterials = (request.materials || []).filter(m => !isVisualFeedback(m))
    const visualFeedbackItems = [
        ...(request.attachedMedia || []).filter(isVisualFeedback),
        ...(request.materials || []).filter(isVisualFeedback)
    ]
    const uniqueVisualFeedback = visualFeedbackItems.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i)

    const materialsCount = contentMaterials.length
    const materialsDescription = materialsCount > 0
        ? `\n🚨 CRITICAL MANDATE - EXHIBIT CONTENT MEDIA ATTACHMENTS (${materialsCount} assets):
YOU MUST INTEGRATE EVERY SINGLE ONE OF THESE ${materialsCount} EXHIBIT MEDIA ASSETS INTO YOUR HTML OUTPUT.
${contentMaterials.map((m, idx) => `  * Exhibit Asset #${idx + 1} [${m.type.toUpperCase()}]: "${m.name}" => EXACT URL: ${m.url}`).join('\n')}

MANDATORY RULES FOR MULTI-MEDIA INTEGRATION:
- If 1 image is provided: Place it as the main Hero Showcase image.
- If 2 or more images are provided:
  * Place the first image in the Hero Showcase card.
  * Display ALL other images across the page as an interactive Horizontal Snap-Carousel gallery:
    "<div class=\\"space-y-2\\"><div class=\\"flex items-center justify-between\\"><span class=\\"text-xs font-bold uppercase tracking-wider text-amber-400\\">🖼️ Galeria Eksponatów</span><span class=\\"text-[11px] text-neutral-400\\">${contentMaterials.filter(m => m.type === 'image').length} zdjęcia</span></div><div class=\\"flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-1 px-1\\"><div class=\\"relative rounded-2xl overflow-hidden border border-white/10 shrink-0 snap-start w-52 h-36 group\\"><img src=\\"URL\\" class=\\"w-full h-full object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-2 bg-black/70 text-[10px] text-neutral-300\\">Podpis</div></div>...</div></div>"
    OR place individual images inside each corresponding Fact/Artifact card!
- If audio is provided: Add an interactive Audio Guide player card (<audio controls src="URL" class="w-full rounded-xl"></audio>).
- If video is provided: Embed a responsive video player (<video controls playsinline src="URL" class="w-full rounded-2xl"></video>).
- If 3D model is provided: Embed <model-viewer src="URL" ar camera-controls class="w-full h-64 rounded-3xl bg-neutral-900/50"></model-viewer>.
`
        : '\nNo custom exhibit media files uploaded yet.'

    const currentContext = request.currentContent?.custom_html
        ? `\nCURRENT HTML STATE (The user may have manually edited text, images, or copy directly on the preview screen. YOU MUST RESPECT AND PRESERVE all their customized text, wording, image URLs, and modifications unless their latest prompt explicitly asks to replace them):\n\`\`\`html\n${request.currentContent.custom_html}\n\`\`\`\n`
        : request.currentContent?.blocks && request.currentContent.blocks.length > 0
        ? `\nCurrently existing blocks count: ${request.currentContent.blocks.length}\n`
        : ''

    const systemPrompt = `You are a world-class Lead UI/UX Designer and Creative Technologist specialized in luxury museum exhibitions, Apple-grade mobile storytelling apps, and interactive multimedia experiences for Quaris.

YOUR GOAL:
Generate breathtaking, 10/10 UX mobile exhibition screens (width ~390px) that evoke wonder, elegance, and immersion.

CRITICAL DESIGN & UX RULES (NEVER VIOLATE):
1. ZERO OMISSION OF REAL EXHIBIT ASSETS:
   - Every exhibit asset in the EXHIBIT CONTENT MEDIA ATTACHMENTS list must be present in the HTML output.
   - Do NOT just pick one image and discard the rest! If multiple images exist, showcase the first as Hero and build an interactive swipeable Gallery Carousel or 2-column Artifact Grid for the remaining images!

2. NO BORING / DRY PAGES & PERFECT MOBILE READABILITY:
   - NEVER output plain unstyled text, standard HTML bullet lists (<ul><li>), or flat monochrome blocks.
   - Every piece of information must be presented as a visually rich component: Cards with glassmorphism, glowing borders, badge pills, statistic counters, or interactive tap widgets.

3. ATMOSPHERIC BACKGROUNDS & THEME PALETTES:
   - Match the background to the theme:
     * Ancient Egypt / History: Multi-stop rich gold & obsidian gradient:
       "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245, 158, 11, 0.3), transparent 70%), linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)"
     * Space / Sci-Fi / Cosmos: Deep cosmic nebula:
       "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.35), transparent 70%), linear-gradient(180deg, #09090b 0%, #020617 100%)"
     * Art & Culture: Deep velvet / sapphire:
       "radial-gradient(ellipse at 50% 0%, rgba(236, 72, 153, 0.25), transparent 60%), linear-gradient(180deg, #18181b 0%, #09090b 100%)"
     * Nature / Science: Emerald glow:
       "radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.25), transparent 60%), linear-gradient(180deg, #022c22 0%, #020617 100%)"

4. TOTAL CREATIVE & TECHNICAL FREEDOM:
   - You have 100% full freedom to write custom HTML, inline CSS, embedded <style> animations (@keyframes, pulsing glows, floating elements), and JavaScript event handlers (onclick, onchange).

5. COMPONENT ARCHITECTURE & RESPONSIVENESS RULES:
   - EYEBROW BADGE: Pill badge on top (e.g. "<div class=\\"inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md\\"><span>🏛️</span><span>Starożytny Egipt • Krok 1</span></div>")
   - MAJESTIC HERO TITLE: Bold gradient headline (e.g. "<h1 class=\\"text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-amber-100 to-amber-400 bg-clip-text text-transparent leading-tight\\">...</h1>")
   - LEAD PARAGRAPH: Styled lead paragraph with glassmorphic container or accent quote border.
   - HERO MEDIA / IMAGE CARD: Rounded-3xl container with glowing border, aspect ratio, gradient shadow, and badge overlay:
     "<div class=\\"relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group\\"><img src=\\"URL\\" alt=\\"...\\" class=\\"w-full h-56 object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-xs text-neutral-300\\">Caption / Detail</div></div>"
   - MULTI-IMAGE GALLERY / CAROUSEL (When 2+ images exist):
     "<div class=\\"space-y-2\\"><div class=\\"flex items-center justify-between\\"><span class=\\"text-xs font-bold uppercase tracking-wider text-amber-400\\">🖼️ Galeria Eksponatów</span><span class=\\"text-[11px] text-neutral-400\\">Przesuń, by obejrzeć</span></div><div class=\\"flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-1 px-1\\"><div class=\\"relative rounded-2xl overflow-hidden border border-white/10 shrink-0 snap-start w-52 h-36 group\\"><img src=\\"URL_1\\" class=\\"w-full h-full object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-neutral-200\\">Eksponat 1</div></div><div class=\\"relative rounded-2xl overflow-hidden border border-white/10 shrink-0 snap-start w-52 h-36 group\\"><img src=\\"URL_2\\" class=\\"w-full h-full object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-neutral-200\\">Eksponat 2</div></div></div></div>"
   - FACT & HIGHLIGHT CARDS (MANDATORY FULL-WIDTH VERTICAL STACK):
     * NEVER use 2-column grids (grid-cols-2) for cards that contain title + description text! On a ~360px-390px mobile screen, 2 columns squeeze text into narrow 1-word vertical columns.
     * ALL informational cards MUST be stacked vertically in 1 column (w-full, space-y-3.5 or grid grid-cols-1 gap-3.5).
     * Structure: Use horizontal flex with icon on the left and text on the right:
       "<div class=\\"p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg flex items-start gap-3.5 hover:border-amber-500/40 transition-all\\"><div class=\\"w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0\\">💎</div><div class=\\"flex-1 min-w-0\\"><h4 class=\\"font-bold text-sm text-white\\">Tytuł faktu</h4><p class=\\"text-xs text-neutral-300 mt-1 leading-relaxed break-words\\">Opis ciekawostki z pełną szerokością i doskonałą czytelnością...</p></div></div>"
     * 2-column grids (grid-cols-2) are STRICTLY RESTRICTED to micro numerical badges/counters (e.g. 2x2 grid of simple numbers like "146 m" / "2.3M Blocks" with max 3 words).
   - FULLY INTERACTIVE QUIZ WIDGET (With Instant Click Feedback):
     Use inline vanilla JS onclick handlers so user gets instant visual response (color change, score, explanation):
     "<div class=\\"p-5 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-4\\">
        <div class=\\"flex items-center justify-between\\"><span class=\\"text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5\\">⚡ Quiz Eksploratora</span><span class=\\"text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold\\">+50 PKT</span></div>
        <h3 class=\\"font-bold text-sm sm:text-base text-white leading-snug\\">Treść pytania?</h3>
        <div class=\\"space-y-2\\">
          <button type=\\"button\\" onclick=\\"const root=this.closest('.space-y-4'); const fb=root.querySelector('.quiz-fb'); fb.classList.remove('hidden'); fb.innerHTML='<span class=\\'text-emerald-400 font-bold\\'>🎉 Brawo! Prawidłowa odpowiedź!</span> Wyjaśnienie...'; this.classList.add('!bg-emerald-600/30','!border-emerald-500','!text-white'); root.querySelectorAll('button').forEach(b=>b.disabled=true);\\" class=\\"w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 text-xs font-medium text-neutral-200 transition-all flex items-center justify-between group cursor-pointer\\"><span>A) Prawidłowa opcja</span><span class=\\"w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] group-hover:border-amber-400\\">A</span></button>
          <button type=\\"button\\" onclick=\\"const root=this.closest('.space-y-4'); const fb=root.querySelector('.quiz-fb'); fb.classList.remove('hidden'); fb.innerHTML='<span class=\\'text-red-400 font-bold\\'>❌ Niestety nie.</span> Prawidłowa odpowiedź to...'; this.classList.add('!bg-red-600/30','!border-red-500'); root.querySelectorAll('button').forEach(b=>b.disabled=true);\\" class=\\"w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 text-xs font-medium text-neutral-200 transition-all flex items-center justify-between group cursor-pointer\\"><span>B) Błędna opcja</span><span class=\\"w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px]\\">B</span></button>
        </div>
        <div class=\\"quiz-fb hidden p-3.5 rounded-xl bg-neutral-900/90 border border-white/10 text-xs text-neutral-300 shadow-inner\\"></div>
      </div>"
   - INTERACTIVE REVEAL / FUN FACT ACCORDION:
     "<details class=\\"group p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md [&_summary::-webkit-details-marker]:hidden cursor-pointer\\"><summary class=\\"flex items-center justify-between font-bold text-xs text-white\\"><span class=\\"flex items-center gap-2\\"><span>💡</span><span>Sekretna ciekawostka (Kliknij, aby odkryć)</span></span><span class=\\"text-amber-400 transition-transform duration-300 group-open:rotate-180 text-xs\\">▼</span></summary><p class=\\"mt-3 text-xs text-neutral-400 leading-relaxed pt-2.5 border-t border-white/5\\">Ukryta treść ciekawostki...</p></details>"

6. TARGET LANGUAGE:
   - Output all user-visible text, headers, quiz questions, buttons, and explanations in the requested language: "${request.language.toUpperCase()}".

7. VISUAL INSPECTION SCREENSHOTS & BUG REPORTS (STRICT MANDATE):
   - When the user provides a visual bug report screenshot:
     * ⛔ ABSOLUTE BAN: NEVER INSERT THE BUG REPORT SCREENSHOT URL INTO ANY <img src="..."> OR ANY BACKGROUND OF THE GENERATED HTML!
     * 🛡️ IMMUTABILITY: PRESERVE all existing exhibition images and hero image URLs already present in the page HTML.
     * 👁️ VISION ANALYSIS: Use computer vision to observe what styling/layout issue is visible (e.g. text squeezed into narrow vertical columns, bad wrapping, overflowing elements).
     * 🛠️ FIX CODE: Immediately rewrite the HTML/CSS to fix the issue (e.g. replace cramped 2-column cards with full-width stacked cards \`w-full flex-col space-y-3\`, ensure \`flex-1 min-w-0 break-words\`).

${materialsDescription}
${currentContext}

Respond ONLY with a JSON object in this exact format:
{
  "title": "Short title for the stage (e.g. 'Tajemnice Starożytnego Egiptu')",
  "background": {
    "type": "gradient",
    "value": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245, 158, 11, 0.3), transparent 70%), linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)",
    "overlayOpacity": 0
  },
  "custom_html": "<div class=\\"w-full min-h-full px-5 py-6 space-y-6 text-white\\">...entire mobile stage layout...</div>",
  "assistant_reply": "Brief description of what was created or changed."
}
`

    try {
        // Build user content array for multi-modal (vision)
        const userContentParts: any[] = []

        // 1. Reference Image (Style moodboard)
        if (request.referenceImageUrl) {
            userContentParts.push({
                type: 'text',
                text: `[REFERENCE STYLE SCREENSHOT ATTACHED]: Please analyze this reference image and match its design aesthetic, colors, and layout elegance.`
            })
            userContentParts.push({
                type: 'image_url',
                image_url: {
                    url: request.referenceImageUrl,
                    detail: 'high'
                }
            })
        }

        // 2. Visual Bug Report Screenshots (Inspection ONLY - NEVER insert in HTML)
        if (uniqueVisualFeedback.length > 0) {
            for (const m of uniqueVisualFeedback) {
                userContentParts.push({
                    type: 'text',
                    text: `[VISUAL BUG REPORT / INSPECTION SCREENSHOT - DO NOT INSERT INTO HTML]: "${m.name}". The user provided this screenshot to show a bug or layout defect in the current preview. Use vision to inspect what is broken in the layout and fix the CSS/HTML code accordingly. DO NOT use this image URL anywhere in the HTML output!`
                })
                userContentParts.push({
                    type: 'image_url',
                    image_url: {
                        url: m.url,
                        detail: 'high'
                    }
                })
            }
        }

        // 3. New Content Assets explicitly attached in chat to be inserted
        const newContentAssets = (request.attachedMedia || []).filter(m => !isVisualFeedback(m))
        if (newContentAssets.length > 0) {
            for (const m of newContentAssets) {
                userContentParts.push({
                    type: 'text',
                    text: `[NEW EXHIBIT CONTENT ASSET TO INSERT: ${m.type.toUpperCase()}]: "${m.name}" => EXACT URL: ${m.url}. Integrate this asset into the stage layout.`
                })
                if (m.type === 'image') {
                    userContentParts.push({
                        type: 'image_url',
                        image_url: {
                            url: m.url,
                            detail: 'high'
                        }
                    })
                }
            }
        }

        // 4. User Text Prompt
        userContentParts.push({
            type: 'text',
            text: `User Prompt: ${request.prompt}\nTarget Language: ${request.language}`
        })

        // Build messages array
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt }
        ]

        // Add previous conversation if available
        if (request.chatHistory && request.chatHistory.length > 0) {
            for (const msg of request.chatHistory) {
                messages.push({
                    role: msg.role,
                    content: msg.content
                })
            }
        }

        messages.push({
            role: 'user',
            content: userContentParts.length === 1 ? userContentParts[0].text : (userContentParts as any)
        })

        // Construct request params
        const requestParams: any = {
            model: modelToUse,
            messages,
            response_format: { type: 'json_object' }
        }

        // Try passing reasoning_effort if supported or model is o3/o1/terra
        if (modelToUse.startsWith('o') || modelToUse.includes('terra') || modelToUse.includes('reasoning')) {
            requestParams.reasoning_effort = 'medium'
        }

        let completion: OpenAI.Chat.Completions.ChatCompletion

        try {
            completion = await openai.chat.completions.create(requestParams)
        } catch (firstErr: any) {
            console.warn(`Initial call with model ${modelToUse} failed:`, firstErr?.message)
            // Fallback to gpt-4o without reasoning_effort if custom model was rejected
            if (modelToUse !== 'gpt-4o') {
                console.log("Retrying with fallback model gpt-4o...")
                const fallbackParams: any = {
                    model: 'gpt-4o',
                    messages,
                    response_format: { type: 'json_object' }
                }
                completion = await openai.chat.completions.create(fallbackParams)
            } else {
                throw firstErr
            }
        }

        const choice = completion.choices[0]
        const rawContent = choice?.message?.content || '{}'

        let parsed: any = {}
        try {
            parsed = JSON.parse(rawContent)
        } catch (parseErr) {
            console.error("Failed to parse JSON response:", rawContent)
            // Regex fallback to extract json
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0])
            } else {
                parsed = {
                    title: request.currentTitle || 'Wygenerowany Etap',
                    custom_html: `<div class="p-5 text-white">${rawContent}</div>`,
                    assistant_reply: 'Wygenerowano zawartość.'
                }
            }
        }

        // Token usage & cost
        const usage = completion.usage
        const promptTokens = usage?.prompt_tokens || 0
        const completionTokens = usage?.completion_tokens || 0
        const totalTokens = usage?.total_tokens || (promptTokens + completionTokens)
        const reasoningTokens = (usage as any)?.completion_tokens_details?.reasoning_tokens || 0
        const estimatedCostUsd = calculateCost(completion.model || modelToUse, promptTokens, completionTokens)

        const tokenUsage: AITokenUsage = {
            promptTokens,
            completionTokens,
            reasoningTokens,
            totalTokens,
            estimatedCostUsd,
            modelUsed: completion.model || modelToUse
        }

        return {
            success: true,
            title: parsed.title || request.currentTitle || 'AI Generated Stage',
            background: parsed.background || {
                type: 'gradient',
                value: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
                overlayOpacity: 0.1
            },
            custom_html: parsed.custom_html || '',
            message: parsed.assistant_reply || 'Pomyślnie wygenerowano nowy projekt etapu.',
            tokenUsage
        }
    } catch (err: any) {
        console.error("AI Generation Error:", err)
        return {
            success: false,
            error: err?.message || 'Wystąpił błąd podczas komunikacji z OpenAI.'
        }
    }
}
