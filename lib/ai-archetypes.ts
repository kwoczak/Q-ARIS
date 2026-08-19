export interface CompositionArchetype {
    id: string
    name: string
    icon: string
    category: 'museum' | 'interactive' | 'editorial' | 'science'
    desc: string
    layoutInstruction: string
}

export const COMPOSITION_ARCHETYPES: CompositionArchetype[] = [
    {
        id: 'curatorial',
        name: 'Curatorial Deep-Dive',
        icon: '🏛️',
        category: 'museum',
        desc: 'Cinematic hero, curatorial quote block, audio guide player, portrait gallery & secret reveal.',
        layoutInstruction: 'Top Spotlight Ambient -> Hero Showcase -> Curatorial Quote -> Audio Guide Player -> Portrait Artifact Gallery -> Scratch Card Reveal'
    },
    {
        id: 'quest',
        name: 'Gamified Quest & Challenge',
        icon: '⚡',
        category: 'interactive',
        desc: 'XP badge & difficulty, rub-to-reveal clue card, 2-question interactive quiz, and stats counters.',
        layoutInstruction: 'XP Difficulty Eyebrow -> Hook Story -> Scratch-to-reveal Clue -> 2-Question Interactive Quiz -> 2x2 Stats Grid'
    },
    {
        id: 'blueprint',
        name: 'Technical Blueprint & Specs',
        icon: '📊',
        category: 'science',
        desc: 'Blueprint schematic hero, 2x2 key metrics grid (speed, payload, year), monospace specs, and telemetry audio.',
        layoutInstruction: 'Blueprint Hero Card -> 2x2 Key Numerical Metrics Grid -> Technical Param Cards -> Telemetry Audio Narration'
    },
    {
        id: 'timeline',
        name: 'Timeline Chronicle & Journey',
        icon: '📖',
        category: 'editorial',
        desc: 'Phase-by-phase chronological story (Phase 01, Phase 02, Phase 03) with gradient badges & evolution gallery.',
        layoutInstruction: 'Narrative Prologue -> Numbered Milestone Cards (Phase 01-03) -> Evolution Photo Gallery -> Key Takeaway'
    },
    {
        id: 'magazine',
        name: 'Visual Magazine & Spotlight',
        icon: '🖼️',
        category: 'editorial',
        desc: 'Vogue/NatGeo editorial typography, 3:4 portrait photo focus with captions, and pill highlight tags.',
        layoutInstruction: 'Editorial Minimalist Headline -> Large Portrait 3:4 Showcase -> Curatorial Note -> Feature Pill Badges'
    },
    {
        id: 'mystery',
        name: 'Mystery & Classified Dossier',
        icon: '🕵️',
        category: 'interactive',
        desc: 'Classified red/amber warning badge, secret dossier intro, scratch card to decipher evidence & deduction quiz.',
        layoutInstruction: 'Classified Badge -> Dossier Intro -> Scratch Card Evidence Decipher -> Witness Quote -> Deduction Quiz'
    },
    {
        id: 'audio_doc',
        name: 'Audio-First Story & Podcast',
        icon: '🎙️',
        category: 'museum',
        desc: 'Large prominent Audio Guide player hero at the top, atmospheric backdrop, and chapter sync cards.',
        layoutInstruction: 'Hero Audio Guide Player -> Atmospheric Synopsis -> Synced Visual Cards -> Curatorial Quote'
    },
    {
        id: 'versus',
        name: 'Versus & Head-to-Head Comparison',
        icon: '⚔️',
        category: 'interactive',
        desc: 'Bold "VS" comparison layout between two subjects, comparison metrics, and audience voting quiz.',
        layoutInstruction: 'Bold VS Split Headline -> Side-by-Side Comparison Cards -> Key Comparison Stats -> Interactive Voting Quiz'
    },
    {
        id: 'cosmic',
        name: 'Cosmic Explorer & Spatial Atlas',
        icon: '🌌',
        category: 'science',
        desc: 'Deep space observatory vibe, astronomical coordinates & distances (AU, Light Years), and galaxy gallery.',
        layoutInstruction: 'Deep Space Nebula Header -> Celestial Metrics (AU / Mass) -> Orbit Image Card -> Swipeable Galaxy Gallery -> Astronomical Fact Scratch Card'
    },
    {
        id: 'myth',
        name: 'Myth, Lore & Ancient Legend',
        icon: '📜',
        category: 'editorial',
        desc: 'Ancient gold/amber atmosphere, folklore prologue, mythical artifact card, prophecy quote, and folklore quiz.',
        layoutInstruction: 'Ancient Era Badge -> Folklore Prologue -> Mythological Artifact -> Ancient Prophecy Quote -> Myth Lore Quiz'
    },
    {
        id: 'nature',
        name: 'Nature Expedition & Fauna',
        icon: '🌿',
        category: 'science',
        desc: 'Emerald botanical glow, species taxonomy badges (Habitat, Diet, Status), wildlife carousel & camouflage reveal.',
        layoutInstruction: 'Species Taxonomy Eyebrow -> Wildlife Portrait Hero -> Habitat & Diet Cards -> Camouflage Scratch Card -> Nature Sound Audio'
    },
    {
        id: 'science_lab',
        name: 'Science Lab & Discovery',
        icon: '🧬',
        category: 'science',
        desc: 'Hypothesis statement, step-by-step experiment cards, key reaction metrics, and predictive quiz.',
        layoutInstruction: 'Hypothesis Header -> Step-by-Step Experiment Cards -> Reaction Metrics -> "What happens next?" Quiz'
    },
    {
        id: 'city_guide',
        name: 'City Guide & Heritage Trail',
        icon: '🗺️',
        category: 'editorial',
        desc: 'Urban explorer itinerary with curated stops (Stop 1, Stop 2, Stop 3), architectural gallery & local insider quote.',
        layoutInstruction: 'City & Stop Eyebrow -> Itinerary Highlights (Stop 01-03) -> Architectural Gallery -> Local Secret Quote'
    },
    {
        id: 'art_gallery',
        name: 'Art Retrospective & Exhibition',
        icon: '🎨',
        category: 'museum',
        desc: 'Museum exhibition catalog, masterpiece hero with framing & texture, art critique quote & underdrawing reveal.',
        layoutInstruction: 'Artist Era Header -> Masterpiece Showcase (Contain+Blur) -> Art Critique Quote -> Symbolism Cards -> Underdrawing Scratch Card'
    },
    {
        id: 'innovation',
        name: 'Innovation Spotlight & Pitch',
        icon: '💡',
        category: 'editorial',
        desc: 'Problem vs Solution breakdown, impact stats grid (10x Faster, -80% Carbon), visionary quote & demo audio.',
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
