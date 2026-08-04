import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
import Link from 'next/link'
import { ArrowLeft, Library, Eye } from 'lucide-react'
import type { Story } from '@/types/schema'
import { notFound } from 'next/navigation'

export default async function CuratorStoriesPage(props: { params: Promise<{ curatorId: string }> }) {
    const params = await props.params;
    const { curatorId } = params;
    const supabase = await createClient()
    const session = await getSession();

    // Verify the curator belongs to this museum
    const { data: curator } = await supabase
        .from('users')
        .select('*')
        .eq('id', curatorId)
        .eq('museum_id', session?.userId)
        .single();

    if (!curator) {
        return notFound();
    }

    // Fetch stories for this curator
    const { data: stories } = await supabase
        .from('stories')
        .select('*')
        .eq('curator_id', curatorId)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-10 pb-10">
            {/* Page Header */}
            <div className="flex flex-col gap-4">
                <Link href="/museum/stories" className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Curators
                </Link>
                
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                        {curator.username}'s Stories
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1">Select a story to preview the AR/audio experience.</p>
                </div>
            </div>
            
            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories?.map((story: Story) => (
                    <Link href={`/museum/stories/preview/${story.id}`} key={story.id}>
                        <div className="relative overflow-hidden p-6 bg-neutral-900 rounded-xl border border-white/5 shadow-sm group hover:border-white/20 transition-all hover:bg-neutral-900/80 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-blue-500/10" />
                            
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-semibold text-lg text-white line-clamp-1">{story.title}</h3>
                            </div>
                            
                            <p className="text-sm text-neutral-400 line-clamp-3 mb-6 flex-1">
                                {story.description || "No description provided."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <span className="text-xs text-neutral-500">
                                    {new Date(story.created_at).toLocaleDateString(undefined, { 
                                        year: 'numeric', month: 'short', day: 'numeric' 
                                    })}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                
                {(!stories || stories.length === 0) && (
                    <div className="col-span-full h-64 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Library className="w-6 h-6 text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Stories Yet</h3>
                        <p className="text-neutral-400 max-w-sm">
                            This curator hasn't created any stories.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
