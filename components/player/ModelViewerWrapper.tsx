'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function ModelViewerWrapper({ src, scale = '1 1 1' }: { src: string, scale?: string }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-full h-full bg-neutral-100/10 animate-pulse rounded-xl" />

    // We cast to any because model-viewer is a web component not fully typed in JSX
    const ModelViewer = 'model-viewer' as any

    return (
        <div className="w-full h-full relative">
            <ModelViewer
                src={src}
                ar
                ar-modes="scene-viewer webxr quick-look"
                camera-controls
                touch-action="pan-y"
                scale={scale}
                style={{ width: '100%', height: '100%' }}
                ar-scale="auto"
                ar-placement="floor"
            />
            <div className="absolute bottom-4 right-4">
                <Button
                    size="sm"
                    className="bg-black/50 backdrop-blur text-white rounded-full"
                    onClick={(e: any) => {
                        const mv = e.target.closest('div').parentElement.querySelector('model-viewer')
                        if (mv) mv.activateAR()
                    }}
                >
                    View in AR
                </Button>
            </div>
        </div>
    )
}
