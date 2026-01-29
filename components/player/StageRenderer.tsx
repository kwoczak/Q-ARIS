'use client'

import { Stage, StageBlock, BlockStyle } from "@/types/schema" // Added Block imports
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Play, Pause, ScanLine, X } from "lucide-react"
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

// Dynamically import ModelViewer to avoid SSR hydration mismatch
const ModelViewer = dynamic(() => import('./ModelViewerWrapper'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-neutral-100/10 animate-pulse rounded-xl" />
})

export function StageRenderer({ stage }: { stage: Stage }) {
    const [isScanning, setIsScanning] = useState(false)

    if (!stage) return <div>Loading...</div>

    if (isScanning) {
        return <QRScanner onClose={() => setIsScanning(false)} />
    }

    const { content } = stage

    // --- Background Style Logic ---
    const bgStyle: React.CSSProperties = {}
    let isDarkBackground = true

    if (content.background) {
        if (content.background.type === 'color') {
            bgStyle.backgroundColor = content.background.value
            if (content.background.value === '#ffffff' || content.background.value.toLowerCase() === '#fff') {
                isDarkBackground = false
            }
        } else if (content.background.type === 'gradient') {
            bgStyle.background = content.background.value
        } else if (content.background.type === 'image') {
            bgStyle.backgroundImage = `url(${content.background.value})`
            bgStyle.backgroundSize = 'cover'
            bgStyle.backgroundPosition = 'center'
        }
    }


    // --- Block Rendering Logic ---
    const hasBlocks = content.blocks && content.blocks.length > 0

    const containerClasses = [
        "flex flex-col h-[100dvh] w-full relative transition-colors duration-500 overflow-hidden",
        content.background ? (isDarkBackground ? "text-white" : "text-neutral-900") : "bg-black text-white"
    ].join(" ")

    return (
        <div
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
            <div className="absolute top-4 right-4 z-50">
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70"
                    onClick={() => setIsScanning(true)}
                >
                    <X className="w-5 h-5" />
                    <span className="sr-only">Close / Scan</span>
                </Button>
            </div>

            {/* Score Display (Always visible) */}
            <ScoreDisplay />

            {hasBlocks ? (
                // --- NEW BLOCK RENDERER ---
                <div className="flex-1 w-full h-full relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y">
                    <div className="flex flex-col min-h-full pb-32">
                        {content.blocks!.map((block) => (
                            <BlockRenderer key={block.id} block={block} />
                        ))}
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
                                        const modelViewer = document.querySelector('model-viewer') as any;
                                        if (modelViewer) modelViewer.activateAR();
                                    }}
                                >
                                    👀 View in 3D
                                </Button>
                                {(() => {
                                    const ModelViewer = 'model-viewer' as any;
                                    return (
                                        <ModelViewer
                                            src={stage.content.model_3d}
                                            ar
                                            ar-modes="scene-viewer quick-look webxr"
                                            camera-controls
                                            style={{ display: 'none' }}
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

function BlockRenderer({ block }: { block: StageBlock }) {
    const style: React.CSSProperties = {
        textAlign: block.styles?.textAlign || 'left',
        padding: block.styles?.padding ? block.styles.padding : '1rem', // Default padding
        backgroundColor: block.styles?.backgroundColor || 'transparent',
        borderRadius: block.styles?.borderRadius || '0',
        marginBottom: block.styles?.marginBottom || '0',
        color: block.styles?.color || 'inherit',
        fontFamily: getFontFamily(block.styles?.fontFamily || 'sans'),
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
        case 'text':
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
            if (!block.content) return null

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
            if (!block.content) return null
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
            if (!block.content) return null
            return (
                <div style={style} className="w-full h-[50vh] relative bg-neutral-100/5 dark:bg-neutral-800/50 rounded-xl overflow-hidden">
                    <ModelViewer src={block.content as string} />
                </div>
            )
        case 'video':
            if (!block.content) return null
            return (
                <div style={style} className="w-full">
                    <video
                        controls
                        playsInline
                        preload="metadata"
                        src={`${block.content}#t=0.001`}
                        className="w-full rounded-lg"
                    />
                </div>
            )
        case 'comparison':
            return (
                <ComparisonBlock
                    content={block.content as ComparisonContent}
                    style={style}
                />
            )
        case 'hotspot':
            return (
                <HotspotBlock
                    content={block.content as HotspotContent}
                    style={style}
                />
            )
        case 'carousel':
            return (
                <CarouselBlock
                    content={block.content as CarouselItem[]}
                    style={style}
                />
            )
        case 'accordion':
            return (
                <AccordionBlock
                    content={block.content as AccordionItem[]}
                    style={{ ...style, fontSize }}
                />
            )
        case 'quiz':
            return (
                <QuizBlock
                    blockId={block.id}
                    content={block.content as QuizContent}
                    style={{ ...style, fontSize }}
                />
            )
        case 'scratchpad':
            return (
                <ScratchCardBlock
                    content={block.content as ScratchContent}
                    style={style}
                />
            )
        default:
            return null
    }
}

