'use client'

import type { Story } from '@/types/schema'
import { Trash2, Edit3, Calendar } from 'lucide-react'
import { deleteStory } from '@/app/actions/story'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DeleteConfirmModal } from './editor/DeleteConfirmModal'

export function StoryCard({ story }: { story: Story }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteStory(story.id)
            setIsDeleteModalOpen(false)
            router.refresh() // Refresh server component data
        } catch (error) {
            console.error(error)
            alert("Failed to delete story")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="relative overflow-hidden p-6 bg-neutral-900 rounded-xl border border-white/5 shadow-sm group hover:border-white/20 transition-all hover:bg-neutral-900/80 h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-purple-500/10" />
            
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg text-white line-clamp-1 pr-10">{story.title}</h3>
            </div>
            

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center text-xs text-neutral-500 gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                        {new Date(story.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                </div>
            </div>

            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDeleteModalOpen(true)
                }}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10 cursor-pointer"
                title="Delete Story"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Custom Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Story"
                description="Are you sure you want to delete this story? This action cannot be undone and will permanently remove all its stages, checkpoints, and visitor analytics."
                itemTitle={story.title}
                itemSubtitle={`Created: ${new Date(story.created_at).toLocaleDateString()}`}
                confirmText="Delete Story"
                cancelText="Cancel"
                isDeleting={isDeleting}
            />
        </div>
    )
}
