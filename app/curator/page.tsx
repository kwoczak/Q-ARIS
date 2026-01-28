
import { createClient } from '@/lib/supabase/server'
import { CreateStoryDialog } from '@/components/admin/CreateStoryDialog'
import { StoryCard } from '@/components/admin/StoryCard'
import Link from 'next/link'
import type { Story } from '@/types/schema'
import { getSession } from '@/lib/auth-lib'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function CuratorDashboard() {
    const supabase = await createClient()
    const session = await getSession();

    // Fetch stories for this curator
    // We filter by curator_id if logged in as curator
    const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('curator_id', session?.userId)
        .order('created_at', { ascending: false })

    const stories = (data as Story[]) || []

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Your Stories</h1>
                    <p className="text-gray-500">Manage and edit your multimedia tours.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <CreateStoryDialog />
                    <LogoutButton />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                    <p className="font-semibold">Connection Error</p>
                    <p className="text-sm">Could not fetch stories.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                    // Note: Linking to /admin/story/ID still active until we migrate routes
                    // But we probably want to allow curators to access that route or move it.
                    <Link href={`/curator/story/${story.id}`} key={story.id} className="block h-full">
                        <StoryCard story={story} />
                    </Link>
                ))}
                {stories.length === 0 && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400">
                        <div className="mb-4 text-4xl">📚</div>
                        <p className="text-lg font-medium">No stories assigned</p>
                        <p className="text-sm">Create a new tour or ask your museum admin.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
