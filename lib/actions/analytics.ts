'use server'

import { createClient } from '@/lib/supabase/server'

export async function logAnalyticsEvent(storyId: string, stageId: string, eventType: string, visitorSessionId: string, metadata: any = {}) {
    const supabase = await createClient()

    try {
        await supabase.from('analytics_events').insert({
            story_id: storyId,
            stage_id: stageId,
            event_type: eventType,
            visitor_session_id: visitorSessionId,
            metadata
        })
    } catch (error) {
        console.error("Failed to log analytics event:", error)
        // Fail silently to not impact user experience
    }
}

export async function getStoryAnalytics(storyId: string) {
    const supabase = await createClient()

    // 1. Total Views
    const { count: totalViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)
        .eq('event_type', 'stage_view')

    // 2. Unique Visitors (Sessions) -> Approximation via SQL or fetch & count
    // efficient way if we had distinct count, but Supabase JS doesn't support concise distinct count easily without RPC
    // We'll fetch just session_ids and count unique in JS for now (reasonable for MVP volume)
    const { data: sessionData } = await supabase
        .from('analytics_events')
        .select('visitor_session_id')
        .eq('story_id', storyId)

    const uniqueVisitors = new Set(sessionData?.map(d => d.visitor_session_id)).size

    // 3. Views per Stage
    // We need to join with stages to get titles. 
    // Ideally use RPC for aggregation, but for now we fetch events and aggregate in JS
    const { data: events } = await supabase
        .from('analytics_events')
        .select('stage_id, created_at')
        .eq('story_id', storyId)
        .eq('event_type', 'stage_view')

    const stageViews: Record<string, number> = {}
    events?.forEach(e => {
        if (e.stage_id) {
            stageViews[e.stage_id] = (stageViews[e.stage_id] || 0) + 1
        }
    })

    // Fetch stage titles to map
    const { data: stages } = await supabase
        .from('stages')
        .select('id, title')
        .eq('story_id', storyId)

    const popularStages = stages?.map(stage => ({
        name: stage.title,
        views: stageViews[stage.id] || 0,
        id: stage.id
    })).sort((a, b) => b.views - a.views).slice(0, 5) // Top 5


    return {
        totalViews: totalViews || 0,
        uniqueVisitors,
        popularStages: popularStages || []
    }
}
