'use client'

import React, { useState, useMemo } from 'react'
import type { Story, Stage, Trigger, StoryEdge } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { StageProperties } from './StageProperties'
import {
    Loader2,
    Pencil,
    ArrowLeft,
    Plus,
    Sparkles,
    Trash2,
    Copy,
    ChevronUp,
    ChevronDown,
    Smartphone,
    HelpCircle,
    Ticket,
    ImageIcon,
    Music,
    QrCode,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { LanguageManager } from '../LanguageManager'
import { StorySettingsDialog } from './StorySettingsDialog'
import { DeleteConfirmModal } from './DeleteConfirmModal'

function extractStageThumbnail(stage: Stage): string | null {
    if (stage.content?.images && stage.content.images.length > 0) {
        return stage.content.images[0]
    }
    if (stage.content?.background?.type === 'image' && stage.content.background.value) {
        return stage.content.background.value
    }
    if (stage.content?.custom_html) {
        const match = stage.content.custom_html.match(/<img[^>]+src=["']([^"']+)["']/i)
        if (match && match[1] && !match[1].startsWith('data:image/svg')) {
            return match[1]
        }
    }
    return null
}

function detectStageFeatures(stage: Stage) {
    const html = stage.content?.custom_html || ''
    return {
        hasQuiz: html.includes('data-component="quiz"') || html.includes('quiz-fb') || !!stage.content?.blocks?.some(b => b.type === 'quiz'),
        hasScratch: html.includes('data-component="scratch_card"') || !!stage.content?.blocks?.some(b => b.type === 'scratchpad'),
        hasGallery: html.includes('data-component="gallery"') || html.includes('.snap-x') || !!stage.content?.blocks?.some(b => b.type === 'carousel'),
        hasAudio: html.includes('data-component="audio"') || html.includes('<audio') || !!stage.content?.audio || !!stage.content?.blocks?.some(b => b.type === 'audio')
    }
}

export function StoryEditor({
    story,
    initialStages,
    initialTriggers,
    readOnly = false,
    isAIModeAllowed = false
}: {
    story: Story
    initialStages: Stage[]
    initialTriggers: Trigger[]
    initialEdges?: StoryEdge[]
    readOnly?: boolean
    isAIModeAllowed?: boolean
}) {
    // Sort stages by position_y or created_at
    const sortedInitialStages = useMemo(() => {
        return [...initialStages].sort((a, b) => {
            if (typeof a.position_y === 'number' && typeof b.position_y === 'number' && a.position_y !== b.position_y) {
                return a.position_y - b.position_y
            }
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        })
    }, [initialStages])

    const [stages, setStages] = useState<Stage[]>(sortedInitialStages)
    const [triggers, setTriggers] = useState<Trigger[]>(initialTriggers)
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [storyTitle, setStoryTitle] = useState(story.title)
    const [stageToDelete, setStageToDelete] = useState<{ stage: Stage; index: number } | null>(null)
    const [isDeletingStage, setIsDeletingStage] = useState(false)

    const supabase = createClient()

    // Map trigger by stage ID
    const triggerMap = useMemo(() => {
        const map = new Map<string, Trigger>()
        triggers.forEach((t) => {
            if (t.target_stage_id) {
                map.set(t.target_stage_id, t)
            }
        })
        return map
    }, [triggers])

    const handleStageUpdate = async (updatedStage: Stage) => {
        setStages((prev) => prev.map((s) => (s.id === updatedStage.id ? updatedStage : s)))
        if (selectedStage?.id === updatedStage.id) {
            setSelectedStage(updatedStage)
        }

        const { error } = await supabase
            .from('stages')
            .update({
                title: updatedStage.title,
                content: updatedStage.content,
                type: updatedStage.type
            })
            .eq('id', updatedStage.id)

        if (error) {
            console.error('Failed to update stage', error)
            alert('Failed to save changes')
        }
    }

    const handleAddStage = async () => {
        setIsSaving(true)
        const nextPositionY = stages.length * 100
        const newStage = {
            story_id: story.id,
            title: `Stage ${stages.length + 1}`,
            type: 'content' as const,
            content: {},
            position_x: 100,
            position_y: nextPositionY
        }

        const { data, error } = await supabase
            .from('stages')
            .insert(newStage)
            .select()
            .single()

        setIsSaving(false)

        if (error || !data) {
            console.error('Error creating stage', error)
            return
        }

        // Auto-generate Trigger
        const code = Math.random().toString(36).substring(2, 10).toUpperCase()
        const { data: triggerData } = await supabase
            .from('triggers')
            .insert({
                code,
                story_id: story.id,
                target_stage_id: data.id,
                type: 'checkpoint'
            })
            .select()
            .single()

        const createdStage = data as Stage
        setStages((prev) => [...prev, createdStage])
        if (triggerData) {
            setTriggers((prev) => [...prev, triggerData as Trigger])
        }

        // Open newly created stage in editor
        setSelectedStage(createdStage)
        setIsSidebarOpen(true)
    }

    const handleDuplicateStage = async (originalStage: Stage) => {
        setIsSaving(true)
        const nextPositionY = (originalStage.position_y || 0) + 50
        const copiedStage = {
            story_id: story.id,
            title: `${originalStage.title} (Copy)`,
            type: originalStage.type,
            content: structuredClone(originalStage.content),
            position_x: 100,
            position_y: nextPositionY
        }

        const { data, error } = await supabase
            .from('stages')
            .insert(copiedStage)
            .select()
            .single()

        setIsSaving(false)

        if (error || !data) {
            console.error('Error duplicating stage', error)
            alert('Failed to duplicate stage')
            return
        }

        // Auto-generate Trigger for Copy
        const code = Math.random().toString(36).substring(2, 10).toUpperCase()
        const { data: triggerData } = await supabase
            .from('triggers')
            .insert({
                code,
                story_id: story.id,
                target_stage_id: data.id,
                type: 'checkpoint'
            })
            .select()
            .single()

        const createdStage = data as Stage
        setStages((prev) => [...prev, createdStage])
        if (triggerData) {
            setTriggers((prev) => [...prev, triggerData as Trigger])
        }
    }

    const handleDeleteStage = (stageId: string) => {
        const idx = stages.findIndex((s) => s.id === stageId)
        if (idx !== -1) {
            setStageToDelete({ stage: stages[idx], index: idx })
        }
    }

    const handleConfirmDeleteStage = async () => {
        if (!stageToDelete) return
        setIsDeletingStage(true)
        try {
            const stageId = stageToDelete.stage.id
            await supabase.from('stages').delete().eq('id', stageId)
            setStages((prev) => prev.filter((s) => s.id !== stageId))
            if (selectedStage?.id === stageId) {
                setSelectedStage(null)
                setIsSidebarOpen(false)
            }
            setStageToDelete(null)
        } catch (err) {
            console.error('Failed to delete stage:', err)
        } finally {
            setIsDeletingStage(false)
        }
    }

    const handleMoveStage = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= stages.length) return

        const updated = [...stages]
        const temp = updated[index]
        updated[index] = updated[targetIndex]
        updated[targetIndex] = temp

        // Update position_y for both
        const stageA = updated[index]
        const stageB = updated[targetIndex]
        stageA.position_y = index * 100
        stageB.position_y = targetIndex * 100

        setStages(updated)

        // Persist to DB in background
        await Promise.all([
            supabase.from('stages').update({ position_y: stageA.position_y }).eq('id', stageA.id),
            supabase.from('stages').update({ position_y: stageB.position_y }).eq('id', stageB.id)
        ])
    }

    return (
        <div className="min-h-[calc(100vh-140px)] w-full border border-white/10 rounded-2xl overflow-hidden bg-neutral-950 flex flex-col relative shadow-2xl">
            {/* TOP HEADER */}
            <div className="p-4 sm:px-6 border-b border-white/10 flex flex-wrap justify-between items-center bg-neutral-900/90 backdrop-blur-md shrink-0 gap-3">
                <div className="flex items-center gap-4">
                    <Link href={readOnly ? `/museum/stories/${story.curator_id}` : '/curator'}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl w-9 h-9"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 group">
                            {readOnly ? (
                                <div className="font-bold text-lg px-1 w-full max-w-md text-white">{storyTitle}</div>
                            ) : (
                                <>
                                    <Input
                                        value={storyTitle}
                                        onChange={(e) => setStoryTitle(e.target.value)}
                                        onBlur={async () => {
                                            if (storyTitle.trim() === story.title) return
                                            const { error } = await supabase
                                                .from('stories')
                                                .update({ title: storyTitle })
                                                .eq('id', story.id)
                                            if (error) {
                                                console.error(error)
                                                alert('Error updating title')
                                            }
                                        }}
                                        className="font-bold text-lg sm:text-xl h-auto p-0 border-transparent hover:border-neutral-700 focus-visible:ring-0 bg-transparent px-1 -ml-1 w-full max-w-md transition-all shadow-none text-white hover:bg-neutral-800 rounded-md"
                                    />
                                    <Pencil className="w-4 h-4 text-neutral-500 opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                </>
                            )}
                        </div>
                        <p className="text-xs text-neutral-400">
                            {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'} • {readOnly ? 'Read-only preview' : 'Sequential Story Experience'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Link href={readOnly ? `/museum/stories/preview/${story.id}/analytics` : `/curator/story/${story.id}/analytics`}>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent text-white border-neutral-700 hover:bg-neutral-800 hover:text-white text-xs h-8"
                        >
                            <BarChart3 className="w-3.5 h-3.5 mr-1" />
                            Analytics
                        </Button>
                    </Link>

                    {!readOnly && (
                        <>
                            <LanguageManager story={story} />
                            <StorySettingsDialog
                                story={story}
                                onUpdate={() => {
                                    window.location.reload()
                                }}
                            />
                            <Link href="/curator/tts">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-transparent text-purple-400 border-purple-500/30 hover:bg-purple-950/40 hover:text-purple-300 text-xs h-8"
                                >
                                    <Music className="w-3.5 h-3.5 mr-1" />
                                    TTS Studio
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                onClick={handleAddStage}
                                disabled={isSaving}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 h-8 flex items-center gap-1.5 cursor-pointer"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Stage
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* MAIN STAGE LIST CONTAINER */}
            <div className="flex-1 w-full bg-neutral-950 p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">
                    {stages.length === 0 ? (
                        /* Empty State */
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-neutral-900/30 p-8">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div className="space-y-1 max-w-sm">
                                <h3 className="text-base font-bold text-white">No Stages in this Story Yet</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    Stories are composed of sequential stages. Click below to add your first interactive stage.
                                </p>
                            </div>
                            {!readOnly && (
                                <Button
                                    size="sm"
                                    onClick={handleAddStage}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xl shadow-purple-900/40 mt-2"
                                >
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Create First Stage
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* Stages Sequence */
                        <div className="space-y-3">
                            {stages.map((stage, idx) => {
                                const thumbnail = extractStageThumbnail(stage)
                                const features = detectStageFeatures(stage)
                                const trigger = triggerMap.get(stage.id)
                                const isFirst = idx === 0
                                const isLast = idx === stages.length - 1

                                return (
                                    <div
                                        key={stage.id}
                                        onClick={() => {
                                            setSelectedStage(stage)
                                            setIsSidebarOpen(true)
                                        }}
                                        className="group relative rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-purple-500/50 hover:bg-neutral-900/95 transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:shadow-purple-950/20 cursor-pointer select-none"
                                    >
                                        {/* Left Info: Index, Thumbnail, Title & Badges */}
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            {/* Stage Number Index */}
                                            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xs font-mono font-bold text-purple-300 shrink-0">
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>

                                            {/* Thumbnail / Icon Preview */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/15 bg-black/60 shrink-0 flex items-center justify-center shadow-md group-hover:border-purple-400/40 transition-colors">
                                                {thumbnail ? (
                                                    <img
                                                        src={thumbnail}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-neutral-500 group-hover:text-purple-400 transition-colors">
                                                        <Smartphone className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title & Metadata Badges */}
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-purple-200 transition-colors truncate">
                                                        {stage.title || `Stage ${idx + 1}`}
                                                    </h3>
                                                    {trigger && (
                                                        <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-white/10 text-[10px] font-mono text-neutral-300 shrink-0 flex items-center gap-1">
                                                            <QrCode className="w-3 h-3 text-neutral-400" />
                                                            {trigger.code}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content Component Badges */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-300 flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5" />
                                                        Interactive Stage
                                                    </span>

                                                    {features.hasQuiz && (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-300 flex items-center gap-1">
                                                            <HelpCircle className="w-2.5 h-2.5" />
                                                            Quiz
                                                        </span>
                                                    )}

                                                    {features.hasScratch && (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-300 flex items-center gap-1">
                                                            <Ticket className="w-2.5 h-2.5" />
                                                            Scratch Card
                                                        </span>
                                                    )}

                                                    {features.hasGallery && (
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-300 flex items-center gap-1">
                                                            <ImageIcon className="w-2.5 h-2.5" />
                                                            Gallery
                                                        </span>
                                                    )}

                                                    {features.hasAudio && (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-300 flex items-center gap-1">
                                                            <Music className="w-2.5 h-2.5" />
                                                            Audio / Guide
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Actions: Reorder, Edit, Duplicate, Delete */}
                                        <div
                                            className="flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Reorder Buttons */}
                                            {!readOnly && (
                                                <div className="flex items-center bg-neutral-950/80 rounded-xl border border-white/10 p-0.5 mr-1">
                                                    <button
                                                        type="button"
                                                        disabled={isFirst}
                                                        onClick={() => handleMoveStage(idx, 'up')}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer transition-colors"
                                                        title="Move Stage Up"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isLast}
                                                        onClick={() => handleMoveStage(idx, 'down')}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer transition-colors"
                                                        title="Move Stage Down"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Duplicate Button */}
                                            {!readOnly && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDuplicateStage(stage)}
                                                    className="h-8 px-2.5 text-xs text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl"
                                                    title="Duplicate Stage"
                                                >
                                                    <Copy className="w-3.5 h-3.5 sm:mr-1.5" />
                                                    <span className="hidden sm:inline">Duplicate</span>
                                                </Button>
                                            )}

                                            {/* Delete Button */}
                                            {!readOnly && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteStage(stage.id)}
                                                    className="h-8 px-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl"
                                                    title="Delete Stage"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}

                                            {/* Open Stage Editor Button */}
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedStage(stage)
                                                    setIsSidebarOpen(true)
                                                }}
                                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 h-8 px-3 rounded-xl ml-1 cursor-pointer"
                                            >
                                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                                Edit Stage
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* STAGE EDITOR MODAL */}
            <StageProperties
                stage={selectedStage}
                story={story}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSave={handleStageUpdate}
                readOnly={readOnly}
                isAIModeAllowed={isAIModeAllowed}
                onDelete={(id) => {
                    if (id && !readOnly) {
                        handleDeleteStage(id)
                    }
                }}
                onDuplicate={() => !readOnly && selectedStage && handleDuplicateStage(selectedStage)}
            />

            {/* Custom Delete Stage Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={Boolean(stageToDelete)}
                onClose={() => !isDeletingStage && setStageToDelete(null)}
                onConfirm={handleConfirmDeleteStage}
                title="Delete Stage"
                description="Are you sure you want to delete this stage? This action cannot be undone and will permanently remove all its content, interactive components, and associated QR code triggers."
                itemTitle={stageToDelete?.stage.title || (stageToDelete ? `Stage ${stageToDelete.index + 1}` : undefined)}
                itemSubtitle={stageToDelete ? `Stage ${String(stageToDelete.index + 1).padStart(2, '0')}` : undefined}
                itemBadge={stageToDelete ? triggerMap.get(stageToDelete.stage.id)?.code : undefined}
                itemThumbnail={stageToDelete ? extractStageThumbnail(stageToDelete.stage) : null}
                confirmText="Delete Stage"
                cancelText="Cancel"
                isDeleting={isDeletingStage}
            />
        </div>
    )
}
