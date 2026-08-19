import React from 'react'
import { AITokenUsage } from '@/types/schema'
import { Coins, Cpu, ArrowDownLeft, ArrowUpRight, Undo2, Redo2, History, Image as ImageIcon } from 'lucide-react'

export interface StageHistorySnapshot {
    title: string
    content: any
    timestamp: string
    label: string
}

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
    canUndo?: boolean
    canRedo?: boolean
    onUndo?: () => void
    onRedo?: () => void
    undoCount?: number
    redoCount?: number
    historySnapshots?: StageHistorySnapshot[]
    currentHistoryIndex?: number
}

export function AITokenTracker({
    sessionUsage,
    lastUsage,
    isGenerating = false,
    modelName = 'OpenAI 5.6 Terra (Reasoning Medium)',
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo,
    undoCount = 0,
    redoCount = 0,
    historySnapshots,
    currentHistoryIndex
}: AITokenTrackerProps) {
    const formattedCost = `$${sessionUsage.costUsd < 0.01 && sessionUsage.costUsd > 0 
        ? sessionUsage.costUsd.toFixed(4) 
        : sessionUsage.costUsd.toFixed(3)}`

    return (
        <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-purple-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300 shadow-sm animate-in fade-in duration-300">
            {/* Left side: Undo & Redo controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-neutral-900/90 rounded-lg border border-white/10 p-0.5 shadow-sm">
                    <button
                        type="button"
                        onClick={onUndo}
                        disabled={!canUndo || isGenerating}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
                        title={canUndo ? `Undo last change (Cmd+Z) • ${undoCount} change${undoCount === 1 ? '' : 's'} back` : 'No changes to undo'}
                    >
                        <Undo2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Undo</span>
                        {undoCount > 0 && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                {undoCount}
                            </span>
                        )}
                    </button>

                    <div className="w-px h-3.5 bg-white/10 my-auto" />

                    <button
                        type="button"
                        onClick={onRedo}
                        disabled={!canRedo || isGenerating}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
                        title={canRedo ? `Redo change (Cmd+Shift+Z) • ${redoCount} redo${redoCount === 1 ? '' : 's'} available` : 'No changes to redo'}
                    >
                        <span>Redo</span>
                        <Redo2 className="w-3.5 h-3.5 text-purple-400" />
                        {redoCount > 0 && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                {redoCount}
                            </span>
                        )}
                    </button>
                </div>

                {historySnapshots && historySnapshots.length > 1 && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                        <History className="w-3 h-3 text-neutral-600" />
                        <span>Step {(currentHistoryIndex ?? 0) + 1}/{historySnapshots.length} (max 5 back)</span>
                    </div>
                )}
            </div>

            {/* Right side: Live Token Stats & Cost */}
            <div className="flex items-center gap-3 flex-wrap ml-auto">
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

                {/* AI Images Count & Cost */}
                {lastUsage?.imagesCount ? (
                    <div className="flex items-center gap-1.5 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-500/30 text-purple-300" title={`Generated ${lastUsage.imagesCount} AI images with DALL-E 3 (+$${lastUsage.imagesCostUsd?.toFixed(3)})`}>
                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-mono font-semibold">{lastUsage.imagesCount} AI {lastUsage.imagesCount === 1 ? 'img' : 'imgs'}</span>
                        {lastUsage.imagesCostUsd ? (
                            <span className="text-[10px] text-purple-400/90 font-mono">
                                (+${lastUsage.imagesCostUsd.toFixed(2)})
                            </span>
                        ) : null}
                    </div>
                ) : null}

                {/* Total Tokens */}
                <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-white/5" title="Total Tokens in Session">
                    <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-neutral-400">Total:</span>
                    <span className="font-mono font-semibold text-white">
                        {sessionUsage.totalTokens.toLocaleString()}
                    </span>
                </div>

                {/* Live USD Cost */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-950/50 to-emerald-900/30 px-3 py-1 rounded-md border border-emerald-500/30 text-emerald-300 font-medium" title="Estimated OpenAI & DALL-E Cost">
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
