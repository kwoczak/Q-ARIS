'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, BrainCircuit, Code, Eye, CheckCircle2 } from 'lucide-react'

interface AIProgressBarProps {
    isGenerating: boolean
    customStepMessage?: string
}

const STEPS = [
    { label: 'Przetwarzanie materiałów & promptu', icon: Sparkles, duration: 1500 },
    { label: 'Analiza stylu wizualnego & wytycznych', icon: Eye, duration: 2500 },
    { label: 'OpenAI Reasoning (Medium) - planowanie kompozycji', icon: BrainCircuit, duration: 4500 },
    { label: 'Generowanie kodu HTML & responsywnego układu', icon: Code, duration: 3500 },
    { label: 'Kompilowanie i odświeżanie podglądu na żywo', icon: CheckCircle2, duration: 1500 }
]

export function AIProgressBar({ isGenerating, customStepMessage }: AIProgressBarProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [progressPercent, setProgressPercent] = useState(10)

    useEffect(() => {
        if (!isGenerating) {
            setCurrentStepIndex(0)
            setProgressPercent(10)
            return
        }

        let current = 0
        setCurrentStepIndex(0)
        setProgressPercent(15)

        const interval = setInterval(() => {
            current += 1
            if (current < STEPS.length) {
                setCurrentStepIndex(current)
                setProgressPercent(Math.min(20 + current * 18, 92))
            }
        }, 2200)

        return () => clearInterval(interval)
    }, [isGenerating])

    if (!isGenerating) return null

    const currentStep = STEPS[currentStepIndex] || STEPS[0]
    const StepIcon = currentStep.icon

    return (
        <div className="w-full bg-neutral-900/90 border border-purple-500/30 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Current Step Status */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-purple-300 font-medium">
                    <StepIcon className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="truncate">
                        {customStepMessage || currentStep.label}
                    </span>
                </div>
                <div className="font-mono text-purple-400 font-bold">
                    {progressPercent}%
                </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-white/5 relative">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1 pt-1">
                {STEPS.map((step, idx) => (
                    <div
                        key={step.label}
                        className={`h-1 rounded-full transition-colors ${
                            idx <= currentStepIndex
                                ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                : 'bg-neutral-800'
                        }`}
                        title={step.label}
                    />
                ))}
            </div>

            <p className="text-[11px] text-neutral-400 text-center italic">
                Model OpenAI analizuje Twoje wytyczne w trybie głębokiego myślenia (Reasoning Medium)...
            </p>
        </div>
    )
}
