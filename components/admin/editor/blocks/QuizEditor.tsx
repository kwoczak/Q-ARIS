'use client'
import { generateId } from "@/lib/utils";

import { StageBlock, QuizContent } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"

interface QuizEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function QuizEditor({ block, onChange }: QuizEditorProps) {
    const content = block.content as QuizContent

    // Initialize defaults if empty
    if (!content.question && !content.answers) {
        // We shouldn't mutate props directly in render usually, but for initialization it handles the first render.
        // Better pattern is to handle this in addBlock. For now, we assume addBlock did basic init, or we render safe UI.
    }

    const updateContent = (updates: Partial<QuizContent>) => {
        onChange({
            ...block,
            content: {
                ...content,
                ...updates
            }
        })
    }

    const addAnswer = () => {
        const newAnswer = {
            id: generateId(),
            text: '',
            isCorrect: false
        }
        updateContent({ answers: [...(content.answers || []), newAnswer] })
    }

    const updateAnswer = (id: string, updates: any) => {
        const newAnswers = content.answers.map(a =>
            a.id === id ? { ...a, ...updates } : a
        )
        // If setting correct, unset others?
        // Usually valid quizzes have one correct answer for simplicity here.
        if (updates.isCorrect) {
            newAnswers.forEach(a => {
                if (a.id !== id) a.isCorrect = false
            })
        }
        updateContent({ answers: newAnswers })
    }

    const removeAnswer = (id: string) => {
        updateContent({ answers: content.answers.filter(a => a.id !== id) })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                    value={content.question || ''}
                    onChange={(e) => updateContent({ question: e.target.value })}
                    placeholder="e.g. In what year was this painted?"
                />
            </div>

            <div className="space-y-2">
                <Label>Submit Button Text</Label>
                <Input
                    value={content.submitButtonText || ''}
                    onChange={(e) => updateContent({ submitButtonText: e.target.value })}
                    placeholder="Default: Submit Answer"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Points Awarded</Label>
                    <Input
                        type="number"
                        className="w-24 h-8"
                        value={content.points || 10}
                        onChange={(e) => updateContent({ points: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Answers</Label>
                <div className="space-y-2">
                    {content.answers?.map((answer, index) => (
                        <div key={answer.id} className="flex items-center gap-2 p-2 bg-neutral-900 border border-white/10 rounded">
                            <button
                                onClick={() => updateAnswer(answer.id, { isCorrect: !answer.isCorrect })}
                                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${answer.isCorrect ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                                title="Mark as Correct Answer"
                            >
                                {answer.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </button>
                            <Input
                                value={answer.text}
                                onChange={(e) => updateAnswer(answer.id, { text: e.target.value })}
                                placeholder={`Answer ${index + 1}`}
                                className="h-8 border-transparent bg-transparent text-white focus:bg-neutral-800 focus:border-neutral-700 placeholder:text-neutral-500"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-neutral-400 hover:text-red-500"
                                onClick={() => removeAnswer(answer.id)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button size="sm" variant="outline" onClick={addAnswer} className="w-full dashed">
                    <Plus className="w-3 h-3 mr-2" /> Add Answer
                </Button>
            </div>
        </div>
    )
}
