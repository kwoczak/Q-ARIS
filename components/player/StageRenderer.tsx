'use client'
import { generateId } from "@/lib/utils";

import { Stage, StageBlock, BlockStyle } from "@/types/schema" // Added Block imports
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Play, Pause, ScanLine, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { QRScanner } from "./QRScanner"
import dynamic from 'next/dynamic'
import { getFontFamily } from "@/lib/fonts"
import { AudioPlayer } from './AudioPlayer'
import { ComparisonBlock } from "./blocks/ComparisonBlock"
import { HotspotBlock } from "./blocks/HotspotBlock"
import { CarouselBlock } from "./blocks/CarouselBlock"
import { AccordionBlock } from "./blocks/AccordionBlock"
import { QuizBlock } from "./blocks/QuizBlock"
import { ScratchCardBlock } from "./blocks/ScratchCardBlock"
import { MotionWrapper } from "./MotionWrapper"
import { ScoreDisplay } from "./ScoreDisplay" // Import ScoreDisplay
import { TypewriterEffect } from "./TypewriterEffect"
import { ComparisonContent, HotspotContent, QuizContent, ScratchContent, CarouselItem, AccordionItem } from "@/types/schema"

import { AIInteractivePreview } from "@/components/admin/editor/ai/AIInteractivePreview"

// Dynamically import ModelViewer to avoid SSR hydration mismatch
const ModelViewer = dynamic(() => import('./ModelViewerWrapper'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-neutral-100/10 animate-pulse rounded-xl" />
})

export function StageRenderer({
    stage,
    isPreview = false,
    language = 'en',
    onChangeLanguage,
    isGamified = true,
    isPaused = false,
    onCustomHtmlChange,
    onBackgroundChange
}: {
    stage: Stage
    isPreview?: boolean
    language?: string
    onChangeLanguage?: () => void
    isGamified?: boolean
    isPaused?: boolean
    onCustomHtmlChange?: (newHtml: string) => void
    onBackgroundChange?: (bg: any) => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Pause all media when isPaused is true
    useEffect(() => {
        if (isPaused && containerRef.current) {
            const mediaElements = containerRef.current.querySelectorAll('video, audio')
            mediaElements.forEach((el) => {
                (el as HTMLMediaElement).pause()
            })
        }
    }, [isPaused])
    const [isScanning, setIsScanning] = useState(false)
    const [debugLogs, setDebugLogs] = useState<string[]>([])

    const addLog = (msg: string) => {
        setDebugLogs(prev => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev])
    }

    // --- Analytics Tracking ---
    useEffect(() => {
        // Don't track if in preview mode or stage is invalid
        if (isPreview || !stage) return

        const trackView = async () => {
            addLog(`Init tracking for stage: ${stage.id.slice(0, 4)}...`)
            try {
                // 1. Get or Create Session ID
                let sessionId = ''
                try {
                    sessionId = localStorage.getItem('visitor_session_id') || ''
                    addLog(`Session from storage: ${sessionId ? 'FOUND' : 'EMPTY'}`)
                } catch (e) {
                    addLog(`Storage ERROR: ${e}`)
                }

                if (!sessionId) {
                    sessionId = generateId()
                    try {
                        localStorage.setItem('visitor_session_id', sessionId)
                    } catch (e) { }
                }

                // 2. Log Event
                addLog(`Sending event: stage_view...`)
                const { logAnalyticsEvent } = await import('@/lib/actions/analytics')
                await logAnalyticsEvent(stage.story_id, stage.id, 'stage_view', sessionId)
                addLog('Event SENT success!')
            } catch (error: any) {
                addLog(`TRACKING ERROR: ${error?.message || error}`)
                console.error("Analytics tracking error:", error)
            }
        }

        trackView()
    }, [stage?.id, stage?.story_id, isPreview])

    if (!stage) return <div>Loading...</div>

    if (isScanning) {
        return <QRScanner onClose={() => setIsScanning(false)} />
    }

    const { content } = stage

    // --- Background Style Logic ---
    const bgStyle: React.CSSProperties = {}
    let isDarkBackground = true

    if (content.background && content.background.value) {
        if (content.background.type === 'color') {
            bgStyle.backgroundColor = content.background.value
            if (content.background.value === '#ffffff' || content.background.value.toLowerCase() === '#fff') {
                isDarkBackground = false
            }
        } else if (content.background.type === 'gradient') {
            const val = content.background.value.trim()
            if (val.startsWith('linear-gradient') || val.startsWith('radial-gradient')) {
                bgStyle.background = val
            } else if (val.includes('from-') || val.includes('via-')) {
                // Backward compatibility mapping for old Tailwind class string presets
                if (val.includes('red')) bgStyle.background = 'linear-gradient(180deg, #0c0a09 0%, #450a0a 50%, #000000 100%)'
                else if (val.includes('purple')) bgStyle.background = 'linear-gradient(180deg, #020617 0%, #3b0764 50%, #000000 100%)'
                else if (val.includes('cyan')) bgStyle.background = 'linear-gradient(180deg, #020617 0%, #083344 50%, #000000 100%)'
                else if (val.includes('amber')) bgStyle.background = 'linear-gradient(180deg, #0a0a0a 0%, #451a03 50%, #000000 100%)'
                else if (val.includes('emerald')) bgStyle.background = 'linear-gradient(180deg, #0a0a0a 0%, #022c22 50%, #000000 100%)'
                else bgStyle.background = 'linear-gradient(180deg, #0a0a0a 0%, #171717 50%, #000000 100%)'
            } else {
                bgStyle.background = val
            }
        } else if (content.background.type === 'image') {
            bgStyle.backgroundImage = `url(${content.background.value})`
            bgStyle.backgroundSize = 'cover'
            bgStyle.backgroundPosition = 'center'
            bgStyle.backgroundRepeat = 'no-repeat'
        }
    } else {
        bgStyle.background = 'linear-gradient(180deg, #0a0a0a 0%, #171717 50%, #000000 100%)'
    }


    // --- Block Rendering Logic ---
    const hasBlocks = content.blocks && content.blocks.length > 0

    const containerClasses = [
        `flex flex-col w-full relative transition-colors duration-500 overflow-hidden ${isPreview ? 'h-full' : 'h-[100dvh]'}`,
        content.background ? (isDarkBackground ? "text-white" : "text-neutral-900") : "bg-black text-white"
    ].join(" ")

    return (
        <div
            ref={containerRef}
            className={containerClasses}
            style={bgStyle}
        >
            {/* Optional Overlay for readability on image backgrounds */}
            {content.background?.overlayOpacity ? (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `rgba(0,0,0,${content.background.overlayOpacity})` }}
                />
            ) : null}

            {/* Close / Scan Button */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsScanning(true)}
                    disabled={isPreview}
                >
                    <X className="w-5 h-5" />
                    <span className="sr-only">Close / Scan</span>
                </Button>

                {/* Change Language Button */}
                {onChangeLanguage && (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70"
                        onClick={onChangeLanguage}
                    >
                        <Globe className="w-5 h-5" />
                        <span className="sr-only">Change Language</span>
                    </Button>
                )}
            </div>

            {/* Score Display (Always visible if gamified) */}
            {isGamified && <ScoreDisplay />}

            {content.custom_html ? (
                // --- AI-GENERATED CUSTOM HTML LAYOUT ---
                isPreview && onCustomHtmlChange ? (
                    <AIInteractivePreview
                        html={content.custom_html}
                        onHtmlChange={onCustomHtmlChange}
                        isEditable={true}
                        background={content.background}
                        onBackgroundChange={onBackgroundChange}
                    />
                ) : (
                    <div className="flex-1 w-full h-full relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y">
                        <div
                            className="w-full min-h-full pb-28 text-white [&_img]:max-w-full [&_video]:max-w-full [&_audio]:max-w-full"
                            dangerouslySetInnerHTML={{ __html: content.custom_html }}
                        />
                    </div>
                )
            ) : hasBlocks ? (
                // --- NEW BLOCK RENDERER ---
                <div className="flex-1 w-full h-full relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y">
                    <div className="flex flex-col min-h-full pb-32">
                        {content.blocks!.map((block) => {
                            // Resolve Localized Content
                            // If we have an override for the current language, use it.
                            // Note: We don't have defaultLanguage here easily, but valid override implies intention.
                            const localizedContent = block.content_i18n?.[language]
                            const effectiveContent = localizedContent !== undefined ? localizedContent : block.content

                            // Resolve Localized Overlay
                            const localizedOverlayText = block.overlay_i18n?.[language]?.text
                            const effectiveOverlay = block.overlay ? {
                                ...block.overlay,
                                text: localizedOverlayText !== undefined ? localizedOverlayText : block.overlay.text
                            } : undefined

                            const effectiveBlock = {
                                ...block,
                                content: effectiveContent,
                                overlay: effectiveOverlay
                            }

                            return <BlockRenderer key={block.id} block={effectiveBlock} isGamified={isGamified} isPreview={isPreview} />
                        })}
                        {/* Audio Autoplay Logic for Blocks? Or keep global? 
                            Let's keep global audio for now if defined in legacy or specific block. 
                            Actually, let's just support the legacy audio field as "Ambient Audio" for the stage
                        */}
                    </div>
                </div>
            ) : (
                // --- LEGACY RENDERER ---
                <>
                    {/* Media or Image Header */}
                    <div className="shrink-0 relative w-full h-[40vh] bg-neutral-900 overflow-hidden">
                        {stage.content?.images?.[0] ? (
                            <img
                                src={stage.content.images[0]}
                                alt={stage.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                Media Placeholder
                            </div>
                        )}

                        {/* AR Button Overlay */}
                        {stage.content?.model_3d && (
                            <div className="absolute bottom-4 right-4 animate-bounce">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-xl"
                                    onClick={() => {
                                        const modelViewer = document.getElementById(`ar-model-${stage.id}`) as any;
                                        if (modelViewer) modelViewer.activateAR();
                                    }}
                                >
                                    {(() => {
                                        const localizedArText = stage.content?.i18n?.[language]?.arButtonText
                                        return localizedArText || stage.content?.arButtonText || "👀 View in 3D"
                                    })()}
                                </Button>
                                {(() => {
                                    const ModelViewer = 'model-viewer' as any;
                                    return (
                                        <ModelViewer
                                            id={`ar-model-${stage.id}`}
                                            src={stage.content.model_3d}
                                            ar
                                            ar-modes="scene-viewer webxr quick-look"
                                            camera-controls
                                            scale={stage.content.model_scale || '1 1 1'}
                                            // Fix: display:none prevents model loading/scaling. Use opacity/visibility instead.
                                            style={{
                                                position: 'absolute',
                                                width: '1px',
                                                height: '1px',
                                                padding: 0,
                                                margin: '-1px',
                                                overflow: 'hidden',
                                                clip: 'rect(0, 0, 0, 0)',
                                                whiteSpace: 'nowrap',
                                                border: 0,
                                                opacity: 0,
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    )
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-gray-100 rounded-t-3xl -mt-6 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                        <div className="p-6 pb-2 shrink-0">
                            <h1 className="text-2xl font-bold mb-1">{stage.title}</h1>
                            <div className="w-12 h-1 bg-blue-500 rounded-full mb-4"></div>
                        </div>

                        <ScrollArea className="flex-1 px-6 pb-24">
                            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                                {stage.content?.text}
                            </div>
                        </ScrollArea>
                    </div>
                </>
            )}

            {/* Global Audio Player (Works for both legacy and new if 'audio' field is set) */}
            {/* Global Audio Player (Works for both legacy and new if 'audio' field is set) */}
            {stage.content?.audio && (
                <AudioPlayer src={stage.content.audio} autoplay={stage.content.autoplay_audio} />
            )}
        </div>
    )
}

function BlockRenderer({ block, isGamified = true, isPreview = false }: { block: StageBlock, isGamified?: boolean, isPreview?: boolean }) {
    const style: React.CSSProperties = {
        textAlign: block.styles?.textAlign || 'left',
        padding: block.styles?.padding ? block.styles.padding : '1rem', // Default padding
        backgroundColor: block.styles?.backgroundColor || 'transparent',
        borderRadius: block.styles?.borderRadius || '0',
        marginBottom: block.styles?.marginBottom || '0',
        color: block.styles?.color || 'inherit',
        fontFamily: getFontFamily(block.styles?.fontFamily || 'sans'),
        fontWeight: block.styles?.fontWeight || 'normal',
        fontStyle: block.styles?.fontStyle || 'normal',
        textDecoration: block.styles?.textDecoration || 'none',
    }

    // FontSize map
    const fontSizeMap: Record<string, string> = {
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.25rem',
        'xl': '1.5rem',
    }
    // If it's a legacy key, map it. Otherwise assume it's a valid CSS value (e.g. "16px")
    const fontSize = fontSizeMap[block.styles?.fontSize || 'base'] || block.styles?.fontSize || '1rem'

    switch (block.type) {
        case 'html':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full p-4 bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">HTML Block</span>
                        No HTML code provided
                    </div>
                )
                return null
            }
            return (
                <div
                    style={style}
                    className="w-full text-white [&_img]:max-w-full [&_video]:max-w-full [&_audio]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: block.content as string }}
                />
            )
        case 'text':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full p-4 bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Text Block</span>
                        No content added yet
                    </div>
                )
                return null
            }
            if (block.styles?.animation === 'typewriter') {
                return (
                    <TypewriterEffect
                        text={block.content as string}
                        style={{ ...style, fontSize }}
                        delay={block.styles.animationDelay}
                    />
                )
            }
            return (
                <MotionWrapper style={style} animation={block.styles?.animation} delay={block.styles?.animationDelay}>
                    <div style={{ fontSize }} className="whitespace-pre-wrap leading-relaxed">
                        {block.content as string}
                    </div>
                </MotionWrapper>
            )
        case 'image':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full aspect-video bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Image Block</span>
                        No image uploaded yet
                    </div>
                )
                return null
            }

            // Resolve Overlay Position
            let overlayPositionClass = 'bottom-0 left-0 right-0' // Default bottom-center-ish behavior if fully wide
            const pos = block.overlay?.position || 'bottom-center'
            switch (pos) {
                case 'top-left': overlayPositionClass = 'top-0 left-0'; break;
                case 'top-center': overlayPositionClass = 'top-0 left-0 right-0 flex justify-center'; break;
                case 'top-right': overlayPositionClass = 'top-0 right-0'; break;
                case 'center': overlayPositionClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'; break;
                case 'bottom-left': overlayPositionClass = 'bottom-0 left-0'; break;
                case 'bottom-center': overlayPositionClass = 'bottom-0 left-0 right-0 flex justify-center'; break;
                case 'bottom-right': overlayPositionClass = 'bottom-0 right-0'; break;
            }

            return (
                <MotionWrapper style={{ ...style, position: 'relative' }} animation={block.styles?.animation} delay={block.styles?.animationDelay}>
                    <img
                        src={block.content as string}
                        alt="Block Image"
                        className="w-full h-auto object-cover shadow-sm"
                    />
                    {block.overlay && (
                        <div className={`absolute ${overlayPositionClass} p-4 pointer-events-none`}>
                            <div
                                className={`pointer-events-auto rounded-lg ${block.overlay.style.backdropBlur ? 'backdrop-blur-sm' : ''}`}
                                style={{
                                    backgroundColor: block.overlay.style.backgroundColor || 'rgba(0,0,0,0.5)',
                                    color: block.overlay.style.color || 'white',
                                    padding: block.overlay.style.padding || '1rem',
                                    width: block.overlay.width === 'auto' ? 'auto' : block.overlay.width,
                                    maxWidth: '100%',
                                    fontFamily: getFontFamily(block.overlay.style.fontFamily || 'sans'),
                                    fontSize: block.overlay.style.fontSize || '1rem',
                                    textAlign: block.overlay.style.textAlign || 'center'
                                }}
                            >
                                <p className="whitespace-pre-wrap text-sm md:text-base">
                                    {block.overlay.text}
                                </p>
                            </div>
                        </div>
                    )}
                </MotionWrapper>
            )
        case 'audio':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full h-16 bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Audio Block</span>
                        No audio selected yet
                    </div>
                )
                return null
            }
            return (
                <div style={style} className="w-full">
                    <audio
                        controls
                        src={block.content as string}
                        className="w-full"
                        autoPlay={block.styles?.autoplayMedia}
                    />
                </div>
            )
        case 'model_3d':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full h-[50vh] bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-xl border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">3D Model Block</span>
                        No model uploaded yet
                    </div>
                )
                return null
            }
            return (
                <div style={style} className="w-full h-[50vh] relative bg-neutral-100/5 dark:bg-neutral-800/50 rounded-xl overflow-hidden">
                    <ModelViewer src={block.content as string} scale={block.styles?.modelScale || '1 1 1'} />
                </div>
            )
        case 'video':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full aspect-video bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Video Block</span>
                        No video uploaded yet
                    </div>
                )
                return null
            }
            const isYouTube = (block.content as string).includes('youtube.com') || (block.content as string).includes('youtu.be')

            if (isYouTube) {
                const videoId = ((block.content as string).match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/) || [])[1]
                if (!videoId) return null

                return (
                    <div style={style} className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=${block.styles?.autoplayMedia ? 1 : 0}&controls=1&rel=0`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                )
            }

            return (
                <div style={style} className="w-full">
                    <video
                        controls
                        playsInline
                        preload="metadata"
                        src={`${block.content}#t=0.001`}
                        className="w-full rounded-lg"
                        autoPlay={block.styles?.autoplayMedia}
                    />
                </div>
            )
        case 'comparison':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full aspect-video bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Comparison Block</span>
                        No images uploaded yet
                    </div>
                )
                return null
            }
            return (
                <ComparisonBlock
                    content={block.content as ComparisonContent}
                    style={style}
                />
            )
        case 'hotspot':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full aspect-video bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Hotspot Block</span>
                        No image uploaded yet
                    </div>
                )
                return null
            }
            return (
                <HotspotBlock
                    content={block.content as HotspotContent}
                    style={style}
                />
            )
        case 'carousel':
            if (!block.content || (Array.isArray(block.content) && block.content.length === 0)) {
                if (isPreview) return (
                    <div style={style} className="w-full aspect-square bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Gallery Block</span>
                        No items added yet
                    </div>
                )
                return null
            }
            return (
                <CarouselBlock
                    content={block.content as CarouselItem[]}
                    style={style}
                />
            )
        case 'accordion':
            if (!block.content || (Array.isArray(block.content) && block.content.length === 0)) {
                if (isPreview) return (
                    <div style={style} className="w-full p-4 bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Accordion Block</span>
                        No items added yet
                    </div>
                )
                return null
            }
            return (
                <AccordionBlock
                    content={block.content as AccordionItem[]}
                    style={{ ...style, fontSize }}
                />
            )
        case 'quiz':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full p-4 bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Quiz Block</span>
                        No questions added yet
                    </div>
                )
                return null
            }
            return (
                <QuizBlock
                    blockId={block.id}
                    content={block.content as QuizContent}
                    style={{ ...style, fontSize }}
                    enablePoints={isGamified}
                />
            )
        case 'scratchpad':
            if (!block.content) {
                if (isPreview) return (
                    <div style={style} className="w-full aspect-video bg-neutral-800/30 flex flex-col items-center justify-center text-neutral-500 rounded-lg border border-dashed border-white/20 text-xs">
                        <span className="font-bold mb-1">Scratch Card Block</span>
                        No images uploaded yet
                    </div>
                )
                return null
            }
            return (
                <ScratchCardBlock
                    content={block.content as ScratchContent}
                    style={style}
                    blockId={block.id}
                    isGamified={isGamified}
                />
            )
        default:
            return null
    }
}

