import { createClient } from '@/lib/supabase/server'
import { CreateStoryDialog } from '@/components/admin/CreateStoryDialog'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { Story } from '@/types/schema'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false })

    const stories = (data as Story[]) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Your Stories</h1>
                <CreateStoryDialog />
            </div>

            {error && (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                    <p className="font-semibold">Connection Error</p>
                    <p className="text-sm">Could not connect to Supabase. Check your .env.local file.</p>
                    <pre className="mt-2 text-xs opacity-75">{error.message}</pre>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                    <Link href={`/admin/story/${story.id}`} key={story.id} className="block h-full">
                        <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{story.title}</CardTitle>
                                <CardDescription>{new Date(story.created_at).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-500 line-clamp-3">
                                    {story.description || "No description provided."}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {stories.length === 0 && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400">
                        <div className="mb-4 text-4xl">📚</div>
                        <p className="text-lg font-medium">No stories yet</p>
                        <p className="text-sm">Create your first multimedia tour to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
