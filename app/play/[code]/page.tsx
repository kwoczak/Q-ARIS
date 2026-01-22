import { createClient } from '@/lib/supabase/server'
import { StageRenderer } from '@/components/player/StageRenderer'
import { notFound } from 'next/navigation'
import type { Stage } from '@/types/schema'

export default async function PlayerPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
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

    return (
        <main className="min-h-screen bg-black">
            <StageRenderer stage={stage as Stage} />
        </main>
    )
}
