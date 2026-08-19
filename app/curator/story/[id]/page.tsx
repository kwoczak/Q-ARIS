import { createClient, createAdminClient } from '@/lib/supabase/server'
import { StoryEditor } from '@/components/admin/editor/StoryEditor'
import { getSession } from '@/lib/auth-lib'
import { notFound } from 'next/navigation'
import type { Story, Stage, Trigger } from '@/types/schema'

export default async function StoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const session = await getSession()

    // Verify if AI Generator is allowed for this user (only curator_demo or admin)
    let isAIModeAllowed = false
    if (session) {
        if (session.role === 'admin' || session.username === 'curator_demo') {
            isAIModeAllowed = true
        } else {
            const adminSupabase = await createAdminClient()
            const { data: user } = await adminSupabase.from('users').select('username, role').eq('id', session.userId).single()
            if (user?.username === 'curator_demo' || user?.role === 'admin') {
                isAIModeAllowed = true
            }
        }
    }

    // Fetch Story
    const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

    if (storyError || !story) {
        if (process.env.NODE_ENV === 'development' && storyError) {
            return (
                <StoryEditor
                    story={{ id: id, title: "Mock Story", description: "This is a mock because DB failed.", created_at: "", updated_at: "" }}
                    initialStages={[]}
                    initialTriggers={[]}
                    initialEdges={[]} // Empty array for mock data
                    isAIModeAllowed={isAIModeAllowed}
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
            isAIModeAllowed={isAIModeAllowed}
        />
    )
}
