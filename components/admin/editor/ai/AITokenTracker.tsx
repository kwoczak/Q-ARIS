'use client'

import React from 'react'
import { AITokenUsage } from '@/types/schema'
import { Coins, Cpu, ArrowDownLeft, ArrowUpRight, Sparkles, Activity } from 'lucide-react'

interface AITokenTrackerProps {
    sessionUsage: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
        costUsd: number
    }
    lastUsage?: AITokenUsage
    isGenerating?: boolean
    modelName?: string
}

export function AITokenTracker({
    sessionUsage,
    lastUsage,
    isGenerating = false,
    modelName = 'OpenAI 5.6 Terra (Reasoning Medium)'
}: AITokenTrackerProps) {
    const formattedCost = `$${sessionUsage.costUsd < 0.01 && sessionUsage.costUsd > 0 
        ? sessionUsage.costUsd.toFixed(4) 
        : sessionUsage.costUsd.toFixed(3)}`

    return (
        <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-purple-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300 shadow-sm animate-in fade-in duration-300">
            {/* Left side: Model & Status */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span className="truncate max-w-[200px]">{modelName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    {isGenerating ? (
                        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Activity className="w-3 h-3 animate-spin" />
                            <span className="font-semibold tracking-wide">GENERATING...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>READY</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Live Token Stats & Cost */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Tokens IN */}
                <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-white/5" title="Prompt / Input Tokens">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-neutral-400">Tokens IN:</span>
                    <span className="font-mono font-semibold text-blue-300">
                        {sessionUsage.promptTokens.toLocaleString()}
                    </span>
                </div>

                {/* Tokens OUT */}
                <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-white/5" title="Completion & Reasoning Tokens">
                    <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-neutral-400">Tokens OUT:</span>
                    <span className="font-mono font-semibold text-purple-300">
                        {sessionUsage.completionTokens.toLocaleString()}
                    </span>
                    {lastUsage?.reasoningTokens ? (
                        <span className="text-[10px] text-purple-400/80 font-mono" title="Reasoning Tokens">
                            ({lastUsage.reasoningTokens.toLocaleString()} thought)
                        </span>
                    ) : null}
                </div>

                {/* Total Tokens */}
                <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-white/5" title="Total Tokens in Session">
                    <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-neutral-400">Total:</span>
                    <span className="font-mono font-semibold text-white">
                        {sessionUsage.totalTokens.toLocaleString()}
                    </span>
                </div>

                {/* Live USD Cost */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-950/50 to-emerald-900/30 px-3 py-1 rounded-md border border-emerald-500/30 text-emerald-300 font-medium" title="Estimated OpenAI Cost">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400/80">Cost:</span>
                    <span className="font-mono font-bold text-emerald-300">
                        {formattedCost}
                    </span>
                </div>
            </div>
        </div>
    )
}
