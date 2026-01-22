'use client'

import { QuizContent, BlockStyle } from "@/types/schema"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Gift } from "lucide-react"
import { useVisitor } from "../VisitorContext"
import confetti from 'canvas-confetti'

interface QuizBlockProps {
    blockId: string
    content: QuizContent
    style: any
}

export function QuizBlock({ blockId, content, style }: QuizBlockProps) {
    const { addPoints, hasCompletedBlock } = useVisitor()
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)

    // Check if already completed from persistent storage
    const alreadyCompleted = hasCompletedBlock(blockId)

    const handleSelect = (id: string) => {
        if (isSubmitted || alreadyCompleted) return
        setSelectedAnswerId(id)
    }

    const handleSubmit = () => {
        if (!selectedAnswerId || isSubmitted || alreadyCompleted) return

        const answer = content.answers.find(a => a.id === selectedAnswerId)
        if (!answer) return

        setIsSubmitted(true)
        const correct = answer.isCorrect
        setIsCorrect(correct)

        if (correct) {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
            // Add points
            addPoints(content.points || 10, blockId)
        }
    }

    // Determine state for UI
    const isLocked = isSubmitted || alreadyCompleted

    return (
        <div style={style} className="w-full">
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight">{content.question}</h3>
                    {alreadyCompleted && (
                        <div className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    {content.answers.map(answer => {
                        const isSelected = selectedAnswerId === answer.id
                        // Reveal correctness after submit or if already completed (and correct)
                        // Actually, if already completed, we might not know WHICH one they picked, but we can show the correct one.
                        const showCorrect = (isSubmitted || alreadyCompleted) && answer.isCorrect
                        const showWrong = isSubmitted && isSelected && !answer.isCorrect

                        let variantClass = "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        if (isSelected) variantClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                        if (showCorrect) variantClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 ring-1 ring-green-500"
                        if (showWrong) variantClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-1 ring-red-500"

                        return (
                            <button
                                key={answer.id}
                                disabled={isLocked}
                                onClick={() => handleSelect(answer.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${variantClass} ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <span>{answer.text}</span>
                                {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                            </button>
                        )
                    })}
                </div>

                {!alreadyCompleted && !isSubmitted && (
                    <Button
                        className="w-full"
                        disabled={!selectedAnswerId}
                        onClick={handleSubmit}
                    >
                        Submit Answer
                    </Button>
                )}

                {(isSubmitted || alreadyCompleted) && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${isCorrect || alreadyCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isCorrect || alreadyCompleted ? (
                            <div className="flex flex-col items-center">
                                <span className="font-bold flex items-center gap-2">
                                    <Gift className="w-4 h-4" />
                                    +{content.points || 10} Points Earned!
                                </span>
                                {content.answers.find(a => a.isCorrect)?.feedback && (
                                    <p className="mt-1 opacity-90">{content.answers.find(a => a.isCorrect)?.feedback}</p>
                                )}
                            </div>
                        ) : (
                            <span>Incorrect. Try again next time!</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
