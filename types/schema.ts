export type Story = {
    id: string
    title: string
    description: string | null
    created_at: string
    updated_at: string
}

export type StageType = 'content' | 'ar_model' | 'quiz' | 'ending'

export type BlockType = 'text' | 'image' | 'audio' | 'video' | 'model_3d' | 'comparison' | 'hotspot' | 'quiz' | 'carousel' | 'accordion'

export interface BlockStyle {
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
    content: string | ComparisonContent | HotspotContent | QuizContent | CarouselItem[] | AccordionItem[] | any
    styles?: BlockStyle
    overlay?: BlockOverlay
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
