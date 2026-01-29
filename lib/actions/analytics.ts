'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function logAnalyticsEvent(storyId: string, stageId: string, eventType: string, visitorSessionId: string, metadata: any = {}) {
    // Use Admin Client (Service Role) to bypass RLS policies for analytics logging
    // This ensures tracking works even if the user is anonymous
    let supabase
    try {
        supabase = await createAdminClient()
    } catch (e) {
        // Fallback to normal client if service role key is missing
        console.warn("Service Role Key missing, falling back to anon client")
        supabase = await createClient()
    }

    try {
        const { error } = await supabase.from('analytics_events').insert({
            story_id: storyId,
            stage_id: stageId,
            event_type: eventType,
            visitor_session_id: visitorSessionId,
            metadata
        })

        if (error) {
            console.error("Supabase Analytics Insert Error:", error)
            throw error
        }
    } catch (error) {
        console.error("Failed to log analytics event:", error)
        // We throw here so the client can potentially see it if wrapped,
        // but typically analytics failures shouldn't break the UX.
        // However, for debugging now, we want to know.
    }
}

export async function getStoryAnalytics(storyId: string) {
    // Use Admin Client to bypass RLS for fetching stats (temporary fix/debugging)
    let supabase
    try {
        supabase = await createAdminClient()
    } catch (e) {
        supabase = await createClient()
    }

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

    // 3. Views per Stage & Visitor Flow
    // We fetch all relevant events to aggregate in JS given lack of complex join/group support in simple client
    const { data: allEvents } = await supabase
        .from('analytics_events')
        .select('stage_id, created_at, visitor_session_id')
        .eq('story_id', storyId)
        .eq('event_type', 'stage_view')

    const events = allEvents || []

    const stageViews: Record<string, number> = {}

    // --- Visitor Flow & Engagement Time Calculation ---
    const flows: Record<string, number> = {} // "StageA_ID -> StageB_ID": count
    const sessionPaths: Record<string, { stageId: string, timestamp: string }[]> = {}

    // Engagement stats
    const stageDurations: Record<string, number[]> = {} // stageId -> array of durations in ms
    const sessionDurations: number[] = [] // Total duration of each session in ms

    events.forEach(e => {
        if (e.stage_id) {
            stageViews[e.stage_id] = (stageViews[e.stage_id] || 0) + 1

            // Group by session
            if (!sessionPaths[e.visitor_session_id]) {
                sessionPaths[e.visitor_session_id] = []
            }
            sessionPaths[e.visitor_session_id].push({
                stageId: e.stage_id,
                timestamp: e.created_at
            })
        }
    })

    // Analyze transitions and time
    Object.values(sessionPaths).forEach(path => {
        // Sort by time
        path.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        let sessionTotalTime = 0

        // Loop through path to find links and duration
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i]
            const next = path[i + 1]

            // Flow
            if (current.stageId !== next.stageId) {
                const key = `${current.stageId}|${next.stageId}`
                flows[key] = (flows[key] || 0) + 1
            }

            // Duration
            const duration = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()

            // Filter realistic durations (e.g., > 1s and < 30min) to avoid glitches or huge idle times
            if (duration > 1000 && duration < 30 * 60 * 1000) {
                if (!stageDurations[current.stageId]) stageDurations[current.stageId] = []
                stageDurations[current.stageId].push(duration)
                sessionTotalTime += duration
            }
        }

        if (sessionTotalTime > 0) {
            sessionDurations.push(sessionTotalTime)
        }
    })

    // Calculate Averages
    const avgSessionTimeMs = sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
        : 0

    // Fetch stage titles to map
    const { data: stages } = await supabase
        .from('stages')
        .select('id, title')

    const stageMap = new Map(stages?.map(s => [s.id, s.title]))

    const popularStages = stages?.map(stage => {
        const durations = stageDurations[stage.id] || []
        const avgTimeMs = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0

        return {
            name: stage.title,
            views: stageViews[stage.id] || 0,
            avgTime: Math.round(avgTimeMs / 1000), // convert to seconds
            id: stage.id
        }
    }).sort((a, b) => b.views - a.views).slice(0, 5) // Top 5

    // Format Flows for UI
    const topPaths = Object.entries(flows)
        .map(([key, count]) => {
            const [sourceId, targetId] = key.split('|')
            return {
                source: stageMap.get(sourceId) || 'Unknown',
                target: stageMap.get(targetId) || 'Unknown',
                count
            }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 paths

    return {
        totalViews: totalViews || 0,
        uniqueVisitors,
        popularStages: popularStages || [],
        topPaths,
        avgSessionDuration: Math.round(avgSessionTimeMs / 1000) // Seconds
    }
}
