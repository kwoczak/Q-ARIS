export type Story = {
    id: string
    title: string
    description: string | null
    created_at: string
    updated_at: string
}

export type StageType = 'content' | 'ar_model' | 'quiz' | 'ending'

export type StageContent = {
    text?: string
    images?: string[]
    audio?: string         // URL to mp3
    autoplay_audio?: boolean
    video?: string         // URL to mp4
    model_3d?: string      // URL to glb
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
