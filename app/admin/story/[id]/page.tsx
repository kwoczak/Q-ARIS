import { createClient } from '@/lib/supabase/server'
import { StoryEditor } from '@/components/admin/editor/StoryEditor'
import { notFound } from 'next/navigation'
import type { Story, Stage, Trigger } from '@/types/schema'

export default async function StoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch Story
    const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

    if (storyError || !story) {
        // Return mock data for dev if no connection? 
        // Usually better to show error or 404.
        // console.error(storyError)
        // return notFound() 

        // For Development without DB connection, let's return a mock story 
        if (process.env.NODE_ENV === 'development' && storyError) {
            return (
                <StoryEditor
                    story={{ id: id, title: "Mock Story", description: "This is a mock because DB failed.", created_at: "", updated_at: "" }}
                    initialStages={[]}
                    initialTriggers={[]}
                    initialEdges={[]}
                />
            )
        }
        return notFound()
    }

    // Fetch Stages
    const { data: stages } = await supabase
        .from('stages')
        .select('*')
        .eq('story_id', id)

    // Fetch Triggers
    const { data: triggers } = await supabase
        .from('triggers')
        .select('*')
        .eq('story_id', id)

    // Fetch Edges
    const { data: edges } = await supabase
        .from('story_edges')
        .select('*')
        .eq('story_id', id)

    return (
        <StoryEditor
            story={story as Story}
            initialStages={(stages as Stage[]) || []}
            initialTriggers={(triggers as Trigger[]) || []}
            initialEdges={(edges as any[]) || []}
        />
    )
}
