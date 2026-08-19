'use client'

import React, { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { AIAttachment } from '@/types/schema'
import { AIMediaLibraryModal } from './AIMediaLibraryModal'
import {
    HelpCircle,
    Plus,
    Trash2,
    CheckCircle2,
    Sparkles,
    FileText,
    Award,
    Lightbulb,
    Layers,
    Image as ImageIcon,
    Music,
    Ticket,
    Quote,
    BarChart3
} from 'lucide-react'

export interface QuizData {
    question: string
    options: string[]
    correctIndex: number
    points: string
    explanation: string
    title?: string
}

export interface FactCardData {
    icon: string
    title: string
    description: string
}

export interface ScratchCardData {
    hiddenImage: string
    hiddenTitle: string
    hiddenDescription: string
    coverText: string
    scratchInstruction: string
    foilTheme: 'silver' | 'gold' | 'cosmic'
    points: string
}

export interface AudioCardData {
    audioUrl: string
    title: string
    subtitle: string
}

export type InspectorComponentData =
    | { type: 'quiz'; data: QuizData }
    | { type: 'fact_card'; data: FactCardData }
    | { type: 'scratch_card'; data: ScratchCardData }
    | { type: 'audio'; data: AudioCardData }

interface AIComponentInspectorProps {
    isOpen: boolean
    onClose: () => void
    componentData: InspectorComponentData | null
    onSave: (updatedHtml: string) => void
    onDelete?: () => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// =========================================================================
// HTML GENERATORS
// =========================================================================

export function generateQuizHtml(quiz: QuizData): string {
    const pointsBadge = quiz.points ? quiz.points : '+50 PTS'
    const titleText = quiz.title || '⚡ Explorer Quiz'
    const explanation = quiz.explanation || 'Here is the explanation for this answer!'

    const optionsHtml = quiz.options
        .map((opt, idx) => {
            const letter = LETTERS[idx] || `${idx + 1}`
            const isCorrect = idx === quiz.correctIndex

            const clickHandler = isCorrect
                ? `const root=this.closest('.space-y-4'); const fb=root.querySelector('.quiz-fb'); fb.classList.remove('hidden'); fb.innerHTML='<span class=\\'text-emerald-400 font-bold\\'>🎉 Correct! Well done!</span> ${explanation.replace(/'/g, "\\'")}'; this.classList.add('!bg-emerald-600/30','!border-emerald-500','!text-white'); root.querySelectorAll('button:not(.quaris-inspector-btn)').forEach(b=>b.disabled=true);`
                : `const root=this.closest('.space-y-4'); const fb=root.querySelector('.quiz-fb'); fb.classList.remove('hidden'); fb.innerHTML='<span class=\\'text-red-400 font-bold\\'>❌ Not quite.</span> The correct answer is ${LETTERS[quiz.correctIndex]}: ${quiz.options[quiz.correctIndex]?.replace(/'/g, "\\'")}. ${explanation.replace(/'/g, "\\'")}'; this.classList.add('!bg-red-600/30','!border-red-500'); root.querySelectorAll('button:not(.quaris-inspector-btn)').forEach(b=>b.disabled=true);`

            return `      <button type="button" onclick="${clickHandler}" class="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 text-xs font-medium text-neutral-200 transition-all flex items-center justify-between group cursor-pointer">
        <span>${letter}) ${opt}</span>
        <span class="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] group-hover:border-amber-400 font-mono">${letter}</span>
      </button>`
        })
        .join('\n')

    return `<div data-component="quiz" class="p-5 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-4 my-3">
  <div class="flex items-center justify-between">
    <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">${titleText}</span>
    <span class="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">${pointsBadge}</span>
  </div>
  <h3 class="font-bold text-sm sm:text-base text-white leading-snug">${quiz.question}</h3>
  <div class="space-y-2">
${optionsHtml}
  </div>
  <div class="quiz-fb hidden p-3.5 rounded-xl bg-neutral-900/90 border border-white/10 text-xs text-neutral-300 shadow-inner"></div>
</div>`
}

export function generateFactCardHtml(fact: FactCardData): string {
    const icon = fact.icon || '💎'
    return `<div data-component="fact_card" class="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg flex items-start gap-3.5 hover:border-amber-500/40 transition-all my-3">
  <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">${icon}</div>
  <div class="flex-1 min-w-0">
    <h4 class="font-bold text-sm text-white">${fact.title}</h4>
    <p class="text-xs text-neutral-300 mt-1 leading-relaxed break-words">${fact.description}</p>
  </div>
</div>`
}

export function generateScratchCardHtml(scratch: ScratchCardData): string {
    const foil = scratch.foilTheme || 'silver'
    const coverText = scratch.coverText || '🪙 SCRATCH TO REVEAL'
    const subtext = scratch.scratchInstruction || '(Rub with finger or mouse)'
    const points = scratch.points || '+50 PTS'

    return `<div data-component="scratch_card" data-foil="${foil}" data-cover="${encodeURIComponent(coverText)}" data-sub="${encodeURIComponent(subtext)}" class="relative my-3 rounded-3xl overflow-hidden border border-amber-500/40 bg-neutral-950 shadow-2xl group/scratch select-none" style="min-height: 230px;">
  <!-- Hidden Secret Underneath -->
  <div class="scratch-hidden-content p-5 flex flex-col items-center justify-center text-center space-y-3 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black min-h-[230px]">
    ${scratch.hiddenImage ? `<img class="scratch-hidden-img w-full max-h-48 object-cover rounded-2xl border border-white/10 shadow-lg" src="${scratch.hiddenImage}" alt="Secret Reveal" />` : ''}
    <div class="space-y-1">
      <span class="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">${points}</span>
      <h4 class="font-bold text-sm sm:text-base text-white scratch-hidden-title">${scratch.hiddenTitle}</h4>
      <p class="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto scratch-hidden-desc">${scratch.hiddenDescription}</p>
    </div>
  </div>
  <!-- Scratch Canvas Overlay -->
  <canvas class="scratch-canvas absolute inset-0 w-full h-full cursor-crosshair touch-none z-20"></canvas>
</div>`
}

export function generateAudioCardHtml(audio: AudioCardData): string {
    return `<div data-component="audio" class="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-md shadow-xl flex items-center gap-3.5 my-3">
  <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
    <span class="text-lg">🎧</span>
  </div>
  <div class="flex-1 min-w-0">
    <h4 class="font-bold text-xs sm:text-sm text-white truncate">${audio.title || 'Curator Audio Guide'}</h4>
    <p class="text-[11px] text-neutral-300 truncate">${audio.subtitle || 'Audio Narration'}</p>
    <audio controls class="w-full h-8 mt-2 opacity-90" src="${audio.audioUrl || ''}">
      Your browser does not support audio.
    </audio>
  </div>
</div>`
}

export function generateGalleryHtml(): string {
    return `<div data-component="gallery" class="space-y-2.5 my-3">
  <div class="flex items-center justify-between">
    <span class="text-xs font-bold uppercase tracking-wider text-amber-400">🖼️ Exhibit Gallery</span>
    <span class="text-[11px] text-neutral-400">Swipe to explore</span>
  </div>
  <div class="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
    <div class="relative rounded-2xl overflow-hidden border border-white/15 shrink-0 snap-start w-56 h-40 group">
      <img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover" />
      <div class="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent text-[11px] text-white font-medium">Exhibit A</div>
    </div>
    <div class="relative rounded-2xl overflow-hidden border border-white/15 shrink-0 snap-start w-56 h-40 group">
      <img src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover" />
      <div class="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent text-[11px] text-white font-medium">Exhibit B</div>
    </div>
  </div>
</div>`
}

export function generateStatsHtml(): string {
    return `<div data-component="stats" class="grid grid-cols-2 gap-2.5 my-3">
  <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
    <div class="text-xl font-bold font-mono text-amber-400">21,287 km</div>
    <div class="text-[11px] text-neutral-400 mt-0.5">Circumference</div>
  </div>
  <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
    <div class="text-xl font-bold font-mono text-purple-400">-63°C</div>
    <div class="text-[11px] text-neutral-400 mt-0.5">Avg Temperature</div>
  </div>
</div>`
}

export function generateQuoteHtml(): string {
    return `<div data-component="quote" class="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-amber-950/20 border-l-4 border-amber-400 border-y border-r border-white/10 my-3">
  <p class="italic text-xs sm:text-sm text-neutral-200 leading-relaxed">"Across the cosmic sea, the exploration of distant worlds reflects the limitless boundaries of human curiosity."</p>
  <span class="block mt-2 text-[10px] uppercase font-bold tracking-wider text-amber-300">— Chief Curator</span>
</div>`
}

// =========================================================================
// MAIN INSPECTOR COMPONENT
// =========================================================================

export function AIComponentInspector({
    isOpen,
    onClose,
    componentData,
    onSave,
    onDelete
}: AIComponentInspectorProps) {
    // Quiz State
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState<string[]>([])
    const [correctIndex, setCorrectIndex] = useState(0)
    const [points, setPoints] = useState('+50 PTS')
    const [explanation, setExplanation] = useState('')
    const [quizTitle, setQuizTitle] = useState('⚡ Explorer Quiz')

    // Fact Card State
    const [factIcon, setFactIcon] = useState('💎')
    const [factTitle, setFactTitle] = useState('')
    const [factDescription, setFactDescription] = useState('')

    // Scratch Card State
    const [scratchHiddenImg, setScratchHiddenImg] = useState('')
    const [scratchHiddenTitle, setScratchHiddenTitle] = useState('')
    const [scratchHiddenDesc, setScratchHiddenDesc] = useState('')
    const [scratchCoverText, setScratchCoverText] = useState('🪙 SCRATCH TO REVEAL')
    const [scratchSubtext, setScratchSubtext] = useState('(Rub with finger or mouse)')
    const [scratchFoil, setScratchFoil] = useState<'silver' | 'gold' | 'cosmic'>('silver')
    const [scratchPoints, setScratchPoints] = useState('+50 PTS')

    // Audio Card State
    const [audioUrl, setAudioUrl] = useState('')
    const [audioTitle, setAudioTitle] = useState('Curator Audio Guide')
    const [audioSubtitle, setAudioSubtitle] = useState('Audio Narration')

    // Media modal for picking hidden scratch image or audio
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
    const [mediaModalCategory, setMediaModalCategory] = useState<'image' | 'audio'>('image')

    useEffect(() => {
        if (!componentData) return

        if (componentData.type === 'quiz') {
            const q = componentData.data
            setQuestion(q.question || '')
            setOptions(q.options && q.options.length > 0 ? [...q.options] : ['Option A', 'Option B', 'Option C'])
            setCorrectIndex(typeof q.correctIndex === 'number' ? q.correctIndex : 0)
            setPoints(q.points || '+50 PTS')
            setExplanation(q.explanation || '')
            setQuizTitle(q.title || '⚡ Explorer Quiz')
        } else if (componentData.type === 'fact_card') {
            const f = componentData.data
            setFactIcon(f.icon || '💎')
            setFactTitle(f.title || '')
            setFactDescription(f.description || '')
        } else if (componentData.type === 'scratch_card') {
            const s = componentData.data
            setScratchHiddenImg(s.hiddenImage || '')
            setScratchHiddenTitle(s.hiddenTitle || 'Secret Artifact Revealed')
            setScratchHiddenDesc(s.hiddenDescription || 'You have uncovered the secret hidden detail of this exhibit!')
            setScratchCoverText(s.coverText || '🪙 SCRATCH TO REVEAL')
            setScratchSubtext(s.scratchInstruction || '(Rub with finger or mouse)')
            setScratchFoil(s.foilTheme || 'silver')
            setScratchPoints(s.points || '+50 PTS')
        } else if (componentData.type === 'audio') {
            const a = componentData.data
            setAudioUrl(a.audioUrl || '')
            setAudioTitle(a.title || 'Curator Audio Guide')
            setAudioSubtitle(a.subtitle || 'Audio Narration')
        }
    }, [componentData])

    // Option manipulation for quiz
    const handleOptionChange = (index: number, val: string) => {
        const updated = [...options]
        updated[index] = val
        setOptions(updated)
    }

    const handleAddOption = () => {
        if (options.length >= 6) return
        setOptions([...options, `New Option ${LETTERS[options.length] || options.length + 1}`])
    }

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return
        const updated = options.filter((_, i) => i !== index)
        setOptions(updated)
        if (correctIndex >= updated.length) {
            setCorrectIndex(Math.max(0, updated.length - 1))
        } else if (correctIndex === index) {
            setCorrectIndex(0)
        }
    }

    const handleSave = () => {
        if (!componentData) return

        if (componentData.type === 'quiz') {
            const newHtml = generateQuizHtml({
                question,
                options,
                correctIndex,
                points,
                explanation,
                title: quizTitle
            })
            onSave(newHtml)
        } else if (componentData.type === 'fact_card') {
            const newHtml = generateFactCardHtml({
                icon: factIcon,
                title: factTitle,
                description: factDescription
            })
            onSave(newHtml)
        } else if (componentData.type === 'scratch_card') {
            const newHtml = generateScratchCardHtml({
                hiddenImage: scratchHiddenImg,
                hiddenTitle: scratchHiddenTitle,
                hiddenDescription: scratchHiddenDesc,
                coverText: scratchCoverText,
                scratchInstruction: scratchSubtext,
                foilTheme: scratchFoil,
                points: scratchPoints
            })
            onSave(newHtml)
        } else if (componentData.type === 'audio') {
            const newHtml = generateAudioCardHtml({
                audioUrl,
                title: audioTitle,
                subtitle: audioSubtitle
            })
            onSave(newHtml)
        }

        onClose()
    }

    const handleMediaSelected = (assets: AIAttachment[]) => {
        if (assets && assets.length > 0 && assets[0].url) {
            if (mediaModalCategory === 'image') {
                setScratchHiddenImg(assets[0].url)
            } else {
                setAudioUrl(assets[0].url)
            }
        }
        setIsMediaModalOpen(false)
    }

    if (!componentData) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-2xl z-50">
                {/* Header */}
                <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            {componentData.type === 'quiz' && <HelpCircle className="w-4 h-4" />}
                            {componentData.type === 'fact_card' && <Layers className="w-4 h-4" />}
                            {componentData.type === 'scratch_card' && <Ticket className="w-4 h-4 text-amber-400" />}
                            {componentData.type === 'audio' && <Music className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-white">
                                {componentData.type === 'quiz' && 'Quiz Settings'}
                                {componentData.type === 'fact_card' && 'Fact Card Settings'}
                                {componentData.type === 'scratch_card' && 'Scratch Card Settings'}
                                {componentData.type === 'audio' && 'Audio Guide Settings'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-400">
                                {componentData.type === 'quiz' && 'Customize question, answer options, and correct answer.'}
                                {componentData.type === 'fact_card' && 'Customize icon, title, and description.'}
                                {componentData.type === 'scratch_card' && 'Set hidden image/secret, foil cover style, and points.'}
                                {componentData.type === 'audio' && 'Set audio track URL, guide title, and subtitle.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Body */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* 1. QUIZ EDITOR */}
                    {componentData.type === 'quiz' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        Badge / Title
                                    </label>
                                    <Input
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        placeholder="⚡ Explorer Quiz"
                                        className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                        Points
                                    </label>
                                    <Input
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                        placeholder="+50 PTS"
                                        className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                                    Question Text
                                </label>
                                <Textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Enter question text..."
                                    className="min-h-[75px] bg-neutral-900 border-white/10 text-xs text-white resize-none"
                                />
                            </div>

                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                                        <span>Answers ({options.length})</span>
                                        <span className="text-[10px] text-neutral-500 font-normal">
                                            (Select correct)
                                        </span>
                                    </label>
                                    {options.length < 6 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddOption}
                                            className="h-7 px-2.5 text-xs bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/60"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Option
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {options.map((opt, idx) => {
                                        const isCorrect = idx === correctIndex
                                        const letter = LETTERS[idx] || `${idx + 1}`

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                                    isCorrect
                                                        ? 'bg-emerald-950/30 border-emerald-500/40'
                                                        : 'bg-neutral-900/60 border-white/10'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setCorrectIndex(idx)}
                                                    className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all cursor-pointer ${
                                                        isCorrect
                                                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                                            : 'bg-white/5 border-white/20 text-neutral-400 hover:border-amber-400 hover:text-white'
                                                    }`}
                                                    title={isCorrect ? 'Correct answer' : 'Click to set as correct answer'}
                                                >
                                                    {letter}
                                                </button>

                                                <Input
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    placeholder={`Option ${letter} text...`}
                                                    className="h-8 flex-1 bg-transparent border-0 text-xs text-white focus-visible:ring-0 px-1"
                                                />

                                                {options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(idx)}
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                                        title="Delete this option"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                    Explanation after answering
                                </label>
                                <Textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Explanation shown after user answers..."
                                    className="min-h-[60px] bg-neutral-900 border-white/10 text-xs text-white resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* 2. FACT CARD EDITOR */}
                    {componentData.type === 'fact_card' && (
                        <>
                            <div className="grid grid-cols-[60px_1fr] gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">Icon</label>
                                    <Input
                                        value={factIcon}
                                        onChange={(e) => setFactIcon(e.target.value)}
                                        placeholder="💎"
                                        className="h-9 text-center text-base bg-neutral-900 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">Title</label>
                                    <Input
                                        value={factTitle}
                                        onChange={(e) => setFactTitle(e.target.value)}
                                        placeholder="Fact title..."
                                        className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">Description</label>
                                <Textarea
                                    value={factDescription}
                                    onChange={(e) => setFactDescription(e.target.value)}
                                    placeholder="Description text..."
                                    className="min-h-[100px] bg-neutral-900 border-white/10 text-xs text-white resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* 3. SCRATCH CARD EDITOR */}
                    {componentData.type === 'scratch_card' && (
                        <div className="space-y-4">
                            {/* Hidden Image */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-neutral-300">Hidden Image (Under Foil)</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMediaModalCategory('image')
                                            setIsMediaModalOpen(true)
                                        }}
                                        className="h-7 text-xs bg-neutral-900 border-white/10"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                                        Pick from Library
                                    </Button>
                                </div>
                                <Input
                                    value={scratchHiddenImg}
                                    onChange={(e) => setScratchHiddenImg(e.target.value)}
                                    placeholder="https://... (Hidden image URL)"
                                    className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                />
                            </div>

                            {/* Hidden Title & Points */}
                            <div className="grid grid-cols-[1fr_90px] gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">Secret Title</label>
                                    <Input
                                        value={scratchHiddenTitle}
                                        onChange={(e) => setScratchHiddenTitle(e.target.value)}
                                        placeholder="Secret Artifact Revealed"
                                        className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">Points</label>
                                    <Input
                                        value={scratchPoints}
                                        onChange={(e) => setScratchPoints(e.target.value)}
                                        placeholder="+50 PTS"
                                        className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                    />
                                </div>
                            </div>

                            {/* Hidden Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">Secret Description / Fun Fact</label>
                                <Textarea
                                    value={scratchHiddenDesc}
                                    onChange={(e) => setScratchHiddenDesc(e.target.value)}
                                    placeholder="Secret detail revealed after scratching..."
                                    className="min-h-[75px] bg-neutral-900 border-white/10 text-xs text-white resize-none"
                                />
                            </div>

                            {/* Foil Foil Style */}
                            <div className="space-y-1.5 pt-1">
                                <label className="text-xs font-semibold text-neutral-300">Foil Color Theme</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['silver', 'gold', 'cosmic'] as const).map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setScratchFoil(f)}
                                            className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                                                scratchFoil === f
                                                    ? 'border-purple-500 bg-purple-950/40 text-purple-300 shadow-md ring-1 ring-purple-500/40'
                                                    : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
                                            }`}
                                        >
                                            {f === 'silver' && '🪙 Silver Foil'}
                                            {f === 'gold' && '✨ Gold Foil'}
                                            {f === 'cosmic' && '🌌 Cosmic Foil'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. AUDIO CARD EDITOR */}
                    {componentData.type === 'audio' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-neutral-300">Audio Track URL</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMediaModalCategory('audio')
                                            setIsMediaModalOpen(true)
                                        }}
                                        className="h-7 text-xs bg-neutral-900 border-white/10"
                                    >
                                        <Music className="w-3.5 h-3.5 mr-1" />
                                        Pick Audio
                                    </Button>
                                </div>
                                <Input
                                    value={audioUrl}
                                    onChange={(e) => setAudioUrl(e.target.value)}
                                    placeholder="https://... (Audio MP3/WAV URL)"
                                    className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">Guide Title</label>
                                <Input
                                    value={audioTitle}
                                    onChange={(e) => setAudioTitle(e.target.value)}
                                    placeholder="Curator Audio Guide"
                                    className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">Subtitle</label>
                                <Input
                                    value={audioSubtitle}
                                    onChange={(e) => setAudioSubtitle(e.target.value)}
                                    placeholder="Audio Narration (2:15)"
                                    className="h-9 bg-neutral-900 border-white/10 text-xs text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions with DELETE COMPONENT */}
                <DialogFooter className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between sm:justify-between">
                    <div className="flex items-center gap-2">
                        {onDelete && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    onDelete()
                                    onClose()
                                }}
                                className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs h-8"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Delete Component
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-xs text-neutral-400 hover:text-white h-8"
                        >
                            Cancel
                        </Button>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-lg shadow-purple-900/40 h-8"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Save Component Changes
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Media Picker Modal */}
            <AIMediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelectAssets={handleMediaSelected}
                initialCategory={mediaModalCategory}
            />
        </Dialog>
    )
}
