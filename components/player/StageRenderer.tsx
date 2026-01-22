'use client'

import { Stage } from "@/types/schema"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Play, Pause, ScanLine, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { QRScanner } from "./QRScanner"

export function StageRenderer({ stage }: { stage: Stage }) {
    const [isScanning, setIsScanning] = useState(false)

    if (!stage) return <div>Loading...</div>

    if (isScanning) {
        return <QRScanner onClose={() => setIsScanning(false)} />
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white relative">
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
                                // WebAR logic via model-viewer intennt
                                // This usually opens a separate view or activates model-viewer
                                const modelViewer = document.querySelector('model-viewer') as any;
                                if (modelViewer) modelViewer.activateAR();
                            }}
                        >
                            👀 View in 3D
                        </Button>
                        {/* Hidden model-viewer to facilitate AR activation */}
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

            {/* Floating Audio Player Bar */}
            {stage.content?.audio && (
                <AudioPlayerBar src={stage.content.audio} autoplay={stage.content.autoplay_audio} />
            )}
        </div>
    )
}

function AudioPlayerBar({ src, autoplay }: { src: string, autoplay?: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        if (autoplay && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Autoplay blocked", e))
            setIsPlaying(true)
        }
    }, [autoplay])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-4 z-50 safe-area-bottom">
            <audio
                ref={audioRef}
                src={src}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            <Button
                onClick={togglePlay}
                size="icon"
                className="rounded-full w-12 h-12 shrink-0 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800"
            >
                {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </Button>
            <div className="flex-1">
                <p className="text-xs font-bold uppercase text-neutral-500">Audio Guide</p>
                <p className="text-sm font-medium truncate">Listen to narration</p>
            </div>
        </div>
    )
}
