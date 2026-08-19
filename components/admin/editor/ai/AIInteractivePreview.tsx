'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { AIAttachment } from '@/types/schema'
import { AIMediaLibraryModal } from './AIMediaLibraryModal'
import {
    AIComponentInspector,
    InspectorComponentData,
    QuizData,
    FactCardData,
    ScratchCardData,
    AudioCardData,
    generateQuizHtml,
    generateFactCardHtml,
    generateScratchCardHtml,
    generateAudioCardHtml,
    generateGalleryHtml,
    generateStatsHtml,
    generateQuoteHtml
} from './AIComponentInspector'
import { AIBackgroundModal, StageBackground } from './AIBackgroundModal'
import {
    Image as ImageIcon,
    Music,
    Check,
    Sparkles,
    Pencil,
    Loader2,
    X,
    Settings2,
    Plus,
    Palette,
    Trash2,
    Ticket,
    Layers,
    Quote,
    BarChart3,
    HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'

interface AIInteractivePreviewProps {
    html: string
    onHtmlChange: (newHtml: string) => void
    isEditable?: boolean
    background?: StageBackground | null
    onBackgroundChange?: (bg: StageBackground) => void
}

export function AIInteractivePreview({
    html,
    onHtmlChange,
    isEditable = true,
    background,
    onBackgroundChange
}: AIInteractivePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Media Library Replacement State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
    const [mediaTypeToReplace, setMediaTypeToReplace] = useState<'image' | 'audio' | null>(null)
    const [targetMediaIndex, setTargetMediaIndex] = useState<number>(-1)

    // Component Inspector State (Quiz / Fact Cards / Scratch Cards / Audio)
    const [isInspectorOpen, setIsInspectorOpen] = useState(false)
    const [activeComponentData, setActiveComponentData] = useState<InspectorComponentData | null>(null)
    const [targetComponentEl, setTargetComponentEl] = useState<HTMLElement | null>(null)

    // Add Component Dialog State
    const [isAddComponentOpen, setIsAddComponentOpen] = useState(false)

    // Background Modal State
    const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)

    // Voiceover Quick Attach State
    const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false)

    const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)

    // Sync content to container when external html changes
    useEffect(() => {
        if (!containerRef.current) return
        const activeEl = document.activeElement
        const isFocusedInside = containerRef.current.contains(activeEl)

        if (!isFocusedInside) {
            containerRef.current.innerHTML = html
            attachEditableBehaviors()
            initScratchCards()
        }
    }, [html])

    const emitHtmlUpdate = useCallback(() => {
        if (!containerRef.current) return
        const clone = containerRef.current.cloneNode(true) as HTMLDivElement

        // Clean up temporary helper classes and inspector buttons
        const allElements = clone.querySelectorAll('*')
        allElements.forEach((el) => {
            el.removeAttribute('contenteditable')
            el.removeAttribute('data-quaris-editable')
            el.removeAttribute('data-quaris-inspector-attached')
            el.removeAttribute('data-quaris-scratch-inited')
            el.classList.remove('quaris-editable-hover', 'quaris-editable-focused', 'quaris-component-active')
            if (el.classList.contains('quaris-inspector-bar')) {
                el.remove()
            }
        })

        const cleanedHtml = clone.innerHTML
        onHtmlChange(cleanedHtml)
        setHasUnsavedEdits(false)
    }, [onHtmlChange])

    // =========================================================================
    // CANVAS SCRATCH CARD INITIALIZER
    // =========================================================================
    const initScratchCards = useCallback(() => {
        if (!containerRef.current) return

        const scratchContainers = containerRef.current.querySelectorAll('[data-component="scratch_card"]')
        scratchContainers.forEach((scratchCard) => {
            const cardEl = scratchCard as HTMLElement
            const canvas = cardEl.querySelector('canvas.scratch-canvas') as HTMLCanvasElement | null
            if (!canvas || cardEl.dataset.quarisScratchInited === 'true') return

            cardEl.dataset.quarisScratchInited = 'true'

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const foil = cardEl.dataset.foil || 'silver'
            const coverText = cardEl.dataset.cover ? decodeURIComponent(cardEl.dataset.cover) : '🪙 SCRATCH TO REVEAL'
            const subtext = cardEl.dataset.sub ? decodeURIComponent(cardEl.dataset.sub) : '(Rub with finger or mouse)'

            const setupCanvas = () => {
                const rect = cardEl.getBoundingClientRect()
                const width = rect.width || 320
                const height = rect.height || 230

                canvas.width = width
                canvas.height = height

                ctx.globalCompositeOperation = 'source-over'

                // Draw Foil Gradient
                let gradient = ctx.createLinearGradient(0, 0, width, height)
                if (foil === 'gold') {
                    gradient.addColorStop(0, '#B45309')
                    gradient.addColorStop(0.3, '#FBBF24')
                    gradient.addColorStop(0.7, '#D97706')
                    gradient.addColorStop(1, '#78350F')
                } else if (foil === 'cosmic') {
                    gradient.addColorStop(0, '#1E1B4B')
                    gradient.addColorStop(0.4, '#7C3AED')
                    gradient.addColorStop(0.7, '#4C1D95')
                    gradient.addColorStop(1, '#0F172A')
                } else {
                    // Silver
                    gradient.addColorStop(0, '#374151')
                    gradient.addColorStop(0.3, '#E5E7EB')
                    gradient.addColorStop(0.7, '#9CA3AF')
                    gradient.addColorStop(1, '#1F2937')
                }

                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, width, height)

                // Add subtle metallic grain
                for (let i = 0; i < 400; i++) {
                    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
                }

                // Draw Cover Text
                ctx.fillStyle = foil === 'silver' ? '#111827' : '#FFFFFF'
                ctx.font = 'bold 15px system-ui, -apple-system, sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(coverText, width / 2, height / 2 - 8)

                ctx.fillStyle = foil === 'silver' ? '#374151' : 'rgba(255,255,255,0.8)'
                ctx.font = '11px system-ui, -apple-system, sans-serif'
                ctx.fillText(subtext, width / 2, height / 2 + 16)
            }

            setTimeout(setupCanvas, 150)

            let isScratching = false
            let isRevealed = false

            const getPos = (e: MouseEvent | TouchEvent) => {
                const rect = canvas.getBoundingClientRect()
                let clientX = 0
                let clientY = 0
                if ('touches' in e && e.touches.length > 0) {
                    clientX = e.touches[0].clientX
                    clientY = e.touches[0].clientY
                } else if ('clientX' in e) {
                    clientX = (e as MouseEvent).clientX
                    clientY = (e as MouseEvent).clientY
                }
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                }
            }

            const scratch = (x: number, y: number) => {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.beginPath()
                ctx.arc(x, y, 26, 0, Math.PI * 2)
                ctx.fill()
            }

            const checkReveal = () => {
                if (isRevealed) return
                try {
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const data = imgData.data
                    let transparent = 0
                    for (let i = 3; i < data.length; i += 16) {
                        if (data[i] === 0) transparent++
                    }
                    const percent = (transparent / (data.length / 16)) * 100
                    if (percent > 45) {
                        isRevealed = true
                        canvas.style.transition = 'opacity 0.6s ease-out'
                        canvas.style.opacity = '0'
                        setTimeout(() => {
                            canvas.style.display = 'none'
                        }, 600)
                        confetti({
                            particleCount: 80,
                            spread: 70,
                            origin: { y: 0.6 }
                        })
                    }
                } catch (e) {
                    // Ignore cross-origin error in sandbox
                }
            }

            canvas.onpointerdown = (e) => {
                isScratching = true
                const { x, y } = getPos(e)
                scratch(x, y)
            }

            canvas.onpointermove = (e) => {
                if (!isScratching) return
                const { x, y } = getPos(e)
                scratch(x, y)
            }

            canvas.onpointerup = () => {
                isScratching = false
                checkReveal()
            }

            canvas.onpointerleave = () => {
                isScratching = false
                checkReveal()
            }
        })
    }, [])

    // =========================================================================
    // PARSERS FOR COMPONENTS
    // =========================================================================
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
            optText = optText.replace(/^[A-F0-9][\).\s\-]+\s*/i, '').trim()
            if (optText.length > 2 && /^[A-F]$/i.test(optText.slice(-1))) {
                optText = optText.slice(0, -1).trim()
            }
            options.push(optText)

            const onclickAttr = btn.getAttribute('onclick') || ''
            if (onclickAttr.includes('emerald') || onclickAttr.includes('🎉') || onclickAttr.includes('Correct')) {
                correctIndex = idx
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

    const parseScratchElement = (scratchEl: HTMLElement): ScratchCardData => {
        const imgEl = scratchEl.querySelector('.scratch-hidden-img') as HTMLImageElement | null
        const titleEl = scratchEl.querySelector('.scratch-hidden-title') as HTMLElement | null
        const descEl = scratchEl.querySelector('.scratch-hidden-desc') as HTMLElement | null
        const pointsEl = scratchEl.querySelector('.scratch-hidden-content span.font-mono') as HTMLElement | null

        const foil = (scratchEl.dataset.foil as any) || 'silver'
        const coverText = scratchEl.dataset.cover ? decodeURIComponent(scratchEl.dataset.cover) : '🪙 SCRATCH TO REVEAL'
        const subtext = scratchEl.dataset.sub ? decodeURIComponent(scratchEl.dataset.sub) : '(Rub with finger or mouse)'

        return {
            hiddenImage: imgEl?.src || '',
            hiddenTitle: titleEl?.innerText?.trim() || 'Secret Artifact Revealed',
            hiddenDescription: descEl?.innerText?.trim() || 'Secret detail revealed after scratching!',
            coverText,
            scratchInstruction: subtext,
            foilTheme: foil,
            points: pointsEl?.innerText?.trim() || '+50 PTS'
        }
    }

    const parseAudioElement = (audioEl: HTMLElement): AudioCardData => {
        const audioTag = audioEl.querySelector('audio') as HTMLAudioElement | null
        const titleEl = audioEl.querySelector('h4') as HTMLElement | null
        const subtitleEl = audioEl.querySelector('p') as HTMLElement | null

        return {
            audioUrl: audioTag?.src || '',
            title: titleEl?.innerText?.trim() || 'Curator Audio Guide',
            subtitle: subtitleEl?.innerText?.trim() || 'Audio Narration'
        }
    }

    // =========================================================================
    // ATTACH EDITABLE BEHAVIORS & HOVER ACTION BARS
    // =========================================================================
    const attachEditableBehaviors = useCallback(() => {
        if (!containerRef.current || !isEditable) return

        const container = containerRef.current

        // 1. Text elements
        const textElements = container.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, span, summary, li, blockquote, figcaption'
        )

        textElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            if (htmlEl.closest('button') || htmlEl.closest('.quaris-inspector-bar')) return

            if (htmlEl.children.length === 0 || htmlEl.tagName.startsWith('H') || htmlEl.tagName === 'P') {
                htmlEl.setAttribute('contenteditable', 'true')
                htmlEl.setAttribute('data-quaris-editable', 'text')
                htmlEl.style.outline = 'none'
                htmlEl.style.cursor = 'text'

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
        const images = container.querySelectorAll('img:not(.scratch-hidden-img)')
        images.forEach((img, idx) => {
            const imgEl = img as HTMLImageElement
            imgEl.style.cursor = 'pointer'
            imgEl.title = 'Double-click to open Media Library and replace image'
            imgEl.ondblclick = (e) => {
                e.stopPropagation()
                setTargetMediaIndex(idx)
                setMediaTypeToReplace('image')
                setIsMediaModalOpen(true)
            }
        })

        // 3. Audio (Double-click opens Media Library Modal)
        const audios = container.querySelectorAll('audio')
        audios.forEach((audio, idx) => {
            const audioEl = audio as HTMLAudioElement
            audioEl.title = 'Double-click to open Media Library and replace audio'
            audioEl.ondblclick = (e) => {
                e.stopPropagation()
                setTargetMediaIndex(idx)
                setMediaTypeToReplace('audio')
                setIsMediaModalOpen(true)
            }
        })

        // Helper to inject hover action bar (Settings + Delete) on interactive component containers
        const attachComponentActionBar = (
            el: HTMLElement,
            title: string,
            onEdit: () => void
        ) => {
            if (el.dataset.quarisInspectorAttached) return
            el.dataset.quarisInspectorAttached = 'true'
            el.classList.add('relative', 'group/component')

            const bar = document.createElement('div')
            bar.className = 'quaris-inspector-bar absolute -top-3 right-3 hidden group-hover/component:flex items-center gap-1.5 z-40 animate-in fade-in zoom-in-95'

            // Edit button
            const editBtn = document.createElement('button')
            editBtn.type = 'button'
            editBtn.className = 'quaris-inspector-btn flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold shadow-xl border border-purple-300/40 transition-all cursor-pointer'
            editBtn.innerHTML = `<span>⚙️ ${title}</span>`
            editBtn.onclick = (e) => {
                e.stopPropagation()
                e.preventDefault()
                onEdit()
            }

            // Delete button
            const deleteBtn = document.createElement('button')
            deleteBtn.type = 'button'
            deleteBtn.className = 'quaris-inspector-btn flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold shadow-xl border border-red-300/40 transition-all cursor-pointer'
            deleteBtn.innerHTML = `<span>🗑️</span>`
            deleteBtn.title = 'Delete this component'
            deleteBtn.onclick = (e) => {
                e.stopPropagation()
                e.preventDefault()
                el.remove()
                emitHtmlUpdate()
            }

            bar.appendChild(editBtn)
            bar.appendChild(deleteBtn)
            el.appendChild(bar)
        }

        // 4. Interactive Quiz Components
        const quizContainers = container.querySelectorAll('[data-component="quiz"], .quiz-fb')
        quizContainers.forEach((quizTarget) => {
            const quizCard = (quizTarget.hasAttribute('data-component') ? quizTarget : quizTarget.closest('.space-y-4, .rounded-3xl, .rounded-2xl')) as HTMLElement
            if (!quizCard) return

            attachComponentActionBar(quizCard, 'Quiz Settings', () => {
                const data = parseQuizElement(quizCard)
                setTargetComponentEl(quizCard)
                setActiveComponentData({ type: 'quiz', data })
                setIsInspectorOpen(true)
            })
        })

        // 5. Fact Cards
        const factCards = container.querySelectorAll('[data-component="fact_card"]')
        factCards.forEach((card) => {
            const cardEl = card as HTMLElement
            attachComponentActionBar(cardEl, 'Edit Fact', () => {
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
            })
        })

        // 6. Scratch Cards
        const scratchCards = container.querySelectorAll('[data-component="scratch_card"]')
        scratchCards.forEach((scratch) => {
            const scratchEl = scratch as HTMLElement
            attachComponentActionBar(scratchEl, 'Scratch Settings', () => {
                const data = parseScratchElement(scratchEl)
                setTargetComponentEl(scratchEl)
                setActiveComponentData({ type: 'scratch_card', data })
                setIsInspectorOpen(true)
            })
        })

        // 7. Audio Components
        const audioCards = container.querySelectorAll('[data-component="audio"]')
        audioCards.forEach((audio) => {
            const audioEl = audio as HTMLElement
            attachComponentActionBar(audioEl, 'Audio Settings', () => {
                const data = parseAudioElement(audioEl)
                setTargetComponentEl(audioEl)
                setActiveComponentData({ type: 'audio', data })
                setIsInspectorOpen(true)
            })
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
            const images = containerRef.current.querySelectorAll('img:not(.scratch-hidden-img)')
            const targetImg = images[targetMediaIndex] as HTMLImageElement | undefined
            if (targetImg && chosen.url) {
                targetImg.src = chosen.url
                emitHtmlUpdate()
            }
        } else if (mediaTypeToReplace === 'audio') {
            const audios = containerRef.current.querySelectorAll('audio')
            const targetAudio = audios[targetMediaIndex] as HTMLAudioElement | undefined
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

        const tempContainer = document.createElement('div')
        tempContainer.innerHTML = newHtml
        const replacementEl = tempContainer.firstElementChild

        if (replacementEl) {
            targetComponentEl.replaceWith(replacementEl)
            emitHtmlUpdate()
            attachEditableBehaviors()
            initScratchCards()
        }

        setIsInspectorOpen(false)
        setTargetComponentEl(null)
        setActiveComponentData(null)
    }

    // Handle Component Deleted from Inspector
    const handleComponentDeleted = () => {
        if (targetComponentEl) {
            targetComponentEl.remove()
            emitHtmlUpdate()
        }
        setIsInspectorOpen(false)
        setTargetComponentEl(null)
        setActiveComponentData(null)
    }

    // =========================================================================
    // INSERT NEW COMPONENT
    // =========================================================================
    const handleInsertComponent = (type: string) => {
        if (!containerRef.current) return

        let snippet = ''
        switch (type) {
            case 'quiz':
                snippet = generateQuizHtml({
                    question: 'What is the most remarkable feature of this exhibit?',
                    options: ['Primary discovery', 'Historical artifact', 'Cosmic phenomenon'],
                    correctIndex: 0,
                    points: '+50 PTS',
                    explanation: 'The primary discovery represents a turning point in modern research.',
                    title: '⚡ Explorer Quiz'
                })
                break
            case 'scratch_card':
                snippet = generateScratchCardHtml({
                    hiddenImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
                    hiddenTitle: 'Secret Artifact Revealed',
                    hiddenDescription: 'You have uncovered the secret hidden detail of this exhibit!',
                    coverText: '🪙 SCRATCH TO REVEAL',
                    scratchInstruction: '(Rub with finger or mouse)',
                    foilTheme: 'silver',
                    points: '+50 PTS'
                })
                break
            case 'fact_card':
                snippet = generateFactCardHtml({
                    icon: '💎',
                    title: 'Curatorial Highlight',
                    description: 'This key insight provides crucial context to understanding the exhibit.'
                })
                break
            case 'audio':
                snippet = generateAudioCardHtml({
                    audioUrl: '',
                    title: 'Curator Audio Guide',
                    subtitle: 'Narration Track'
                })
                break
            case 'gallery':
                snippet = generateGalleryHtml()
                break
            case 'stats':
                snippet = generateStatsHtml()
                break
            case 'quote':
                snippet = generateQuoteHtml()
                break
        }

        if (snippet) {
            const temp = document.createElement('div')
            temp.innerHTML = snippet
            const el = temp.firstElementChild
            if (el) {
                containerRef.current.appendChild(el)
                emitHtmlUpdate()
                attachEditableBehaviors()
                initScratchCards()

                // Scroll to newly added element
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }

        setIsAddComponentOpen(false)
    }

    // Handle Voiceover Quick Attach
    const handleVoiceoverSelected = (assets: AIAttachment[]) => {
        if (assets && assets.length > 0 && assets[0].url && containerRef.current) {
            const audioTrack = assets[0]
            const snippet = generateAudioCardHtml({
                audioUrl: audioTrack.url,
                title: audioTrack.name ? audioTrack.name.replace(/\.[^/.]+$/, '') : 'Curator Voiceover',
                subtitle: 'Audio Narration'
            })

            // Check if audio component already exists
            const existingAudio = containerRef.current.querySelector('[data-component="audio"]')
            if (existingAudio) {
                const temp = document.createElement('div')
                temp.innerHTML = snippet
                if (temp.firstElementChild) {
                    existingAudio.replaceWith(temp.firstElementChild)
                }
            } else {
                const temp = document.createElement('div')
                temp.innerHTML = snippet
                if (temp.firstElementChild) {
                    containerRef.current.insertBefore(temp.firstElementChild, containerRef.current.firstChild)
                }
            }

            emitHtmlUpdate()
            attachEditableBehaviors()
        }
        setIsVoiceoverModalOpen(false)
    }

    return (
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {/* Editable Content Container (Clean Phone Screen) */}
            <div className="flex-1 w-full h-full relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y">
                <div
                    ref={containerRef}
                    className="w-full min-h-full pb-28 text-white [&_img]:max-w-full [&_video]:max-w-full [&_audio]:max-w-full"
                />
            </div>

            {/* ========================================================================= */}
            {/* ADD COMPONENT DIALOG                                                      */}
            {/* ========================================================================= */}
            <Dialog open={isAddComponentOpen} onOpenChange={setIsAddComponentOpen}>
                <DialogContent className="max-w-md w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-2xl z-50">
                    <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/60">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-white">Add Component</DialogTitle>
                                <DialogDescription className="text-xs text-neutral-400">
                                    Choose an interactive component to insert into your stage.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[65vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => handleInsertComponent('scratch_card')}
                            className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                <Ticket className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-amber-300">🎟️ Scratch Card</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Interactive rub-to-reveal canvas with secret image & fact</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('quiz')}
                            className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">⚡ Quiz Widget</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Multiple choice quiz with instant score & explanation</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('fact_card')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">💎 Fact Card</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Curatorial highlight card with icon & description</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('audio')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                                <Music className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">🎧 Audio Guide</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Audio narration player card</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('gallery')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">🖼️ Exhibit Gallery</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Horizontal swipe image carousel</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('stats')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">📊 Stats Grid</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">2x2 key metrics counter cards</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('quote')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer col-span-1 sm:col-span-2"
                        >
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                                <Quote className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-amber-300">💬 Curatorial Quote</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Elegant emphasized quote block with author attribution</p>
                            </div>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

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

            {/* Voiceover Modal */}
            <AIMediaLibraryModal
                isOpen={isVoiceoverModalOpen}
                onClose={() => setIsVoiceoverModalOpen(false)}
                onSelectAssets={handleVoiceoverSelected}
                initialCategory="audio"
            />

            {/* Component Inspector Modal (Quiz, Fact Cards, Scratch Cards, Audio) */}
            <AIComponentInspector
                isOpen={isInspectorOpen}
                onClose={() => {
                    setIsInspectorOpen(false)
                    setTargetComponentEl(null)
                    setActiveComponentData(null)
                }}
                componentData={activeComponentData}
                onSave={handleComponentSaved}
                onDelete={handleComponentDeleted}
            />

            {/* Background Customizer Modal */}
            {onBackgroundChange && (
                <AIBackgroundModal
                    isOpen={isBackgroundModalOpen}
                    onClose={() => setIsBackgroundModalOpen(false)}
                    currentBackground={background}
                    onSave={(bg) => {
                        onBackgroundChange(bg)
                        setIsBackgroundModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}
