'use server'

import OpenAI from 'openai'
import { AIAttachment, AIGenerationRequest, AIGenerationResponse, AITokenUsage } from '@/types/schema'
import { COMPOSITION_ARCHETYPES, PromptEnhancementRequest, PromptEnhancementResponse } from '@/lib/ai-archetypes'

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
    const systemPrompt = `You are a world-class Lead UI/UX Designer and Creative Technologist specialized in luxury Apple-grade mobile storytelling apps, interactive multimedia journeys, brand showcases, city tours, educational quests, and immersive experiences for Quaris.

YOUR GOAL:
Generate breathtaking, 10/10 UX mobile screens (width ~390px) for ANY topic (Technology, Science, Space, Nature, Animals, City Guides, Brands, Art, History, Pop Culture) that evoke wonder, elegance, and immersion.

CRITICAL DESIGN RULE - 15 BESPOKE COMPOSITION ARCHETYPES (AVOID MONOTONY):
NEVER generate the same linear cookie-cutter layout for every stage!
Dynamically select or synthesize one of the following 15 proven Editorial & Interactive Archetypes that best suits the topic:
1. 🏛️ Curatorial Deep-Dive: Ambient Spotlight -> Hero Artwork Showcase -> Curatorial Quote Block -> Audio Guide Player -> 3:4 Portrait Gallery -> Scratch Card Secret Reveal.
2. ⚡ Gamified Quest & Challenge: XP Difficulty Eyebrow -> Dramatic Story Hook -> Scratch-to-reveal Clue -> 2-Question Interactive Quiz with immediate score -> 2x2 Stats Grid.
3. 📊 Technical Blueprint & Specs: Blueprint Schematic Hero -> 2x2 Key Numerical Metrics (e.g. 146m, 3.2M lbs, 98%) -> Technical Parameter Cards -> Telemetry Audio Player.
4. 📖 Timeline Chronicle & Journey: Narrative Prologue -> Numbered Milestone Cards (Phase 01, Phase 02, Phase 03) -> Evolution Photo Gallery -> Key Takeaway.
5. 🖼️ Visual Magazine & Spotlight: Editorial Minimalist Headline -> Large Portrait 3:4 Showcase -> Curatorial Note -> Feature Pill Badges.
6. 🕵️ Mystery & Classified Dossier: Classified Red/Amber Badge -> Dossier Intro -> Scratch Card Evidence Decipher -> Witness Quote -> Deduction Quiz.
7. 🎙️ Audio-First Story & Podcast: Hero Audio Guide Player at the TOP -> Atmospheric Synopsis -> Synced Visual Cards -> Curatorial Quote.
8. ⚔️ Versus Comparison: Bold "VS" Split Headline -> Side-by-Side Comparison Cards -> Key Comparison Stats -> Interactive Voting Quiz.
9. 🌌 Cosmic Explorer Atlas: Deep Space Nebula Header -> Celestial Metrics (AU / Mass) -> Orbit Image Card -> Swipeable Galaxy Gallery -> Astronomical Fact Scratch Card.
10. 📜 Myth, Lore & Ancient Legend: Ancient Era Badge -> Folklore Prologue -> Mythological Artifact -> Ancient Prophecy Quote -> Myth Lore Quiz.
11. 🌿 Nature Expedition & Fauna: Species Taxonomy Eyebrow -> Wildlife Portrait Hero -> Habitat & Diet Cards -> Camouflage Scratch Card -> Nature Sound Audio.
12. 🧬 Science Lab & Discovery: Hypothesis Header -> Step-by-Step Experiment Cards -> Reaction Metrics -> "What happens next?" Quiz.
13. 🗺️ City Guide & Heritage Trail: City & Stop Eyebrow -> Itinerary Highlights (Stop 01-03) -> Architectural Gallery -> Local Secret Quote.
14. 🎨 Art Retrospective & Exhibition: Artist Era Header -> Masterpiece Showcase (Contain+Blur) -> Art Critique Quote -> Symbolism Cards -> Underdrawing Scratch Card.
15. 💡 Innovation Spotlight & Pitch: Breakthrough Eyebrow -> Problem vs Solution Cards -> 2x2 Impact Metrics -> Visionary Founder Quote -> Pitch Audio Player.

CRITICAL DESIGN & UX RULES (NEVER VIOLATE):
1. ZERO OMISSION OF REAL USER / MEDIA ASSETS:
   - Every asset in the CONTENT MEDIA ATTACHMENTS list must be present in the HTML output.
   - Do NOT just pick one image and discard the rest! If multiple images exist, showcase the first as Hero and build an interactive swipeable Gallery Carousel or 2-column Grid for the remaining images!

2. NO BORING / DRY PAGES & PERFECT MOBILE READABILITY:
   - NEVER output plain unstyled text, standard HTML bullet lists (<ul><li>), or flat monochrome blocks.
   - Every piece of information must be presented as a visually rich component: Cards with glassmorphism, glowing borders, badge pills, statistic counters, or interactive tap widgets.

3. ATMOSPHERIC BACKGROUNDS & THEME PALETTES:
   - Match the background to the theme using one of our 10 luxury palettes & 9 distribution patterns:
     * Technology / Space: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(30, 58, 138, 0.45) 0%, transparent 70%), linear-gradient(180deg, #020617 0%, #000000 100%)"
     * Nature / Wildlife: "radial-gradient(ellipse 95% 55% at 50% 115%, rgba(6, 95, 70, 0.45) 0%, transparent 70%), linear-gradient(180deg, #021e17 0%, #000000 100%)"
     * Luxury / Gold / Heritage: "linear-gradient(135deg, rgba(120, 53, 15, 0.45) 0%, #0a0a0a 55%, #000000 100%)"
     * Ocean / Cyan: "radial-gradient(circle at 20% 20%, rgba(14, 116, 144, 0.45) 0%, transparent 45%), linear-gradient(180deg, #020617 0%, #000000 100%)"
     * Cosmic Violet: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(88, 28, 135, 0.45) 0%, transparent 70%), linear-gradient(180deg, #0f0728 0%, #000000 100%)"

4. TOTAL CREATIVE & TECHNICAL FREEDOM:
   - You have 100% full freedom to write custom HTML, inline CSS, embedded <style> animations (@keyframes, pulsing glows, floating elements), and JavaScript event handlers (onclick, onchange).

5. COMPONENT ARCHITECTURE & RESPONSIVENESS RULES:
   - EYEBROW BADGE: Pill badge on top (e.g. "<div class=\\"inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md\\"><span>🚀</span><span>SpaceX • Step 1</span></div>")
   - MAJESTIC HERO TITLE: Bold gradient headline (e.g. "<h1 class=\\"text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-amber-100 to-amber-400 bg-clip-text text-transparent leading-tight\\">...</h1>")
   - LEAD PARAGRAPH: Styled lead paragraph with glassmorphic container or accent quote border.
   - HERO MEDIA / IMAGE CARD: Rounded-3xl container with glowing border, aspect ratio, gradient shadow, and badge overlay:
     "<div class=\\"relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group\\"><img src=\\"URL\\" alt=\\"...\\" class=\\"w-full h-56 object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-xs text-neutral-300\\">Caption / Detail</div></div>"
   - MULTI-IMAGE GALLERY / CAROUSEL (When 2+ images exist):
     "<div class=\\"space-y-2\\"><div class=\\"flex items-center justify-between\\"><span class=\\"text-xs font-bold uppercase tracking-wider text-amber-400\\">🖼️ Media Gallery</span><span class=\\"text-[11px] text-neutral-400\\">Swipe to explore</span></div><div class=\\"flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-1 px-1\\"><div class=\\"relative rounded-2xl overflow-hidden border border-white/10 shrink-0 snap-start w-52 h-36 group\\"><img src=\\"URL_1\\" class=\\"w-full h-full object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-neutral-200\\">Detail 1</div></div><div class=\\"relative rounded-2xl overflow-hidden border border-white/10 shrink-0 snap-start w-52 h-36 group\\"><img src=\\"URL_2\\" class=\\"w-full h-full object-cover\\" /><div class=\\"absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-neutral-200\\">Detail 2</div></div></div></div>"
   - FACT & HIGHLIGHT CARDS (MANDATORY FULL-WIDTH VERTICAL STACK):
     * NEVER use 2-column grids (grid-cols-2) for cards that contain title + description text! On a ~360px-390px mobile screen, 2 columns squeeze text into narrow 1-word vertical columns.
     * ALL informational cards MUST be stacked vertically in 1 column (w-full, space-y-3.5 or grid grid-cols-1 gap-3.5).
     * Structure: Use horizontal flex with icon on the left and text on the right:
       "<div data-component=\\"fact_card\\" class=\\"p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg flex items-start gap-3.5 hover:border-amber-500/40 transition-all\\"><div class=\\"w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0\\">💎</div><div class=\\"flex-1 min-w-0\\"><h4 class=\\"font-bold text-sm text-white\\">Key Highlight</h4><p class=\\"text-xs text-neutral-300 mt-1 leading-relaxed break-words\\">Clear, engaging description with full width and excellent readability...</p></div></div>"
     * 2-column grids (grid-cols-2) are STRICTLY RESTRICTED to micro numerical badges/counters (e.g. 2x2 grid of simple numbers like "146 m" / "2.3M Users" with max 3 words).
   - FULLY INTERACTIVE QUIZ WIDGET (With Instant Click Feedback):
     Use inline vanilla JS onclick handlers so user gets instant visual response (color change, score, explanation):
     "<div data-component=\\"quiz\\" class=\\"p-5 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-4\\">
        <div class=\\"flex items-center justify-between\\"><span class=\\"text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5\\">⚡ Explorer Quiz</span><span class=\\"text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold\\">+50 PTS</span></div>
        <h3 class=\\"font-bold text-sm sm:text-base text-white leading-snug\\">Question text?</h3>
        <div class=\\"space-y-2\\">
          <button type=\\"button\\" onclick=\\"const root=this.closest('.space-y-4'); const fb=root.querySelector('.quiz-fb'); fb.classList.remove('hidden'); fb.innerHTML='<span class=\\'text-emerald-400 font-bold\\'>🎉 Correct!</span> Explanation...'; this.classList.add('!bg-emerald-600/30','!border-emerald-500','!text-white'); root.querySelectorAll('button').forEach(b=>b.disabled=true);\\" class=\\"w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 text-xs font-medium text-neutral-200 transition-all flex items-center justify-between group cursor-pointer\\"><span>A) Correct Option</span><span class=\\"w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] group-hover:border-amber-400\\">A</span></button>
          <button type=\\"button\\" onclick=\\"const root=this.closest('.space-y-4'); const fb=root.querySelector('.quiz-fb'); fb.classList.remove('hidden'); fb.innerHTML='<span class=\\'text-red-400 font-bold\\'>❌ Not quite.</span> The correct answer is...'; this.classList.add('!bg-red-600/30','!border-red-500'); root.querySelectorAll('button').forEach(b=>b.disabled=true);\\" class=\\"w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 text-xs font-medium text-neutral-200 transition-all flex items-center justify-between group cursor-pointer\\"><span>B) Incorrect Option</span><span class=\\"w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px]\\">B</span></button>
        </div>
        <div class=\\"quiz-fb hidden p-3.5 rounded-xl bg-neutral-900/90 border border-white/10 text-xs text-neutral-300 shadow-inner\\"></div>
      </div>"
    - INTERACTIVE CANVAS SCRATCH CARD (Authentic rub-to-reveal canvas with metallic foil & particle celebration):
      "<div data-component=\\"scratch_card\\" data-foil=\\"silver\\" data-cover=\\"%F0%9F%AA%99%20SCRATCH%20TO%20REVEAL\\" data-sub=\\"(Rub%20with%20finger%20or%20mouse)\\" class=\\"relative my-3 rounded-3xl overflow-hidden border border-amber-500/40 bg-neutral-950 shadow-2xl group/scratch select-none\\" style=\\"min-height: 230px;\\"><div class=\\"scratch-hidden-content p-5 flex flex-col items-center justify-center text-center space-y-3 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black min-h-[230px]\\"><img class=\\"scratch-hidden-img w-full max-h-48 object-cover rounded-2xl border border-white/10 shadow-lg\\" src=\\"IMAGE_URL\\" alt=\\"Secret Reveal\\" /><div class=\\"space-y-1\\"><span class=\\"inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold\\">+50 PTS</span><h4 class=\\"font-bold text-sm sm:text-base text-white scratch-hidden-title\\">Secret Detail Revealed</h4><p class=\\"text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto scratch-hidden-desc\\">Secret revealed detail...</p></div></div><canvas class=\\"scratch-canvas absolute inset-0 w-full h-full cursor-crosshair touch-none z-20\\"></canvas></div>"

6. TARGET LANGUAGE:
   - Output all user-visible text, headers, quiz questions, buttons, and explanations in the requested language: "${request.language.toUpperCase()}".

7. ZERO CONTENT LOSS ON REFINEMENTS (MANDATORY):
   - When modifying an existing screen from CURRENT HTML STATE (e.g. changing background, tweaking text, styling adjustments, adding quiz/audio):
     * YOU MUST PRESERVE 100% of all existing headlines, stories, highlight cards, galleries, and widgets from the CURRENT HTML STATE.
     * NEVER output an empty layout, stripped content, or placeholder '...'.
     * If the user asks to change background (e.g. "zmień tło na takie" or "change background to deep blue"):
       - Return the new background in "background" (e.g. background: { type: "image", value: "URL", overlayOpacity: 0.35 } or background: { type: "gradient", value: "..." }).
       - KEEP ALL existing custom_html sections completely intact and fully styled!

8. ATTACHED IMAGES & BACKGROUND REQUESTS:
   - If the user attaches an image and asks to use it as background (e.g. "zmień tło na takie"):
     * Set "background": { "type": "image", "value": "EXACT_ATTACHED_IMAGE_URL", "overlayOpacity": 0.35 }
     * Maintain all existing custom_html elements so text remains readable over the new background.
   - If the user provides a visual bug report screenshot:
     * Inspect with vision to diagnose and fix layout/CSS issues. Do NOT replace images.

${request.generateImages ? `
9. 🚨 AI IMAGE GENERATION (DALL-E) ENABLED:
The user specifically requested automatic AI image generation for this stage.
You must plan 2 to 3 bespoke photographs/illustrations:
1. Hero Showcase Image (role: "hero")
2. First Gallery / Detail Image (role: "gallery")
3. Second Gallery / Detail Image (role: "gallery")

CRITICAL COMPOSITION & CROPPING RULE FOR DALL-E PROMPTS:
- All image prompts must request a **medium-wide or medium shot** with **generous negative space / breathing room around all edges**.
- The main subject (rocket, person, artifact, statue, celestial body) must be centered and completely enclosed within the frame, NEVER touching the borders or cut off at the top/bottom.
- Avoid extreme close-ups or cropped top/bottom compositions.

In your JSON output:
1. Include an "image_prompts" array:
   "image_prompts": [
     {
       "id": "hero_img",
       "title": "Short title of hero image",
       "prompt": "Centered medium shot with generous margin breathing room, highly detailed photorealistic 8k cinematic shot in English with atmospheric lighting...",
       "role": "hero"
     },
     {
       "id": "gallery_img_1",
       "title": "Short title of first detail image",
       "prompt": "Centered medium shot with ample negative space around subject, high-fidelity photograph in English...",
       "role": "gallery"
     },
     {
       "id": "gallery_img_2",
       "title": "Short title of second detail image",
       "prompt": "Centered shot with generous margin padding, highly detailed photorealistic photograph in English...",
       "role": "gallery"
     }
   ]
2. In your "custom_html", insert the images using exact placeholder src tags:
   - For hero: <img src="__AI_IMAGE_hero_img__" alt="..." class="w-full aspect-[4/3] rounded-3xl object-cover shadow-2xl border border-white/10" />
   - For gallery 1: <img src="__AI_IMAGE_gallery_img_1__" alt="..." class="w-full h-full object-cover object-center" />
   - For gallery 2: <img src="__AI_IMAGE_gallery_img_2__" alt="..." class="w-full h-full object-cover object-center" />
` : ''}

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
  "assistant_reply": "Brief description of what was created or changed."${request.generateImages ? `,\n  "image_prompts": [\n    {\n      "id": "hero_img",\n      "title": "Hero Image Title",\n      "prompt": "Detailed photorealistic 8k prompt in English...",\n      "role": "hero"\n    }\n  ]` : ''}
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

        // 2. Attached Media (Backgrounds, exhibit photos, or inspection screenshots)
        if (request.attachedMedia && request.attachedMedia.length > 0) {
            for (const m of request.attachedMedia) {
                if (m.purpose === 'visual_feedback') {
                    userContentParts.push({
                        type: 'text',
                        text: `[ATTACHED SCREENSHOT / VISUAL FEEDBACK: "${m.name}" => URL: ${m.url}]: Use vision to inspect layout bugs. If user prompt specifically asks to use this image as background (e.g. 'zmień tło na takie'), set background.type = 'image', background.value = '${m.url}', overlayOpacity = 0.35 while keeping all custom_html intact!`
                    })
                } else {
                    userContentParts.push({
                        type: 'text',
                        text: `[ATTACHED MEDIA ASSET: ${m.type.toUpperCase()} "${m.name}" => EXACT URL: ${m.url}]: If user asks to use this as background or insert into page, use this exact URL.`
                    })
                }

                if (m.type === 'image' && (m.url.startsWith('http') || m.url.startsWith('data:image/'))) {
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

        // 3. User Text Prompt
        userContentParts.push({
            type: 'text',
            text: `User Prompt: ${request.prompt}\nTarget Language: ${request.language}${request.generateImages ? '\n[NOTE: Generate 2-3 AI image prompts in image_prompts and insert placeholders __AI_IMAGE_...__ into HTML]' : ''}`
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

        // Add current user prompt
        messages.push({
            role: 'user',
            content: userContentParts
        })

        // Construct request params
        const requestParams: any = {
            model: modelToUse,
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000
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

        let finalCustomHtml = parsed.custom_html || ''
        const generatedAttachments: AIAttachment[] = []
        let totalImageCost = 0
        let generatedImageCount = 0

        // Handle AI Image Generation if requested
        if (request.generateImages && Array.isArray(parsed.image_prompts) && parsed.image_prompts.length > 0) {
            const promptsToGenerate = parsed.image_prompts.slice(0, 3)
            for (let idx = 0; idx < promptsToGenerate.length; idx++) {
                const imgItem = promptsToGenerate[idx]
                const rawPrompt = typeof imgItem === 'string' ? imgItem : imgItem.prompt
                if (!rawPrompt) continue

                const framingSuffix = ", medium wide shot, centered subject with generous breathing room and safe margin padding on all sides, no edge clipping, complete subject in frame, 8k cinematic photography"
                const promptText = rawPrompt.includes('breathing room') || rawPrompt.includes('safe margin')
                    ? rawPrompt
                    : `${rawPrompt}${framingSuffix}`

                try {
                    // Use native OpenAI image models (gpt-image-1-mini / gpt-image-1)
                    let imgRes: any
                    try {
                        imgRes = await openai.images.generate({
                            model: 'gpt-image-1-mini',
                            prompt: promptText,
                            n: 1,
                            size: '1024x1024'
                        })
                    } catch (genErr1) {
                        console.warn("gpt-image-1-mini failed, trying gpt-image-1:", genErr1)
                        imgRes = await openai.images.generate({
                            model: 'gpt-image-1',
                            prompt: promptText,
                            n: 1,
                            size: '1024x1024'
                        })
                    }

                    const b64Data = imgRes.data?.[0]?.b64_json
                    const tempUrl = imgRes.data?.[0]?.url

                    let permanentUrl: string | null = null

                    if (b64Data || tempUrl) {
                        try {
                            const imageBuffer = b64Data
                                ? Buffer.from(b64Data, 'base64')
                                : Buffer.from(new Uint8Array(await (await fetch(tempUrl!)).arrayBuffer()))

                            const adminSupabase = await createAdminClient()
                            const timestamp = Date.now()
                            const shortHash = Math.random().toString(36).substring(2, 7)
                            const safeName = ((typeof imgItem === 'object' && imgItem.title) || `ai_image_${idx + 1}`)
                                .replace(/[^a-zA-Z0-9_\-]/g, '_')
                                .toLowerCase()
                                .substring(0, 40)
                            const filePath = `ai-generated/${session?.userId || 'curator'}/${safeName}_${timestamp}_${shortHash}.png`

                            const { error: uploadError } = await adminSupabase.storage
                                .from('assets')
                                .upload(filePath, imageBuffer, {
                                    contentType: 'image/png',
                                    upsert: true
                                })

                            if (!uploadError) {
                                const { data: { publicUrl } } = adminSupabase.storage
                                    .from('assets')
                                    .getPublicUrl(filePath)
                                permanentUrl = publicUrl
                            } else {
                                console.warn("Supabase upload error:", uploadError)
                                permanentUrl = tempUrl || (b64Data ? `data:image/png;base64,${b64Data}` : null)
                            }
                        } catch (storageErr) {
                            console.warn("Storage upload exception:", storageErr)
                            permanentUrl = tempUrl || (b64Data ? `data:image/png;base64,${b64Data}` : null)
                        }

                        if (permanentUrl) {
                            const attachment: AIAttachment = {
                                id: Math.random().toString(36).substring(2, 9),
                                name: `${(typeof imgItem === 'object' && imgItem.title) || `AI Image ${idx + 1}`}.png`,
                                type: 'image',
                                url: permanentUrl,
                                purpose: 'content_asset'
                            }
                            generatedAttachments.push(attachment)

                            // Replace placeholder in custom_html
                            if (typeof imgItem === 'object' && imgItem.id) {
                                const placeholder = `__AI_IMAGE_${imgItem.id}__`
                                finalCustomHtml = finalCustomHtml.replaceAll(placeholder, permanentUrl)
                            }

                            // Also replace generic role placeholders
                            if (idx === 0) {
                                finalCustomHtml = finalCustomHtml
                                    .replaceAll('__AI_IMAGE_hero__', permanentUrl)
                                    .replaceAll('__AI_IMAGE_hero_img__', permanentUrl)
                            } else if (idx === 1) {
                                finalCustomHtml = finalCustomHtml
                                    .replaceAll('__AI_IMAGE_gallery_1__', permanentUrl)
                                    .replaceAll('__AI_IMAGE_gallery_img_1__', permanentUrl)
                            } else if (idx === 2) {
                                finalCustomHtml = finalCustomHtml
                                    .replaceAll('__AI_IMAGE_gallery_2__', permanentUrl)
                                    .replaceAll('__AI_IMAGE_gallery_img_2__', permanentUrl)
                            }

                            // Cost tracking: gpt-image-1-mini is $0.020 per image
                            totalImageCost += 0.020
                            generatedImageCount += 1
                        }
                    }
                } catch (dalleErr) {
                    console.error("AI image generation error for prompt:", promptText, dalleErr)
                }
            }

            // Replace any remaining unreplaced image placeholders with the first generated image
            if (generatedAttachments.length > 0) {
                finalCustomHtml = finalCustomHtml.replace(/__AI_IMAGE_[a-zA-Z0-9_\-]+__/g, generatedAttachments[0].url)
            }
        }

        // Token usage & cost
        const usage = completion.usage
        const promptTokens = usage?.prompt_tokens || 0
        const completionTokens = usage?.completion_tokens || 0
        const totalTokens = usage?.total_tokens || (promptTokens + completionTokens)
        const reasoningTokens = (usage as any)?.completion_tokens_details?.reasoning_tokens || 0
        const rawModelCost = calculateCost(completion.model || modelToUse, promptTokens, completionTokens)
        const estimatedCostUsd = Number((rawModelCost + totalImageCost).toFixed(4))

        const tokenUsage: AITokenUsage = {
            promptTokens,
            completionTokens,
            reasoningTokens,
            totalTokens,
            estimatedCostUsd,
            modelUsed: completion.model || modelToUse,
            imagesCostUsd: totalImageCost > 0 ? Number(totalImageCost.toFixed(4)) : undefined,
            imagesCount: generatedImageCount > 0 ? generatedImageCount : undefined
        }

        return {
            success: true,
            title: parsed.title || request.currentTitle || 'AI Generated Stage',
            background: parsed.background || {
                type: 'gradient',
                value: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
                overlayOpacity: 0.1
            },
            custom_html: finalCustomHtml,
            message: parsed.assistant_reply || (generatedImageCount > 0
                ? `Wygenerowano projekt etapu wraz z ${generatedImageCount} zdjęciami AI (DALL-E 3).`
                : 'Pomyślnie wygenerowano nowy projekt etapu.'),
            tokenUsage,
            generatedImages: generatedAttachments.length > 0 ? generatedAttachments : undefined
        }
    } catch (err: any) {
        console.error("AI Generation Error:", err)
        return {
            success: false,
            error: err?.message || 'Wystąpił błąd podczas komunikacji z OpenAI.'
        }
    }
}

export async function enhancePromptWithAI(request: PromptEnhancementRequest): Promise<PromptEnhancementResponse> {
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
                error: 'Dostępne wyłącznie dla konta curator_demo.'
            }
        }
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        return { success: false, error: 'Brak klucza API OpenAI.' }
    }

    const openai = new OpenAI({ apiKey })

    const archetypesCatalogue = COMPOSITION_ARCHETYPES.map(a => `- ${a.icon} [${a.id}] "${a.name}": ${a.desc} (Layout: ${a.layoutInstruction})`).join('\n')

    const systemPrompt = `You are a World-Class Lead Creative Technologist & Prompt Engineering Maestro for Quaris (a luxury interactive second-screen museum & storytelling web app).
Your mission: Transform a brief user prompt into an atmospheric, masterpiece-level prompt by applying one of our 15 DISTINCT COMPOSITION ARCHETYPES.

NEVER OUTPUT A GENERIC PREDICTABLE STRUCTURE. Each archetype has its own unique narrative rhythm, component order, and storytelling mood.

AVAILABLE 15 COMPOSITION ARCHETYPES:
${archetypesCatalogue}

INSTRUCTIONS:
1. ARCHETYPE SELECTION:
   - If user explicitly requested an archetype ID (${request.archetype && request.archetype !== 'auto' ? `"${request.archetype}"` : 'or auto-selected'}), use that archetype.
   - Otherwise, dynamically choose the archetype that best matches the topic's emotional resonance and domain.
2. BESPOKE COMPOSITION STRUCTURE:
   - Describe what components should appear on the screen in natural, descriptive prose (e.g. hero visual with title, interactive quiz or rub-to-reveal card, audio guide player, gallery, or telemetry metrics).
3. THEMATIC ATMOSPHERE:
   - Integrate rich visual lighting & atmosphere (e.g. Deep Space Nebula, Mars Crimson, Obsidian & Gold Amber, Emerald Forest, Arctic Cyan).
4. TONE & POLISH:
   - Engaging, punchy, Apple-level creative polish.
5. LANGUAGE:
   - Write in the exact same language as the user's input (Polish -> Polish, English -> English).
6. STRICT OUTPUT FORMAT:
   - Output ONLY the pure narrative prompt ready to be pasted directly into the textarea.
   - NEVER output internal archetype tags, archetype IDs, category names (e.g. do NOT output "[science_lab]", "Archetype: ...", "Atmospheric Theme: ...", or "Enhanced Prompt:").
   - Start immediately with the narrative brief description.`

    try {
        const targetArchetype = request.archetype && request.archetype !== 'auto'
            ? COMPOSITION_ARCHETYPES.find(a => a.id === request.archetype)
            : null

        const userMsg = targetArchetype
            ? `Original brief: "${request.prompt}"\nForced Archetype: "${targetArchetype.name}" (${targetArchetype.id})\nLanguage: ${request.language || 'auto'}`
            : `Original brief: "${request.prompt}"\nLanguage: ${request.language || 'auto'}\nPlease compose a rich, enhanced creative prompt for this stage.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMsg }
            ],
            temperature: 0.7,
            max_tokens: 600
        })

        let enhancedText = response.choices[0]?.message?.content?.trim()
        if (!enhancedText) {
            return { success: false, error: 'Empty response from prompt enhancer.' }
        }

        // Clean any accidental meta headers
        enhancedText = enhancedText
            .replace(/^[\s\S]*?(?:Enhanced Prompt:|Ulepszony prompt:)\s*/i, '')
            .replace(/^(\[.+?\]|🧬|🏛️|⚡|📊|📖|🖼️|🕵️|🎙️|⚔️|🌌|📜|🌿|🗺️|🎨|💡)\s*["'][^"']+["']:[^\n]+\n+/i, '')
            .replace(/^Atmospheric Theme:[^\n]+\n+/i, '')
            .trim()

        return {
            success: true,
            enhancedPrompt: enhancedText,
            selectedArchetype: targetArchetype?.name
        }
    } catch (err: any) {
        console.error("Enhance prompt error:", err)
        return { success: false, error: err.message || 'Failed to enhance prompt.' }
    }
}
