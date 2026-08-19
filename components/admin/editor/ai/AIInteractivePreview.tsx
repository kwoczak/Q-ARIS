'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { AIAttachment } from '@/types/schema'
import { AIMediaLibraryModal } from './AIMediaLibraryModal'
import {
    AIComponentInspector,
    InspectorComponentData,
    QuizData,
    FactCardData
} from './AIComponentInspector'
import { Image as ImageIcon, Music, Check, Sparkles, Pencil, Loader2, X, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIInteractivePreviewProps {
    html: string
    onHtmlChange: (newHtml: string) => void
    isEditable?: boolean
}

export function AIInteractivePreview({
    html,
    onHtmlChange,
    isEditable = true
}: AIInteractivePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Media Library Replacement State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
    const [mediaTypeToReplace, setMediaTypeToReplace] = useState<'image' | 'audio' | null>(null)
    const [targetMediaIndex, setTargetMediaIndex] = useState<number>(-1)

    // Component Inspector State (Quiz / Fact Cards)
    const [isInspectorOpen, setIsInspectorOpen] = useState(false)
    const [activeComponentData, setActiveComponentData] = useState<InspectorComponentData | null>(null)
    const [targetComponentEl, setTargetComponentEl] = useState<HTMLElement | null>(null)

    const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)

    // Sync content to container when external html changes (unless user is currently focused/typing)
    useEffect(() => {
        if (!containerRef.current) return
        const activeEl = document.activeElement
        const isFocusedInside = containerRef.current.contains(activeEl)
        
        if (!isFocusedInside) {
            containerRef.current.innerHTML = html
            attachEditableBehaviors()
        }
    }, [html])

    const emitHtmlUpdate = useCallback(() => {
        if (!containerRef.current) return
        // Clone the container DOM to clean up ephemeral helper classes before emitting
        const clone = containerRef.current.cloneNode(true) as HTMLDivElement
        
        // Remove contenteditable attributes and helper classes
        const allElements = clone.querySelectorAll('*')
        allElements.forEach(el => {
            el.removeAttribute('contenteditable')
            el.removeAttribute('data-quaris-editable')
            el.classList.remove('quaris-editable-hover', 'quaris-editable-focused', 'quaris-component-active')
            // Remove any dynamically injected inspector buttons
            if (el.classList.contains('quaris-inspector-btn')) {
                el.remove()
            }
        })

        const cleanedHtml = clone.innerHTML
        onHtmlChange(cleanedHtml)
        setHasUnsavedEdits(false)
    }, [onHtmlChange])

    // Parse Quiz DOM into structured QuizData
    const parseQuizElement = (quizEl: HTMLElement): QuizData => {
        const titleEl = quizEl.querySelector('span.uppercase') as HTMLElement | null
        const pointsEl = quizEl.querySelector('span.font-mono') as HTMLElement | null
        const questionEl = (quizEl.querySelector('h3') || quizEl.querySelector('h2, h4, strong')) as HTMLElement | null
        const buttonEls = quizEl.querySelectorAll('button:not(.quaris-inspector-btn)')

        const question = questionEl?.innerText?.trim() || questionEl?.textContent?.trim() || 'Quiz Question'
        const points = pointsEl?.innerText?.trim() || pointsEl?.textContent?.trim() || '+50 PTS'
        const title = titleEl?.innerText?.trim() || titleEl?.textContent?.trim() || '⚡ Explorer Quiz'

        const options: string[] = []
        let correctIndex = 0
        let explanation = 'Here is the explanation for this answer!'

        buttonEls.forEach((btn, idx) => {
            let optText = (btn as HTMLElement).innerText?.trim() || btn.textContent?.trim() || `Option ${idx + 1}`
            // Remove leading "A) ", "B) ", "1. "
            optText = optText.replace(/^[A-F0-9][\).\s\-]+\s*/i, '').trim()
            // Remove trailing letter badge if concatenated
            if (optText.length > 2 && /^[A-F]$/i.test(optText.slice(-1))) {
                optText = optText.slice(0, -1).trim()
            }
            options.push(optText)

            const onclickAttr = btn.getAttribute('onclick') || ''
            if (onclickAttr.includes('emerald') || onclickAttr.includes('🎉') || onclickAttr.includes('Correct')) {
                correctIndex = idx
                // Try extracting explanation
                const matchExpl = onclickAttr.match(/(?:Brawo! Prawidłowa odpowiedź!|Correct! Well done!)<\/span>\s*([^']+)/i)
                if (matchExpl && matchExpl[1]) {
                    explanation = matchExpl[1].trim()
                }
            }
        })

        return {
            question,
            options: options.length > 0 ? options : ['Option A', 'Option B', 'Option C'],
            correctIndex,
            points,
            explanation,
            title
        }
    }

    // Attach inline editing handlers to all text, media, and interactive components
    const attachEditableBehaviors = useCallback(() => {
        if (!containerRef.current || !isEditable) return

        const container = containerRef.current

        // 1. Text elements
        const textElements = container.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, span, summary, li, blockquote, figcaption'
        )

        textElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            // Don't make buttons inside quizzes directly text-editable so clicks trigger quiz inspector or feedback
            if (htmlEl.closest('button')) return

            if (htmlEl.children.length === 0 || htmlEl.tagName.startsWith('H') || htmlEl.tagName === 'P') {
                htmlEl.setAttribute('contenteditable', 'true')
                htmlEl.setAttribute('data-quaris-editable', 'text')
                htmlEl.style.outline = 'none'
                htmlEl.style.cursor = 'text'

                // Hover style
                htmlEl.onmouseenter = () => {
                    if (document.activeElement !== htmlEl) {
                        htmlEl.style.boxShadow = '0 0 0 1px rgba(168, 85, 247, 0.4)'
                        htmlEl.style.borderRadius = '4px'
                    }
                }
                htmlEl.onmouseleave = () => {
                    if (document.activeElement !== htmlEl) {
                        htmlEl.style.boxShadow = ''
                    }
                }

                htmlEl.onfocus = () => {
                    htmlEl.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.9)'
                    htmlEl.style.backgroundColor = 'rgba(168, 85, 247, 0.1)'
                    htmlEl.style.borderRadius = '4px'
                }

                htmlEl.onblur = () => {
                    htmlEl.style.boxShadow = ''
                    htmlEl.style.backgroundColor = ''
                    emitHtmlUpdate()
                }

                htmlEl.oninput = () => {
                    setHasUnsavedEdits(true)
                }
            }
        })

        // 2. Images (Double-click opens Media Library Modal)
        const images = container.querySelectorAll('img')
        images.forEach((img, idx) => {
            img.style.cursor = 'pointer'
            img.title = 'Double-click to open Media Library and replace image'
            img.ondblclick = (e) => {
                e.stopPropagation()
                setTargetMediaIndex(idx)
                setMediaTypeToReplace('image')
                setIsMediaModalOpen(true)
            }
        })

        // 3. Audio (Double-click opens Media Library Modal)
        const audios = container.querySelectorAll('audio')
        audios.forEach((audio, idx) => {
            audio.title = 'Double-click to open Media Library and replace audio'
            audio.ondblclick = (e) => {
                e.stopPropagation()
                setTargetMediaIndex(idx)
                setMediaTypeToReplace('audio')
                setIsMediaModalOpen(true)
            }
        })

        // 4. Interactive Quiz Components
        const quizContainers = container.querySelectorAll('[data-component="quiz"], .quiz-fb')
        quizContainers.forEach((quizTarget) => {
            const quizCard = (quizTarget.hasAttribute('data-component') ? quizTarget : quizTarget.closest('.space-y-4, .rounded-3xl, .rounded-2xl')) as HTMLElement
            if (!quizCard || quizCard.dataset.quarisInspectorAttached) return

            quizCard.dataset.quarisInspectorAttached = 'true'
            quizCard.classList.add('relative', 'group/quiz')

            // Create floating settings badge button
            const settingsBtn = document.createElement('button')
            settingsBtn.type = 'button'
            settingsBtn.className = 'quaris-inspector-btn absolute -top-3 right-3 hidden group-hover/quiz:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold shadow-xl border border-purple-300/40 z-30 transition-all cursor-pointer animate-in fade-in zoom-in-95'
            settingsBtn.innerHTML = `<span>⚙️ Quiz Settings</span>`
            
            settingsBtn.onclick = (e) => {
                e.stopPropagation()
                e.preventDefault()
                const data = parseQuizElement(quizCard)
                setTargetComponentEl(quizCard)
                setActiveComponentData({ type: 'quiz', data })
                setIsInspectorOpen(true)
            }

            quizCard.appendChild(settingsBtn)
        })

        // 5. Fact Cards
        const factCards = container.querySelectorAll('[data-component="fact_card"]')
        factCards.forEach((card) => {
            const cardEl = card as HTMLElement
            if (cardEl.dataset.quarisInspectorAttached) return
            cardEl.dataset.quarisInspectorAttached = 'true'
            cardEl.classList.add('relative', 'group/card')

            const editBtn = document.createElement('button')
            editBtn.type = 'button'
            editBtn.className = 'quaris-inspector-btn absolute -top-2.5 right-2 hidden group-hover/card:flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 hover:bg-purple-600 text-white text-[10px] font-medium shadow-lg border border-white/20 z-30 transition-all cursor-pointer'
            editBtn.innerHTML = `<span>⚙️ Edit</span>`

            editBtn.onclick = (e) => {
                e.stopPropagation()
                e.preventDefault()
                const iconEl = cardEl.querySelector('.rounded-xl, .text-lg')
                const titleEl = cardEl.querySelector('h4, h3, strong')
                const descEl = cardEl.querySelector('p')

                setTargetComponentEl(cardEl)
                setActiveComponentData({
                    type: 'fact_card',
                    data: {
                        icon: iconEl?.textContent?.trim() || '💎',
                        title: titleEl?.textContent?.trim() || 'Fact Title',
                        description: descEl?.textContent?.trim() || 'Fact Description'
                    }
                })
                setIsInspectorOpen(true)
            }

            cardEl.appendChild(editBtn)
        })
    }, [isEditable, emitHtmlUpdate])

    // Handle Media Asset selected from Media Library Modal
    const handleMediaAssetSelected = (selectedAssets: AIAttachment[]) => {
        if (!selectedAssets || selectedAssets.length === 0 || !containerRef.current || targetMediaIndex === -1) {
            setIsMediaModalOpen(false)
            return
        }

        const chosen = selectedAssets[0]

        if (mediaTypeToReplace === 'image') {
            const images = containerRef.current.querySelectorAll('img')
            const targetImg = images[targetMediaIndex]
            if (targetImg && chosen.url) {
                targetImg.src = chosen.url
                emitHtmlUpdate()
            }
        } else if (mediaTypeToReplace === 'audio') {
            const audios = containerRef.current.querySelectorAll('audio')
            const targetAudio = audios[targetMediaIndex]
            if (targetAudio && chosen.url) {
                targetAudio.src = chosen.url
                emitHtmlUpdate()
            }
        }

        setIsMediaModalOpen(false)
        setMediaTypeToReplace(null)
        setTargetMediaIndex(-1)
    }

    // Handle Component Saved from Inspector
    const handleComponentSaved = (newHtml: string) => {
        if (!targetComponentEl || !containerRef.current) {
            setIsInspectorOpen(false)
            return
        }

        // Replace target component with new HTML
        const tempContainer = document.createElement('div')
        tempContainer.innerHTML = newHtml
        const replacementEl = tempContainer.firstElementChild

        if (replacementEl) {
            targetComponentEl.replaceWith(replacementEl)
            emitHtmlUpdate()
            attachEditableBehaviors()
        }

        setIsInspectorOpen(false)
        setTargetComponentEl(null)
        setActiveComponentData(null)
    }

    return (
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {/* Top Helper Banner in Preview */}
            {isEditable && (
                <div className="shrink-0 bg-purple-950/70 border-b border-purple-500/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-purple-200 backdrop-blur-md z-40">
                    <div className="flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5 text-purple-400" />
                        <span>Interactive Preview • Click text to edit live • Hover Quiz for ⚙️ Settings • Double-click image to replace</span>
                    </div>
                    {hasUnsavedEdits && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">
                            Modified
                        </span>
                    )}
                </div>
            )}

            {/* Editable Content Container */}
            <div className="flex-1 w-full h-full relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y">
                <div
                    ref={containerRef}
                    className="w-full min-h-full pb-28 text-white [&_img]:max-w-full [&_video]:max-w-full [&_audio]:max-w-full"
                />
            </div>

            {/* Media Library Modal for inline image / audio replacement */}
            <AIMediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => {
                    setIsMediaModalOpen(false)
                    setMediaTypeToReplace(null)
                    setTargetMediaIndex(-1)
                }}
                onSelectAssets={handleMediaAssetSelected}
                initialCategory={mediaTypeToReplace || 'image'}
            />

            {/* Component Inspector Modal (Quiz, Fact Cards) */}
            <AIComponentInspector
                isOpen={isInspectorOpen}
                onClose={() => {
                    setIsInspectorOpen(false)
                    setTargetComponentEl(null)
                    setActiveComponentData(null)
                }}
                componentData={activeComponentData}
                onSave={handleComponentSaved}
            />
        </div>
    )
}
