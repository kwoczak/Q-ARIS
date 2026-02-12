export type Story = {
    id: string
    title: string
    description: string | null
    created_at: string
    updated_at: string
    supported_languages?: string[] // e.g. ['en', 'pl']
    default_language?: string
    is_gamified?: boolean
}

export type Language = 'en' | 'pl' | 'de' | 'es' | 'fr' | 'it' | 'cs' | 'ua';

export type StageType = 'content' | 'ar_model' | 'quiz' | 'ending'

export type BlockType = 'text' | 'image' | 'audio' | 'video' | 'model_3d' | 'comparison' | 'hotspot' | 'quiz' | 'scratchpad' | 'carousel' | 'accordion'

export interface BlockStyle {
    // ... existing BlockStyle ...
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    fontSize?: string // '16px', '1.5rem', etc.
    color?: string
    fontFamily?: string
    padding?: string
    backgroundColor?: string // hex or rgba
    borderRadius?: string
    marginBottom?: string
    // Visual Effects
    animation?: 'fade-in' | 'slide-up' | 'scale-up' | 'typewriter' | 'none'
    animationDelay?: string
    filter?: 'sepia' | 'grayscale' | 'vintage' | 'blur' | 'none'
    backdropBlur?: boolean
    autoplayMedia?: boolean
    modelScale?: string // e.g. "0.5 0.5 0.5"
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    textDecoration?: 'none' | 'underline' | 'line-through'
}

export interface BlockOverlay {
    text: string
    style: BlockStyle
    position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    width: 'auto' | '50%' | '75%' | '100%'
}

// Content Interfaces for Complex Blocks
export interface ComparisonContent {
    imageBefore: string
    imageAfter: string
    labelBefore?: string
    labelAfter?: string
}

export interface ScratchContent {
    hiddenImage: string
    coverColor?: string // hex
    coverText?: string // "Scratch me!" overlay on the cover
    scratchText?: string // "(Rub to reveal)" instruction text
    points?: number
}

export interface HotspotItem {
    id: string
    x: number // percentage 0-100
    y: number // percentage 0-100
    label?: string
    text: string
}

export interface HotspotContent {
    image: string
    hotspots: HotspotItem[]
}

export interface QuizAnswer {
    id: string
    text: string
    isCorrect: boolean
    feedback?: string
}

export interface QuizContent {
    question: string
    answers: QuizAnswer[]
    points: number // Points awarded for correct answer
    submitButtonText?: string // Custom text for submit button
}

export interface CarouselItem {
    id: string
    url: string
    caption?: string
}

export interface AccordionItem {
    id: string
    title: string
    content: string
}

export interface StageBlock {
    id: string
    type: BlockType
    content: string | ComparisonContent | HotspotContent | QuizContent | ScratchContent | CarouselItem[] | AccordionItem[] | any
    styles?: BlockStyle
    overlay?: BlockOverlay

    // Internationalization overrides
    // Keys are language codes (e.g., 'pl', 'de')
    content_i18n?: Record<string, any>
    overlay_i18n?: Record<string, { text: string }>
}

export interface StageBackground {
    type: 'color' | 'image' | 'gradient'
    value: string
    overlayOpacity?: number
}

export type StageContent = {
    // Legacy fields (kept for backward compatibility)
    text?: string
    images?: string[]
    audio?: string         // URL to mp3
    autoplay_audio?: boolean
    video?: string         // URL to mp4
    model_3d?: string      // URL to glb

    // New fields
    background?: StageBackground
    blocks?: StageBlock[]
    arButtonText?: string // Custom text for "View in AR" button
    model_scale?: string // Initial scale of the 3D model (e.g. "0.5 0.5 0.5")
    i18n?: Record<string, any> // Global translations (e.g. { 'pl': { arButtonText: 'Zobacz w AR' } })
}

export type Stage = {
    id: string
    story_id: string
    title: string
    type: StageType
    content: StageContent
    position_x: number
    position_y: number
    created_at: string
}

export type TriggerType = 'start' | 'checkpoint'

export type Trigger = {
    id: string
    code: string
    story_id: string
    target_stage_id: string
    type: TriggerType
    created_at: string
}

export type StoryEdge = {
    id: string
    story_id: string
    source_stage_id: string
    target_stage_id: string
    created_at: string
}
