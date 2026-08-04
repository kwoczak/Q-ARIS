import { createClient } from '@/lib/supabase/server'
import { StoryCard } from '@/components/admin/StoryCard'
import Link from 'next/link'
import type { Story } from '@/types/schema'
import { getSession } from '@/lib/auth-lib'
import { Sparkles, Library } from 'lucide-react'

export default async function CuratorDashboard() {
    const supabase = await createClient()
    const session = await getSession();

    // Fetch stories for this curator
    const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('curator_id', session?.userId)
        .order('created_at', { ascending: false })

    const stories = (data as Story[]) || []

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                    Your Workspace
                    <Sparkles className="w-6 h-6 text-purple-400" />
                </h1>
                <p className="text-sm text-neutral-400">Design, manage, and publish your interactive storytelling experiences.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                    <p className="font-semibold">Connection Error</p>
                    <p className="text-sm">Could not fetch stories.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                    <Link href={`/curator/story/${story.id}`} key={story.id} className="block h-full outline-none group focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl">
                        <StoryCard story={story} />
                    </Link>
                ))}
                
                {stories.length === 0 && !error && (
                    <div className="col-span-full h-80 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 bg-neutral-900/20 backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 shadow-inner border border-white/5">
                            <Library className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No Stories Yet</h3>
                        <p className="text-neutral-400 max-w-md mb-6">
                            Your canvas is empty. Start crafting your first immersive tour by clicking the "Create Story" button in the sidebar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
