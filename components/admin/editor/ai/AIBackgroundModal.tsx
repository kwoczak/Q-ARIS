'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { AIAttachment } from '@/types/schema'
import { AIMediaLibraryModal } from './AIMediaLibraryModal'
import { Image as ImageIcon, Sparkles, Check, Layers, Palette } from 'lucide-react'

export interface StageBackground {
    type: 'color' | 'gradient' | 'image'
    value: string
    overlayOpacity?: number
}

interface AIBackgroundModalProps {
    isOpen: boolean
    onClose: () => void
    currentBackground?: StageBackground | null
    onSave: (bg: StageBackground) => void
}

const GRADIENT_PRESETS = [
    {
        name: 'Deep Obsidian',
        desc: 'Dark neutral & graphite tone',
        value: 'linear-gradient(180deg, #0a0a0a 0%, #171717 50%, #000000 100%)',
        previewCss: 'linear-gradient(to bottom, #0a0a0a, #171717, #000000)'
    },
    {
        name: 'Deep Space Blue',
        desc: 'Midnight navy & starry sapphire',
        value: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)',
        previewCss: 'linear-gradient(to bottom, #020617, #0f172a, #020617)'
    },
    {
        name: 'Mars Crimson',
        desc: 'Volcanic red & rust heat',
        value: 'linear-gradient(180deg, #0c0a09 0%, #450a0a 50%, #000000 100%)',
        previewCss: 'linear-gradient(to bottom, #0c0a09, #450a0a, #000000)'
    },
    {
        name: 'Cosmic Violet',
        desc: 'Ultraviolet & deep indigo galaxy',
        value: 'linear-gradient(180deg, #020617 0%, #3b0764 50%, #000000 100%)',
        previewCss: 'linear-gradient(to bottom, #020617, #3b0764, #000000)'
    },
    {
        name: 'Ocean Cyan',
        desc: 'Bioluminescent deep abyss',
        value: 'linear-gradient(180deg, #020617 0%, #083344 50%, #000000 100%)',
        previewCss: 'linear-gradient(to bottom, #020617, #083344, #000000)'
    },
    {
        name: 'Gold Velvet',
        desc: 'Luxury royal amber & bronze',
        value: 'linear-gradient(180deg, #0a0a0a 0%, #451a03 50%, #000000 100%)',
        previewCss: 'linear-gradient(to bottom, #0a0a0a, #451a03, #000000)'
    },
    {
        name: 'Emerald Night',
        desc: 'Deep rainforest botanical glow',
        value: 'linear-gradient(180deg, #0a0a0a 0%, #022c22 50%, #000000 100%)',
        previewCss: 'linear-gradient(to bottom, #0a0a0a, #022c22, #000000)'
    },
    {
        name: 'Pure OLED Black',
        desc: 'Pitch dark for maximum contrast',
        value: 'linear-gradient(180deg, #000000 0%, #050505 100%)',
        previewCss: 'linear-gradient(to bottom, #000000, #050505)'
    }
]

export function AIBackgroundModal({
    isOpen,
    onClose,
    currentBackground,
    onSave
}: AIBackgroundModalProps) {
    const [bgType, setBgType] = useState<'gradient' | 'image'>('gradient')
    const [selectedGradient, setSelectedGradient] = useState<string>(GRADIENT_PRESETS[0].value)
    const [imageUrl, setImageUrl] = useState<string>('')
    const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35)
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

    useEffect(() => {
        if (currentBackground) {
            if (currentBackground.type === 'image') {
                setBgType('image')
                setImageUrl(currentBackground.value || '')
                setOverlayOpacity(currentBackground.overlayOpacity ?? 0.35)
            } else if (currentBackground.type === 'gradient') {
                setBgType('gradient')
                setSelectedGradient(currentBackground.value || GRADIENT_PRESETS[0].value)
            }
        }
    }, [currentBackground])

    const handleApply = () => {
        if (bgType === 'gradient') {
            onSave({
                type: 'gradient',
                value: selectedGradient
            })
        } else {
            onSave({
                type: 'image',
                value: imageUrl,
                overlayOpacity
            })
        }
        onClose()
    }

    const handleImageSelected = (assets: AIAttachment[]) => {
        if (assets && assets.length > 0 && assets[0].url) {
            setImageUrl(assets[0].url)
            setBgType('image')
        }
        setIsMediaModalOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-2xl z-50">
                {/* Header */}
                <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            <Palette className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-white">Stage Background</DialogTitle>
                            <DialogDescription className="text-xs text-neutral-400">
                                Choose a luxury curated gradient preset or full-screen custom image.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-neutral-900/30 px-5 pt-3">
                    <button
                        type="button"
                        onClick={() => setBgType('gradient')}
                        className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            bgType === 'gradient'
                                ? 'border-purple-500 text-purple-300'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        Gradient Presets
                    </button>
                    <button
                        type="button"
                        onClick={() => setBgType('image')}
                        className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            bgType === 'image'
                                ? 'border-purple-500 text-purple-300'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        Custom Image Background
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                    {bgType === 'gradient' ? (
                        <div className="grid grid-cols-2 gap-2.5">
                            {GRADIENT_PRESETS.map((preset) => {
                                const isSelected = selectedGradient === preset.value
                                return (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => setSelectedGradient(preset.value)}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 relative overflow-hidden transition-all group cursor-pointer ${
                                            isSelected
                                                ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                        style={{ background: preset.previewCss }}
                                    >
                                        <div className="relative z-10 flex items-center justify-between w-full">
                                            <span className="text-xs font-bold text-white drop-shadow">
                                                {preset.name}
                                            </span>
                                            {isSelected && (
                                                <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px]">
                                                    <Check className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-neutral-300 relative z-10 drop-shadow line-clamp-1">
                                            {preset.desc}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Image Preview & Media Library Picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-300">Background Image</label>
                                {imageUrl ? (
                                    <div className="relative h-36 rounded-xl overflow-hidden border border-white/20 group">
                                        <img src={imageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setIsMediaModalOpen(true)}
                                                className="text-xs h-8"
                                            >
                                                Change Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="w-full h-32 rounded-xl border border-dashed border-white/20 hover:border-purple-500/50 bg-neutral-900/60 hover:bg-purple-950/20 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-purple-300 transition-all cursor-pointer"
                                    >
                                        <ImageIcon className="w-6 h-6" />
                                        <span className="text-xs font-medium">Choose image from Media Library</span>
                                    </button>
                                )}
                            </div>

                            {/* Dark Overlay Opacity Slider */}
                            {imageUrl && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-neutral-300">Dark Overlay Readability</span>
                                        <span className="font-mono text-purple-400 font-bold">{Math.round(overlayOpacity * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[overlayOpacity * 100]}
                                        min={0}
                                        max={90}
                                        step={5}
                                        onValueChange={(val) => setOverlayOpacity(val[0] / 100)}
                                        className="py-1"
                                    />
                                    <p className="text-[11px] text-neutral-500">
                                        Darkens background image to ensure all white texts and cards remain crisp and readable.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-xs text-neutral-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleApply}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-lg shadow-purple-900/40"
                    >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Apply Background
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Media Library Modal for picking background image */}
            <AIMediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelectAssets={handleImageSelected}
                initialCategory="image"
            />
        </Dialog>
    )
}
