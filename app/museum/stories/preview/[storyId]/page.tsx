import { createClient } from '@/lib/supabase/server'
import { StoryEditor } from '@/components/admin/editor/StoryEditor'
import { notFound } from 'next/navigation'
import type { Story, Stage, Trigger, StoryEdge } from '@/types/schema'

export default async function StoryPreviewPage(props: { params: Promise<{ storyId: string }> }) {
    const params = await props.params;
    const { storyId } = params;
    const supabase = await createClient()

    // 1. Fetch Story
    const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single()

    if (storyError || !story) {
        return notFound()
    }

    // 2. Fetch Stages
    const { data: stages } = await supabase
        .from('stages')
        .select('*')
        .eq('story_id', storyId)

    // 3. Fetch Triggers
    const { data: triggers } = await supabase
        .from('triggers')
        .select('*')
        .eq('story_id', storyId)

    // 4. Fetch Edges
    const { data: edges } = await supabase
        .from('story_edges')
        .select('*')
        .eq('story_id', storyId)

    return (
        <div className="flex-1 w-full -m-4 md:-m-8">
            <StoryEditor
                story={story as Story}
                initialStages={(stages as Stage[]) || []}
                initialTriggers={(triggers as Trigger[]) || []}
                initialEdges={(edges as StoryEdge[]) || []}
                readOnly={true}
            />
        </div>
    )
}
