'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
    src: string
    autoplay?: boolean
    className?: string
    minimal?: boolean // For block usage
}

export function AudioPlayer({ src, autoplay, className, minimal = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isMuted, setIsMuted] = useState(false)

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

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const onSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00"
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    return (
        <div className={cn(
            "flex items-center gap-4 bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-lg transition-all",
            minimal ? "w-full" : "fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto",
            className
        )}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <Button
                onClick={togglePlay}
                size="icon"
                variant="ghost"
                className="rounded-full w-10 h-10 hover:bg-white/20 text-white shrink-0"
            >
                {isPlaying ? <Pause className="fill-white w-5 h-5" /> : <Play className="fill-white ml-1 w-5 h-5" />}
            </Button>

            <div className="flex-1 flex flex-col justify-center gap-1">
                {!minimal && <span className="text-[10px] sm:text-xs font-medium text-white/80 px-1">Audio Guide</span>}
                <div className="flex items-center gap-3 w-full">
                    <span className="text-[10px] text-white/70 font-mono w-8 text-right">{formatTime(currentTime)}</span>
                    <Slider
                        value={[currentTime]}
                        min={0}
                        max={duration || 100}
                        step={1}
                        onValueChange={onSeek}
                        className="flex-1 cursor-pointer"
                    />
                    <span className="text-[10px] text-white/70 font-mono w-8">{formatTime(duration)}</span>
                </div>
            </div>

            <Button
                onClick={toggleMute}
                size="icon"
                variant="ghost"
                className="rounded-full w-8 h-8 hover:bg-white/20 text-white/70 shrink-0 hidden sm:flex"
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
        </div>
    )
}
