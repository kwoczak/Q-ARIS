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
    enablePoints?: boolean
}

export function QuizBlock({ blockId, content, style, enablePoints = true }: QuizBlockProps) {
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
            if (enablePoints) {
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
    }

    // Determine state for UI
    const isLocked = isSubmitted || alreadyCompleted

    // Styles from props
    const containerStyle = {
        backgroundColor: style.backgroundColor || 'rgba(255, 255, 255, 0.5)',
        color: style.color || 'inherit',
        fontFamily: style.fontFamily,
        textAlign: style.textAlign,
        fontSize: style.fontSize,
        borderRadius: style.borderRadius || '0.75rem',
        padding: style.padding || '1.5rem',
        marginBottom: style.marginBottom
    }

    return (
        <div style={{ marginBottom: style.marginBottom }} className="w-full">
            <div style={containerStyle} className="backdrop-blur-sm shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight">{content.question}</h3>
                    {alreadyCompleted && (
                        <div className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Done
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    {content.answers.map(answer => {
                        const isSelected = selectedAnswerId === answer.id
                        // Reveal correctness after submit or if already completed
                        // If wrong selection, show correct one too.
                        const showCorrect = (isSubmitted || alreadyCompleted) && answer.isCorrect
                        // Show wrong if THIS answer was selected and is wrong
                        const showWrong = isSubmitted && isSelected && !answer.isCorrect

                        let variantClass = "border-neutral-200 hover:bg-neutral-50/50 dark:border-neutral-700 dark:hover:bg-neutral-800/50"

                        // Custom styling for states
                        if (isSelected && !isSubmitted && !alreadyCompleted) {
                            variantClass = "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        }

                        if (showCorrect) {
                            variantClass = "border-green-500 bg-green-500/20 ring-1 ring-green-500 font-medium"
                        }

                        if (showWrong) {
                            variantClass = "border-red-500 bg-red-500/20 ring-1 ring-red-500 opacity-80"
                        }

                        // Inherit text color unless specific state override (usually text is inherited from container)
                        // But for feedback states, we might want specific colors? Or keep inherited and use bg/border/icon to convey meaning.
                        // Let's keep inherited text color primarily, but maybe add icon colors.

                        return (
                            <button
                                key={answer.id}
                                disabled={isLocked}
                                onClick={() => handleSelect(answer.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${variantClass} ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
                                style={{
                                    // Override specific colors if needed, otherwise inherit
                                }}
                            >
                                <span>{answer.text}</span>
                                {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
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
                                    {enablePoints ? (
                                        <>
                                            <Gift className="w-4 h-4" />
                                            +{content.points || 10} Points Earned!
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Correct Answer!
                                        </>
                                    )}
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
