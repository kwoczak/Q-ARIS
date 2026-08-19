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
import {
    HelpCircle,
    Plus,
    Trash2,
    CheckCircle2,
    Sparkles,
    FileText,
    Award,
    Lightbulb,
    Layers
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

export type InspectorComponentData =
    | { type: 'quiz'; data: QuizData }
    | { type: 'fact_card'; data: FactCardData }

interface AIComponentInspectorProps {
    isOpen: boolean
    onClose: () => void
    componentData: InspectorComponentData | null
    onSave: (updatedHtml: string) => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

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

    return `<div data-component="quiz" class="p-5 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-4 my-2">
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
    return `<div data-component="fact_card" class="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg flex items-start gap-3.5 hover:border-amber-500/40 transition-all my-2">
  <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">${icon}</div>
  <div class="flex-1 min-w-0">
    <h4 class="font-bold text-sm text-white">${fact.title}</h4>
    <p class="text-xs text-neutral-300 mt-1 leading-relaxed break-words">${fact.description}</p>
  </div>
</div>`
}

export function AIComponentInspector({
    isOpen,
    onClose,
    componentData,
    onSave
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
        }
    }, [componentData])

    // Option manipulation
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
        if (options.length <= 2) return // Keep minimum 2 options
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
        }

        onClose()
    }

    if (!componentData) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-2xl z-50">
                {/* Header */}
                <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            {componentData.type === 'quiz' ? <HelpCircle className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-white">
                                {componentData.type === 'quiz' ? 'Quiz Settings' : 'Fact Card Settings'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-400">
                                {componentData.type === 'quiz'
                                    ? 'Customize question, answer options, and correct answer.'
                                    : 'Customize icon, title, and description.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Body */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {componentData.type === 'quiz' ? (
                        <>
                            {/* Quiz Title & Points */}
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

                            {/* Question */}
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

                            {/* Options List */}
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
                                                {/* Select Correct Answer Radio */}
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

                                                {/* Text Input */}
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    placeholder={`Option ${letter} text...`}
                                                    className="h-8 flex-1 bg-transparent border-0 text-xs text-white focus-visible:ring-0 px-1"
                                                />

                                                {/* Delete Option (if > 2) */}
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

                            {/* Explanation / Feedback */}
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
                    ) : (
                        <>
                            {/* Fact Card Editor */}
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
                </div>

                {/* Footer Actions */}
                <DialogFooter className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-xs text-neutral-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-lg shadow-purple-900/40"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Save Component Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
