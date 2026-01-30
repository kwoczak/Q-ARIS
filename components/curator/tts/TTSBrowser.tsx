'use client'

import { TTSAsset, deleteTTSAsset } from '@/lib/actions/elevenlabs'
import { Button } from '@/components/ui/button'
import { Play, Trash2, Check, FileAudio } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TTSBrowserProps {
    assets: TTSAsset[]
    onSelect?: (asset: TTSAsset) => void
    refreshData?: () => void
}

export function TTSBrowser({ assets, onSelect, refreshData }: TTSBrowserProps) {
    const router = useRouter()
    const [playingUrl, setPlayingUrl] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        if (playingUrl && audioRef.current) {
            audioRef.current.src = playingUrl
            audioRef.current.play().catch(e => console.error("Play error", e))
        } else if (!playingUrl && audioRef.current) {
            audioRef.current.pause()
        }
    }, [playingUrl])

    const handleDelete = async (asset: TTSAsset) => {
        if (!confirm("Are you sure you want to delete this audio?")) return
        setDeletingId(asset.id)
        try {
            await deleteTTSAsset(asset.id, asset.file_path || asset.public_url.split('/assets/')[1]) // Extract path if not returned, but API should handle ID
            router.refresh()
            if (refreshData) refreshData()
        } catch (error) {
            console.error("Delete failed", error)
            alert("Failed to delete asset")
        } finally {
            setDeletingId(null)
        }
    }

    const togglePlay = (url: string) => {
        if (playingUrl === url) {
            setPlayingUrl(null)
        } else {
            setPlayingUrl(url)
        }
    }

    if (assets.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-white/10 rounded-lg text-neutral-500">
                <FileAudio className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No generated audio assets found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Hidden Audio Element for Playback */}
            <audio
                ref={audioRef}
                onEnded={() => setPlayingUrl(null)}
                className="hidden"
            />

            <div className="grid gap-2">
                {assets.map((asset) => (
                    <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 bg-neutral-900 border border-white/5 rounded hover:border-white/20 transition-colors group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "rounded-full w-8 h-8 shrink-0",
                                    playingUrl === asset.public_url ? "text-blue-400 bg-blue-400/10" : "text-neutral-400 hover:text-white"
                                )}
                                onClick={() => togglePlay(asset.public_url)}
                            >
                                {playingUrl === asset.public_url ? (
                                    <div className="w-2 h-2 bg-current rounded-sm" /> // Stop/Pause Icon placeholder
                                ) : (
                                    <Play className="w-4 h-4 ml-0.5" />
                                )}
                            </Button>

                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate text-white">{asset.label}</p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {asset.voice_name} • {new Date(asset.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onSelect && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 text-xs bg-neutral-800 hover:bg-neutral-700 text-white"
                                    onClick={() => onSelect(asset)}
                                >
                                    Select
                                </Button>
                            )}

                            {!onSelect && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(asset)}
                                    disabled={deletingId === asset.id}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
