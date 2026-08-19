export interface BlueprintStep {
    icon: string
    label: string
}

export interface CompositionArchetype {
    id: string
    name: string
    icon: string
    category: 'museum' | 'interactive' | 'editorial' | 'science'
    categoryLabel: string
    desc: string
    colorTheme: string
    highlightTags: string[]
    blueprint: BlueprintStep[]
    layoutInstruction: string
}

export const COMPOSITION_ARCHETYPES: CompositionArchetype[] = [
    {
        id: 'curatorial',
        name: 'Curatorial Deep-Dive',
        icon: '🏛️',
        category: 'museum',
        categoryLabel: 'Museum & Exhibition',
        desc: 'Cinematic hero artwork, curatorial quote block, audio guide player, portrait gallery & secret reveal.',
        colorTheme: 'Gold Velvet & Obsidian (#f59e0b)',
        highlightTags: ['Hero Artwork', 'Curator Quote', 'Audio Player', 'Portrait Gallery', 'Scratch Reveal'],
        blueprint: [
            { icon: '✨', label: 'Top Spotlight' },
            { icon: '🖼️', label: 'Hero Artwork' },
            { icon: '💬', label: 'Curator Quote' },
            { icon: '🎧', label: 'Audio Guide' },
            { icon: '🖼️', label: '3:4 Gallery' },
            { icon: '🎟️', label: 'Scratch Reveal' }
        ],
        layoutInstruction: 'Top Spotlight Ambient -> Hero Showcase -> Curatorial Quote -> Audio Guide Player -> Portrait Artifact Gallery -> Scratch Card Reveal'
    },
    {
        id: 'quest',
        name: 'Gamified Quest & Challenge',
        icon: '⚡',
        category: 'interactive',
        categoryLabel: 'Gamified & Interactive',
        desc: 'XP badge & difficulty, story hook, rub-to-reveal clue card, 2-question interactive quiz & stats counters.',
        colorTheme: 'Cyber Neon & Purple (#a855f7)',
        highlightTags: ['XP Badge', 'Clue Scratch', '2-Step Quiz', 'Stats Grid (+50 PTS)'],
        blueprint: [
            { icon: '🏆', label: 'XP Difficulty' },
            { icon: '📖', label: 'Story Hook' },
            { icon: '🎟️', label: 'Scratch Clue' },
            { icon: '⚡', label: 'Interactive Quiz' },
            { icon: '📊', label: '2x2 Stats' }
        ],
        layoutInstruction: 'XP Difficulty Eyebrow -> Hook Story -> Scratch-to-reveal Clue -> 2-Question Interactive Quiz -> 2x2 Stats Grid'
    },
    {
        id: 'blueprint',
        name: 'Technical Blueprint & Specs',
        icon: '📊',
        category: 'science',
        categoryLabel: 'Science & Engineering',
        desc: 'Blueprint schematic hero, 2x2 key metrics grid (speed, payload, year), monospace specs, and telemetry audio.',
        colorTheme: 'Cyan Bioluminescence (#06b6d4)',
        highlightTags: ['Schematic Hero', '2x2 Metrics Grid', 'Spec Parameters', 'Telemetry Audio'],
        blueprint: [
            { icon: '📐', label: 'Blueprint Hero' },
            { icon: '📊', label: '2x2 Metrics' },
            { icon: '📑', label: 'Spec Cards' },
            { icon: '📻', label: 'Telemetry Audio' }
        ],
        layoutInstruction: 'Blueprint Hero Card -> 2x2 Key Numerical Metrics Grid -> Technical Param Cards -> Telemetry Audio Narration'
    },
    {
        id: 'timeline',
        name: 'Timeline Chronicle & Journey',
        icon: '📖',
        category: 'editorial',
        categoryLabel: 'Narrative & Journey',
        desc: 'Phase-by-phase chronological story (Phase 01, Phase 02, Phase 03) with gradient badges & evolution gallery.',
        colorTheme: 'Titanium Graphite & Slate (#64748b)',
        highlightTags: ['Chronicle Prologue', 'Numbered Phases', 'Evolution Gallery', 'Key Takeaway'],
        blueprint: [
            { icon: '📜', label: 'Prologue' },
            { icon: '1️⃣', label: 'Phase 01-03 Cards' },
            { icon: '🖼️', label: 'Evolution Gallery' },
            { icon: '💡', label: 'Takeaway' }
        ],
        layoutInstruction: 'Narrative Prologue -> Numbered Milestone Cards (Phase 01-03) -> Evolution Photo Gallery -> Key Takeaway'
    },
    {
        id: 'magazine',
        name: 'Visual Magazine & Spotlight',
        icon: '🖼️',
        category: 'editorial',
        categoryLabel: 'Editorial & Spotlight',
        desc: 'Vogue/NatGeo editorial typography, 3:4 portrait photo focus with captions, and pill highlight tags.',
        colorTheme: 'Solar Sunset & Amber (#f97316)',
        highlightTags: ['Editorial Typography', '3:4 Large Photo', 'Pill Tags', 'Curatorial Note'],
        blueprint: [
            { icon: '🏷️', label: 'Pill Tags' },
            { icon: '📰', label: 'Editorial Title' },
            { icon: '🖼️', label: 'Large 3:4 Frame' },
            { icon: '📝', label: 'Curator Note' }
        ],
        layoutInstruction: 'Editorial Minimalist Headline -> Large Portrait 3:4 Showcase -> Curatorial Note -> Feature Pill Badges'
    },
    {
        id: 'mystery',
        name: 'Mystery & Classified Dossier',
        icon: '🕵️',
        category: 'interactive',
        categoryLabel: 'Gamified & Interactive',
        desc: 'Classified red/amber warning badge, secret dossier intro, scratch card to decipher evidence & deduction quiz.',
        colorTheme: 'Mars Crimson & Carbon (#ef4444)',
        highlightTags: ['Top Secret Badge', 'Dossier Intro', 'Evidence Scratch', 'Deduction Quiz'],
        blueprint: [
            { icon: '🔴', label: 'Classified Badge' },
            { icon: '📁', label: 'Secret Dossier' },
            { icon: '🎟️', label: 'Scratch Decipher' },
            { icon: '💬', label: 'Witness Quote' },
            { icon: '🔍', label: 'Deduction Quiz' }
        ],
        layoutInstruction: 'Classified Badge -> Dossier Intro -> Scratch Card Evidence Decipher -> Witness Quote -> Deduction Quiz'
    },
    {
        id: 'audio_doc',
        name: 'Audio-First Story & Podcast',
        icon: '🎙️',
        category: 'museum',
        categoryLabel: 'Museum & Exhibition',
        desc: 'Large prominent Audio Guide player hero at the very top, atmospheric backdrop, and chapter sync cards.',
        colorTheme: 'Deep Space Navy (#3b82f6)',
        highlightTags: ['Top Audio Player', 'Atmospheric Synopsis', 'Synced Cards', 'Curator Quote'],
        blueprint: [
            { icon: '🎧', label: 'HERO Audio Player (Top)' },
            { icon: '📖', label: 'Story Synopsis' },
            { icon: '🖼️', label: 'Synced Visual Cards' },
            { icon: '💬', label: 'Curator Quote' }
        ],
        layoutInstruction: 'Hero Audio Guide Player -> Atmospheric Synopsis -> Synced Visual Cards -> Curatorial Quote'
    },
    {
        id: 'versus',
        name: 'Versus & Head-to-Head Comparison',
        icon: '⚔️',
        category: 'interactive',
        categoryLabel: 'Gamified & Interactive',
        desc: 'Bold "VS" comparison layout between two subjects, comparison metrics, and audience voting quiz.',
        colorTheme: 'Dual Corner Crimson & Indigo (#ec4899)',
        highlightTags: ['VS Split Title', 'Side-by-Side Cards', 'Comparison Stats', 'Audience Vote'],
        blueprint: [
            { icon: '⚔️', label: 'VS Split Title' },
            { icon: '⚖️', label: 'Side-by-Side Cards' },
            { icon: '📊', label: 'Comparison Metrics' },
            { icon: '🗳️', label: 'Voting Quiz' }
        ],
        layoutInstruction: 'Bold VS Split Headline -> Side-by-Side Comparison Cards -> Key Comparison Stats -> Interactive Voting Quiz'
    },
    {
        id: 'cosmic',
        name: 'Cosmic Explorer & Spatial Atlas',
        icon: '🌌',
        category: 'science',
        categoryLabel: 'Science & Engineering',
        desc: 'Deep space observatory vibe, astronomical coordinates & distances (AU, Light Years), and galaxy gallery.',
        colorTheme: 'Cosmic Violet Nebula (#8b5cf6)',
        highlightTags: ['Nebula Header', 'Celestial Stats (AU)', 'Orbit Image Card', 'Galaxy Gallery', 'Secret Scratch'],
        blueprint: [
            { icon: '🪐', label: 'Nebula Header' },
            { icon: '🛰️', label: 'Celestial Metrics' },
            { icon: '🖼️', label: 'Orbit Card' },
            { icon: '🌌', label: 'Galaxy Gallery' },
            { icon: '🎟️', label: 'Cosmic Scratch' }
        ],
        layoutInstruction: 'Deep Space Nebula Header -> Celestial Metrics (AU / Mass) -> Orbit Image Card -> Swipeable Galaxy Gallery -> Astronomical Fact Scratch Card'
    },
    {
        id: 'myth',
        name: 'Myth, Lore & Ancient Legend',
        icon: '📜',
        category: 'editorial',
        categoryLabel: 'Narrative & Journey',
        desc: 'Ancient gold/amber atmosphere, folklore prologue, mythical artifact card, prophecy quote, and folklore quiz.',
        colorTheme: 'Gold Velvet & Obsidian (#eab308)',
        highlightTags: ['Ancient Era Badge', 'Folklore Prologue', 'Relic Card', 'Prophecy Quote', 'Myth Quiz'],
        blueprint: [
            { icon: '🏺', label: 'Ancient Era Badge' },
            { icon: '📜', label: 'Folklore Prologue' },
            { icon: '💎', label: 'Mythical Relic' },
            { icon: '💬', label: 'Prophecy Quote' },
            { icon: '⚡', label: 'Myth Lore Quiz' }
        ],
        layoutInstruction: 'Ancient Era Badge -> Folklore Prologue -> Mythological Artifact -> Ancient Prophecy Quote -> Myth Lore Quiz'
    },
    {
        id: 'nature',
        name: 'Nature Expedition & Fauna',
        icon: '🌿',
        category: 'science',
        categoryLabel: 'Science & Engineering',
        desc: 'Emerald botanical glow, species taxonomy badges (Habitat, Diet, Status), wildlife carousel & camouflage reveal.',
        colorTheme: 'Emerald Forest Night (#10b981)',
        highlightTags: ['Taxonomy Eyebrow', 'Fauna Portrait Hero', 'Habitat & Diet Cards', 'Camouflage Reveal', 'Nature Audio'],
        blueprint: [
            { icon: '🐾', label: 'Taxonomy Eyebrow' },
            { icon: '🦁', label: 'Wildlife Portrait' },
            { icon: '🌿', label: 'Habitat & Diet Cards' },
            { icon: '🎟️', label: 'Camouflage Reveal' },
            { icon: '🎧', label: 'Fauna Audio' }
        ],
        layoutInstruction: 'Species Taxonomy Eyebrow -> Wildlife Portrait Hero -> Habitat & Diet Cards -> Camouflage Scratch Card -> Nature Sound Audio'
    },
    {
        id: 'science_lab',
        name: 'Science Lab & Discovery',
        icon: '🧬',
        category: 'science',
        categoryLabel: 'Science & Engineering',
        desc: 'Hypothesis statement, step-by-step experiment cards, key reaction metrics, and predictive quiz.',
        colorTheme: 'Arctic Frost Cyan (#06b6d4)',
        highlightTags: ['Hypothesis Eyebrow', 'Step 1-3 Experiment', 'Reaction Metrics', 'Prediction Quiz'],
        blueprint: [
            { icon: '🧪', label: 'Hypothesis Header' },
            { icon: '🔢', label: 'Step 1-3 Cards' },
            { icon: '🌡️', label: 'Reaction Metrics' },
            { icon: '❓', label: 'Prediction Quiz' }
        ],
        layoutInstruction: 'Hypothesis Header -> Step-by-Step Experiment Cards -> Reaction Metrics -> "What happens next?" Quiz'
    },
    {
        id: 'city_guide',
        name: 'City Guide & Heritage Trail',
        icon: '🗺️',
        category: 'editorial',
        categoryLabel: 'Narrative & Journey',
        desc: 'Urban explorer itinerary with curated stops (Stop 1, Stop 2, Stop 3), architectural gallery & local insider quote.',
        colorTheme: 'Ocean Cyan & Slate (#0284c7)',
        highlightTags: ['City & Stop Eyebrow', 'Trail Stops 01-03', 'Architectural Gallery', 'Local Insider Quote'],
        blueprint: [
            { icon: '📍', label: 'City & Stop Badge' },
            { icon: '🚶', label: 'Trail Stops 01-03' },
            { icon: '🏛️', label: 'Architecture Gallery' },
            { icon: '💬', label: 'Local Secret' }
        ],
        layoutInstruction: 'City & Stop Eyebrow -> Itinerary Highlights (Stop 01-03) -> Architectural Gallery -> Local Secret Quote'
    },
    {
        id: 'art_gallery',
        name: 'Art Retrospective & Exhibition',
        icon: '🎨',
        category: 'museum',
        categoryLabel: 'Museum & Exhibition',
        desc: 'Museum exhibition catalog, masterpiece hero with framing & texture, art critique quote & underdrawing reveal.',
        colorTheme: 'Gold Velvet & Obsidian (#d97706)',
        highlightTags: ['Artist Era Header', 'Masterpiece (Show Full)', 'Art Critique', 'Symbolism Cards', 'Underdrawing Reveal'],
        blueprint: [
            { icon: '🎨', label: 'Artist Era Header' },
            { icon: '🖼️', label: 'Masterpiece (Blur)' },
            { icon: '💬', label: 'Critique Quote' },
            { icon: '💎', label: 'Symbolism Cards' },
            { icon: '🎟️', label: 'Underdrawing Reveal' }
        ],
        layoutInstruction: 'Artist Era Header -> Masterpiece Showcase (Contain+Blur) -> Art Critique Quote -> Symbolism Cards -> Underdrawing Scratch Card'
    },
    {
        id: 'innovation',
        name: 'Innovation Spotlight & Pitch',
        icon: '💡',
        category: 'editorial',
        categoryLabel: 'Editorial & Spotlight',
        desc: 'Problem vs Solution breakdown, impact stats grid (10x Faster, -80% Carbon), visionary quote & demo audio.',
        colorTheme: 'Cyber Neon & Purple (#8b5cf6)',
        highlightTags: ['Breakthrough Eyebrow', 'Problem vs Solution', 'Impact Stats Grid', 'Visionary Quote', 'Pitch Audio'],
        blueprint: [
            { icon: '🚀', label: 'Breakthrough Header' },
            { icon: '⚡', label: 'Problem vs Solution' },
            { icon: '📈', label: 'Impact Stats (2x2)' },
            { icon: '💬', label: 'Visionary Quote' },
            { icon: '🎧', label: 'Pitch Audio' }
        ],
        layoutInstruction: 'Breakthrough Eyebrow -> Problem vs Solution Cards -> 2x2 Impact Metrics -> Visionary Founder Quote -> Pitch Audio Player'
    }
]

export interface PromptEnhancementRequest {
    prompt: string
    language?: string
    archetype?: string
}

export interface PromptEnhancementResponse {
    success: boolean
    enhancedPrompt?: string
    selectedArchetype?: string
    error?: string
}
