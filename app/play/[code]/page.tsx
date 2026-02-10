import { createClient } from '@/lib/supabase/server'
import { StageRenderer } from '@/components/player/StageRenderer'
import { PlayerWrapper } from '@/components/player/PlayerWrapper'
import { notFound } from 'next/navigation'
import type { Stage } from '@/types/schema'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'

export default async function PlayerPage(props: { params: Promise<{ code: string }> }) {
    const params = await props.params;
    const { code } = params
    const supabase = await createClient()

    // 1. Resolve Trigger Code -> Stage ID
    const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .select('target_stage_id')
        .eq('code', code) // Case sensitive usually, but user might type.
        .single()

    if (!trigger || triggerError) {
        console.warn("Trigger not found", code)
        return notFound()
    }

    // 2. Fetch Stage Data
    const { data: stage } = await supabase
        .from('stages')
        .select('*')
        .eq('id', trigger.target_stage_id)
        .single()

    if (!stage) return notFound()

    // 3. Check License and Get Story Info
    // Get story owner to find museum
    const { data: story } = await supabase
        .from('stories')
        .select('id, curator_id, supported_languages, default_language, is_gamified, curator:users!curator_id(museum_id)')
        .eq('id', stage.story_id)
        .single()

    // @ts-ignore
    const museumId = story?.curator?.museum_id;

    if (museumId) {
        const { data: license } = await supabase
            .from('licenses')
            .select('expires_at')
            .eq('museum_id', museumId)
            .single()

        if (license?.expires_at && new Date(license.expires_at) < new Date()) {
            return (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">License Expired</h1>
                    <p className="text-gray-400">This tour is currently unavailable because the museum's license has expired.</p>
                </div>
            )
        }
    }

    // Prepare story minimal object for PlayerWrapper
    const storyInfo = {
        id: story!.id,
        supported_languages: story!.supported_languages || ['en'],
        default_language: story!.default_language || 'en',
        is_gamified: story!.is_gamified ?? true // Default to true if null (backward compat)
    }

    return (
        <main className="min-h-screen bg-black">
            <GlobalErrorBoundary>
                {/* Dynamically import PlayerWrapper to avoid SSR issues with localStorage if component uses it directly on mount, 
                    though PlayerWrapper uses useEffect so it is safe. */}
                <PlayerWrapper stage={stage as Stage} story={storyInfo} />
            </GlobalErrorBoundary>
        </main>
    )
}
