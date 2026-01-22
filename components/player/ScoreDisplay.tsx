'use client'

import { useVisitor } from "./VisitorContext"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ScoreDisplay() {
    const { score, isLoaded } = useVisitor()
    const [animate, setAnimate] = useState(false)
    const [prevScore, setPrevScore] = useState(0)

    useEffect(() => {
        if (score > prevScore) {
            setAnimate(true)
            const timer = setTimeout(() => setAnimate(false), 1000)
            return () => clearTimeout(timer)
        }
        setPrevScore(score)
    }, [score, prevScore])

    if (!isLoaded) return null

    return (
        <div className={cn(
            "fixed top-4 right-16 z-50 transition-all duration-300",
            animate ? "scale-125" : "scale-100"
        )}>
            <div className="bg-black/50 backdrop-blur-md border border-white/20 text-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Trophy className={cn("w-4 h-4 text-yellow-400", animate && "animate-bounce")} />
                <span className="font-bold text-sm tabular-nums">{score}</span>
            </div>
        </div>
    )
}
