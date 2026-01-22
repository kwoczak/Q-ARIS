'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { Story } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteStory } from '@/app/actions/story'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function StoryCard({ story }: { story: Story }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent Link navigation
        e.stopPropagation()

        if (!confirm("Are you sure you want to delete this story? This cannot be undone.")) {
            return
        }

        setIsDeleting(true)
        try {
            await deleteStory(story.id)
            router.refresh() // Refresh server component data
        } catch (error) {
            console.error(error)
            alert("Failed to delete story")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full relative group">
            <CardHeader className="pr-12"> {/* Space for delete button */}
                <CardTitle className="line-clamp-1">{story.title}</CardTitle>
                <CardDescription>{new Date(story.created_at).toLocaleDateString('pl-PL')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-neutral-500 line-clamp-3">
                    {story.description || "No description provided."}
                </p>
            </CardContent>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Delete Story"
            >
                {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        </Card>
    )
}
