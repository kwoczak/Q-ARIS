import { createClient } from '@/lib/supabase/server'
import { getStoryAnalytics } from '@/lib/actions/analytics'
import { AnalyticsCharts } from '@/components/admin/analytics/AnalyticsCharts'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AnalyticsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()

    // Fetch Story Details
    const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

    if (!story) return notFound()

    // Fetch Analytics Data
    const analyticsData = await getStoryAnalytics(id)

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/curator">
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Analytics: {story.title}
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Track performance and visitor engagement
                        </p>
                    </div>
                </div>
                <Link href={`/curator/story/${id}`}>
                    <Button variant="outline" className="gap-2 border-neutral-700 hover:bg-neutral-800 text-white hover:text-white bg-transparent">
                        <Edit className="w-4 h-4" />
                        Back to Editor
                    </Button>
                </Link>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                <AnalyticsCharts data={analyticsData} />
            </div>
        </div>
    )
}
