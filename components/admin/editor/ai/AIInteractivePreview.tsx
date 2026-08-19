'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { uploadAsset } from '@/lib/supabase/storage'
import { Image as ImageIcon, Music, Check, Sparkles, Pencil, Loader2, X } from 'lucide-react'
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
    const [isReplacingMedia, setIsReplacingMedia] = useState(false)
    const [mediaTypeToReplace, setMediaTypeToReplace] = useState<'image' | 'audio' | null>(null)
    const [targetElementIndex, setTargetElementIndex] = useState<number>(-1)
    const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

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
            el.classList.remove('quaris-editable-hover', 'quaris-editable-focused')
        })

        const cleanedHtml = clone.innerHTML
        onHtmlChange(cleanedHtml)
        setHasUnsavedEdits(false)
    }, [onHtmlChange])

    // Attach inline editing handlers to all text and media elements
    const attachEditableBehaviors = useCallback(() => {
        if (!containerRef.current || !isEditable) return

        const container = containerRef.current

        // 1. Text elements
        const textElements = container.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, span, button, summary, li, blockquote, figcaption'
        )

        textElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            // Don't make child containers with interactive children fully contenteditable if they have sub-elements
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

        // 2. Images
        const images = container.querySelectorAll('img')
        images.forEach((img, idx) => {
            img.style.cursor = 'pointer'
            img.title = 'Kliknij dwukrotnie, aby podmienić zdjęcie'
            img.ondblclick = (e) => {
                e.stopPropagation()
                setTargetElementIndex(idx)
                setMediaTypeToReplace('image')
                fileInputRef.current?.click()
            }
        })

        // 3. Audio
        const audios = container.querySelectorAll('audio')
        audios.forEach((audio, idx) => {
            audio.title = 'Kliknij dwukrotnie, aby podmienić plik audio'
            audio.ondblclick = (e) => {
                e.stopPropagation()
                setTargetElementIndex(idx)
                setMediaTypeToReplace('audio')
                fileInputRef.current?.click()
            }
        })
    }, [isEditable, emitHtmlUpdate])

    // Handle File Replacement
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !containerRef.current || targetElementIndex === -1) return

        setIsReplacingMedia(true)

        try {
            const url = await uploadAsset(file, 'ai-inline-edits')
            if (!url) throw new Error("Błąd uploadu pliku")

            if (mediaTypeToReplace === 'image') {
                const images = containerRef.current.querySelectorAll('img')
                const targetImg = images[targetElementIndex]
                if (targetImg) {
                    targetImg.src = url
                    emitHtmlUpdate()
                }
            } else if (mediaTypeToReplace === 'audio') {
                const audios = containerRef.current.querySelectorAll('audio')
                const targetAudio = audios[targetElementIndex]
                if (targetAudio) {
                    targetAudio.src = url
                    emitHtmlUpdate()
                }
            }
        } catch (err) {
            console.error("Media replace error:", err)
            alert("Nie udało się podmienić pliku.")
        } finally {
            setIsReplacingMedia(false)
            setMediaTypeToReplace(null)
            setTargetElementIndex(-1)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {/* Top Helper Banner in Preview */}
            {isEditable && (
                <div className="shrink-0 bg-purple-950/70 border-b border-purple-500/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-purple-200 backdrop-blur-md z-40">
                    <div className="flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5 text-purple-400" />
                        <span>Kliknij dowolny tekst, by edytować na żywo (2x klik na zdjęcie, by zmienić)</span>
                    </div>
                    {hasUnsavedEdits && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">
                            Zmieniono
                        </span>
                    )}
                </div>
            )}

            {/* Hidden File Input for Image/Audio replacement */}
            <input
                ref={fileInputRef}
                type="file"
                accept={mediaTypeToReplace === 'image' ? 'image/*' : 'audio/*'}
                className="hidden"
                onChange={handleFileSelected}
            />

            {/* Loading Overlay when replacing media */}
            {isReplacingMedia && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-2 text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    <p className="text-xs font-medium">Podmienianie pliku...</p>
                </div>
            )}

            {/* Editable Content Container */}
            <div className="flex-1 w-full h-full relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y">
                <div
                    ref={containerRef}
                    className="w-full min-h-full pb-28 text-white [&_img]:max-w-full [&_video]:max-w-full [&_audio]:max-w-full"
                />
            </div>
        </div>
    )
}
