'use client'

import { ScratchContent } from "@/types/schema"
import { useEffect, useRef, useState } from "react"
import confetti from 'canvas-confetti'

import { useGamification } from "@/hooks/useGamification"

interface ScratchCardBlockProps {
    content: ScratchContent
    style: any
    blockId: string
    isGamified?: boolean
}

export function ScratchCardBlock({ content, style, blockId, isGamified = false }: ScratchCardBlockProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isInteracting, setIsInteracting] = useState(false)
    const { addPoints, hasCompletedBlock } = useGamification()
    // Local state to track if points were already awarded for this specific block in this session
    // We utilize hasCompletedBlock from context now for persistence across refreshes if VisitorContext uses localStorage
    // const [awarded, setAwarded] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size to match container
        const resize = () => {
            const rect = container.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = rect.height

            // Re-draw cover if resized? simpler to just keep it strictly sized or reset.
            // For now, let's just initialize once or on size change redraw cover.
            drawCover(ctx, canvas.width, canvas.height)
        }

        // Initial draw
        // We need to wait for layout? 
        setTimeout(resize, 100) // Small delay to ensure container has size

        // Drawing logic
        let isDrawing = false

        const getPos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect()
            let clientX, clientY
            if ('touches' in e) {
                clientX = e.touches[0].clientX
                clientY = e.touches[0].clientY
            } else {
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
            ctx.arc(x, y, 30, 0, Math.PI * 2) // Scratch radius
            ctx.fill()
            checkReveal()
        }

        const checkReveal = () => {
            // Optimization: Don't check every pixel every frame.
            // Maybe throttle? For MVP, check occasionally or just trust user finishes.
            // Let's check every ~50 scratches or use a simpler metric.
            // Actually, ` getImageData` is expensive. Let's trigger it only on mouse up?
        }

        const onStart = (e: MouseEvent | TouchEvent) => {
            if (isRevealed) return
            isDrawing = true
            setIsInteracting(true)
            const { x, y } = getPos(e)
            scratch(x, y)
        }

        const onMove = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing || isRevealed) return
            const { x, y } = getPos(e)
            scratch(x, y)
            e.preventDefault() // Prevent scrolling while scratching
        }

        const onEnd = () => {
            isDrawing = false
            setIsInteracting(false)

            // Check reveal percentage on end
            if (!isRevealed) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const pixels = imageData.data
                let transparentPixels = 0
                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] === 0) transparentPixels++
                }
                const percent = (transparentPixels / (pixels.length / 4)) * 100

                if (percent > 60) {
                    revealAll()
                }
            }
        }

        const revealAll = () => {
            setIsRevealed(true)

            if (isGamified && content.points && content.points > 0 && !hasCompletedBlock(blockId)) {
                addPoints(content.points, blockId)
                // Optional: Show toast or something? Confetti handles celebration.
            }

            canvas.style.transition = 'opacity 0.5s ease-out'
            canvas.style.opacity = '0'
            setTimeout(() => {
                canvas.style.display = 'none'
            }, 500)
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            })
        }

        const drawCover = (context: CanvasRenderingContext2D, width: number, height: number) => {
            context.globalCompositeOperation = 'source-over'

            // Draw Color
            context.fillStyle = content.coverColor || '#C0C0C0' // Silver default
            context.fillRect(0, 0, width, height)

            // Add Noise/Texture
            // ... simple noise for "scratch" feel

            // Add Text
            if (content.coverText) {
                context.fillStyle = '#666666'
                context.font = 'bold 24px sans-serif'
                context.textAlign = 'center'
                context.textBaseline = 'middle'
                context.fillText(content.coverText, width / 2, height / 2)

                context.font = '14px sans-serif'
                context.fillText(content.scratchText || "(Rub to reveal)", width / 2, height / 2 + 30)
            }
        }

        // Listeners
        canvas.addEventListener('mousedown', onStart)
        canvas.addEventListener('mousemove', onMove)
        canvas.addEventListener('mouseup', onEnd)
        canvas.addEventListener('touchstart', onStart, { passive: false })
        canvas.addEventListener('touchmove', onMove, { passive: false })
        canvas.addEventListener('touchend', onEnd)

        return () => {
            canvas.removeEventListener('mousedown', onStart)
            canvas.removeEventListener('mousemove', onMove)
            canvas.removeEventListener('mouseup', onEnd)
            canvas.removeEventListener('touchstart', onStart)
            canvas.removeEventListener('touchmove', onMove)
            canvas.removeEventListener('touchend', onEnd)
        }
    }, [content, isRevealed])

    return (
        <div style={style} className="w-full">
            <div
                ref={containerRef}
                className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden shadow-lg bg-white select-none"
            >
                {/* Hidden Image (Bottom Layer) */}
                {content.hiddenImage && (
                    <img
                        src={content.hiddenImage}
                        alt="Hidden Secret"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Scratch Layer (Top) */}
                {!isRevealed && ( // Keep in DOM but fade out handled by JS, or conditionally render if we don't care about fade animation persistence
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
                    />
                )}

                {/* Overlay indicating interacting allowed if needed */}
            </div>
        </div>
    )
}
