'use client'

import React, { useState, useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMPOSITION_ARCHETYPES, CompositionArchetype } from '@/lib/ai-archetypes'
import {
    Sparkles,
    Check,
    Search,
    Layers,
    ArrowRight,
    Palette,
    Compass,
    Cpu,
    BookOpen,
    HelpCircle,
    X
} from 'lucide-react'

interface AIArchetypeModalProps {
    isOpen: boolean
    onClose: () => void
    selectedArchetypeId: string
    onSelectArchetype: (archetypeId: string) => void
    onApplyAndEnhance?: (archetypeId: string) => void
    hasPromptText?: boolean
}

type CategoryTab = 'all' | 'museum' | 'interactive' | 'editorial' | 'science'

export function AIArchetypeModal({
    isOpen,
    onClose,
    selectedArchetypeId,
    onSelectArchetype,
    onApplyAndEnhance,
    hasPromptText = false
}: AIArchetypeModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<CategoryTab>('all')

    const filteredArchetypes = useMemo(() => {
        return COMPOSITION_ARCHETYPES.filter((arch) => {
            const matchesCategory = activeCategory === 'all' || arch.category === activeCategory
            const matchesSearch =
                !searchQuery.trim() ||
                arch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                arch.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                arch.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                arch.highlightTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

            return matchesCategory && matchesSearch
        })
    }, [activeCategory, searchQuery])

    const handlePick = (id: string, shouldEnhance = false) => {
        onSelectArchetype(id)
        if (shouldEnhance && onApplyAndEnhance) {
            onApplyAndEnhance(id)
        }
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-3xl z-50 flex flex-col max-h-[90vh]">
                {/* Header */}
                <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/80 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center text-white text-xl shadow-lg shadow-purple-950/50">
                                🎨
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                                    <span>Composition Archetypes & Layout Presets</span>
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-medium">
                                        15 Presets
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-neutral-400">
                                    Select a storytelling blueprint to preview component structure, narrative flow, and visual mood.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Search & Category Filter Bar */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
                        {/* Categories */}
                        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setActiveCategory('all')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    activeCategory === 'all'
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                All (15)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('museum')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    activeCategory === 'museum'
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                🏛️ Museum & Art
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('interactive')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    activeCategory === 'interactive'
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                ⚡ Gamified & Quests
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('science')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    activeCategory === 'science'
                                        ? 'bg-cyan-600 text-white shadow-md'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                🔬 Science & Tech
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('editorial')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    activeCategory === 'editorial'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                📖 Stories & Guides
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search presets..."
                                className="h-8 pl-8 text-xs bg-neutral-900 border-white/10 text-white placeholder:text-neutral-500 rounded-full"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Preset Cards Grid */}
                <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
                    {/* Auto-Detect Card */}
                    <div
                        onClick={() => handlePick('auto')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            selectedArchetypeId === 'auto'
                                ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-neutral-900 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                                : 'bg-neutral-900/40 border-white/10 hover:border-amber-500/40 hover:bg-neutral-900/70'
                        }`}
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
                                🎲
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-white">Auto-Detect (Dynamic AI Choice)</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider">
                                        Recommended
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-300 mt-1 leading-relaxed max-w-xl">
                                    AI analyzes your topic and materials to dynamically choose the optimal narrative rhythm, component sequence, and atmospheric background.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {selectedArchetypeId === 'auto' && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                                    <Check className="w-3.5 h-3.5" /> Selected
                                </span>
                            )}
                            <Button
                                type="button"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePick('auto')
                                }}
                                className="h-8 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md cursor-pointer"
                            >
                                Use Auto-Detect
                            </Button>
                        </div>
                    </div>

                    {/* 15 Detailed Archetype Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                        {filteredArchetypes.map((arch) => {
                            const isSelected = selectedArchetypeId === arch.id

                            return (
                                <div
                                    key={arch.id}
                                    onClick={() => handlePick(arch.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-purple-950/60 via-neutral-900 to-neutral-950 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-1 ring-purple-400'
                                            : 'bg-neutral-900/50 border-white/10 hover:border-purple-500/40 hover:bg-neutral-900/80'
                                    }`}
                                >
                                    <div>
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-2xl">{arch.icon}</span>
                                                <div>
                                                    <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                                                        {arch.name}
                                                    </h4>
                                                    <span className="text-[10px] text-purple-400 font-medium">
                                                        {arch.categoryLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {isSelected ? (
                                                <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                                                    <Check className="w-3.5 h-3.5" />
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-500 font-mono group-hover:text-purple-300">
                                                    #{arch.id}
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed">
                                            {arch.desc}
                                        </p>

                                        {/* VISUAL BLUEPRINT FLOW (Component Path) */}
                                        <div className="mt-3.5 p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                                                <span className="flex items-center gap-1 text-purple-300">
                                                    <Layers className="w-3 h-3" /> Screen Component Blueprint:
                                                </span>
                                                <span className="text-amber-400 font-mono">{arch.blueprint.length} Blocks</span>
                                            </div>

                                            {/* Blueprint Chain Pills */}
                                            <div className="flex items-center gap-1 flex-wrap pt-1">
                                                {arch.blueprint.map((step, sIdx) => (
                                                    <React.Fragment key={sIdx}>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-white/10 text-[10px] text-neutral-200 font-medium whitespace-nowrap shadow-inner">
                                                            <span>{step.icon}</span>
                                                            <span>{step.label}</span>
                                                        </span>
                                                        {sIdx < arch.blueprint.length - 1 && (
                                                            <ArrowRight className="w-2.5 h-2.5 text-neutral-600 shrink-0" />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mood / Color Theme Badge */}
                                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                                            <span className="text-neutral-400 flex items-center gap-1 text-[10px]">
                                                <Palette className="w-3 h-3 text-amber-400" /> Atmospheric Mood:
                                            </span>
                                            <span className="text-[10px] font-medium text-neutral-300 font-mono">
                                                {arch.colorTheme}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-2.5 flex items-center justify-end gap-2">
                                        {hasPromptText && onApplyAndEnhance && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePick(arch.id, true)
                                                }}
                                                className="h-7 text-[11px] bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900 hover:text-white"
                                            >
                                                <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                                                Select & Enhance Prompt
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePick(arch.id)
                                            }}
                                            className={`h-7 text-[11px] font-semibold ${
                                                isSelected
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                        >
                                            {isSelected ? 'Current Preset' : 'Select Preset'}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between sm:justify-between shrink-0">
                    <span className="text-xs text-neutral-400">
                        Selected: <strong className="text-white font-mono">{selectedArchetypeId === 'auto' ? 'Auto-Detect' : COMPOSITION_ARCHETYPES.find(a => a.id === selectedArchetypeId)?.name || selectedArchetypeId}</strong>
                    </span>
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8 px-4"
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
