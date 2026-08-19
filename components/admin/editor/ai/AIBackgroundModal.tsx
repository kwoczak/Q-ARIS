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
import { Image as ImageIcon, Sparkles, Check, Layers, Palette, Compass, Sliders, Zap } from 'lucide-react'

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

// 8 Distinct Gradient Distribution Patterns
export interface GradientPattern {
    id: string
    name: string
    icon: string
    desc: string
    buildCss: (primary: string, secondary: string, dark: string) => string
}

export const GRADIENT_PATTERNS: GradientPattern[] = [
    {
        id: 'top-spotlight',
        name: 'Top Spotlight',
        icon: '🔦',
        desc: 'Top ambient glow focusing on headline',
        buildCss: (p, s, d) => `radial-gradient(ellipse 90% 60% at 50% -10%, ${p} 0%, transparent 70%), linear-gradient(180deg, ${d} 0%, #000000 100%)`
    },
    {
        id: 'center-sphere',
        name: 'Center Sphere',
        icon: '🔮',
        desc: 'Central glowing core behind content',
        buildCss: (p, s, d) => `radial-gradient(circle at 50% 38%, ${p} 0%, transparent 65%), linear-gradient(180deg, ${d} 0%, #000000 100%)`
    },
    {
        id: 'linear-vertical',
        name: 'Linear Vertical',
        icon: '⬇️',
        desc: 'Smooth top-to-bottom gentle transition',
        buildCss: (p, s, d) => `linear-gradient(180deg, ${d} 0%, ${p} 45%, #050505 100%)`
    },
    {
        id: 'diagonal-left',
        name: 'Diagonal Left',
        icon: '↘️',
        desc: '135° dramatic angled light flow',
        buildCss: (p, s, d) => `linear-gradient(135deg, ${p} 0%, ${d} 55%, #000000 100%)`
    },
    {
        id: 'diagonal-right',
        name: 'Diagonal Right',
        icon: '↙️',
        desc: '225° reverse angled lighting',
        buildCss: (p, s, d) => `linear-gradient(225deg, ${p} 0%, ${d} 55%, #000000 100%)`
    },
    {
        id: 'bottom-horizon',
        name: 'Bottom Horizon',
        icon: '🌅',
        desc: 'Atmospheric light rising from below',
        buildCss: (p, s, d) => `radial-gradient(ellipse 95% 55% at 50% 115%, ${p} 0%, transparent 70%), linear-gradient(180deg, #050505 0%, #000000 100%)`
    },
    {
        id: 'dual-corners',
        name: 'Dual Corners',
        icon: '✨',
        desc: 'Two opposing ambient corner glow spots',
        buildCss: (p, s, d) => `radial-gradient(circle at 0% 0%, ${p} 0%, transparent 55%), radial-gradient(circle at 100% 100%, ${s} 0%, transparent 55%), #050505`
    },
    {
        id: 'aurora-mesh',
        name: 'Aurora Mesh',
        icon: '🌌',
        desc: 'Multi-point organic cosmos cloud',
        buildCss: (p, s, d) => `radial-gradient(circle at 20% 20%, ${p} 0%, transparent 45%), radial-gradient(circle at 80% 80%, ${s} 0%, transparent 45%), linear-gradient(180deg, ${d} 0%, #000000 100%)`
    },
    {
        id: 'horizon-bar',
        name: 'Horizon Bar',
        icon: '🪐',
        desc: 'Center horizontal atmospheric strip',
        buildCss: (p, s, d) => `radial-gradient(ellipse 130% 35% at 50% 48%, ${p} 0%, transparent 75%), linear-gradient(180deg, ${d} 0%, #000000 100%)`
    }
]

// 10 Color Palettes
export interface ColorPalette {
    id: string
    name: string
    primary: string
    secondary: string
    dark: string
    tagColor: string
}

export const COLOR_PALETTES: ColorPalette[] = [
    {
        id: 'violet',
        name: 'Cosmic Violet',
        primary: 'rgba(88, 28, 135, 0.45)',
        secondary: 'rgba(59, 7, 100, 0.55)',
        dark: '#0f0728',
        tagColor: 'from-purple-500 to-indigo-600'
    },
    {
        id: 'blue',
        name: 'Deep Space',
        primary: 'rgba(30, 58, 138, 0.45)',
        secondary: 'rgba(30, 27, 75, 0.55)',
        dark: '#020617',
        tagColor: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'crimson',
        name: 'Mars Crimson',
        primary: 'rgba(127, 29, 29, 0.45)',
        secondary: 'rgba(69, 10, 10, 0.55)',
        dark: '#0c0a09',
        tagColor: 'from-red-600 to-orange-600'
    },
    {
        id: 'cyan',
        name: 'Ocean Cyan',
        primary: 'rgba(14, 116, 144, 0.45)',
        secondary: 'rgba(8, 51, 68, 0.55)',
        dark: '#020617',
        tagColor: 'from-cyan-500 to-blue-600'
    },
    {
        id: 'gold',
        name: 'Gold Velvet',
        primary: 'rgba(120, 53, 15, 0.45)',
        secondary: 'rgba(69, 26, 3, 0.55)',
        dark: '#0a0a0a',
        tagColor: 'from-amber-500 to-yellow-600'
    },
    {
        id: 'emerald',
        name: 'Emerald Night',
        primary: 'rgba(6, 95, 70, 0.45)',
        secondary: 'rgba(2, 44, 34, 0.55)',
        dark: '#021e17',
        tagColor: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'neon',
        name: 'Cyber Neon',
        primary: 'rgba(134, 25, 143, 0.45)',
        secondary: 'rgba(76, 5, 25, 0.55)',
        dark: '#030712',
        tagColor: 'from-fuchsia-500 to-rose-600'
    },
    {
        id: 'frost',
        name: 'Arctic Frost',
        primary: 'rgba(51, 65, 85, 0.5)',
        secondary: 'rgba(30, 41, 59, 0.6)',
        dark: '#020617',
        tagColor: 'from-slate-400 to-cyan-700'
    },
    {
        id: 'titanium',
        name: 'Titanium Graphite',
        primary: 'rgba(39, 39, 42, 0.55)',
        secondary: 'rgba(24, 24, 27, 0.65)',
        dark: '#09090b',
        tagColor: 'from-zinc-400 to-neutral-700'
    },
    {
        id: 'sunset',
        name: 'Solar Sunset',
        primary: 'rgba(154, 52, 18, 0.45)',
        secondary: 'rgba(124, 45, 18, 0.55)',
        dark: '#0c0a09',
        tagColor: 'from-orange-500 to-amber-600'
    }
]

// Ready-to-use Presets
export const READY_PRESETS = [
    {
        name: 'Cosmic Violet (Spotlight)',
        value: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(88, 28, 135, 0.45) 0%, transparent 70%), linear-gradient(180deg, #0f0728 0%, #000000 100%)'
    },
    {
        name: 'Deep Space Blue (Sphere)',
        value: 'radial-gradient(circle at 50% 38%, rgba(30, 58, 138, 0.45) 0%, transparent 65%), linear-gradient(180deg, #020617 0%, #000000 100%)'
    },
    {
        name: 'Mars Crimson (Vertical)',
        value: 'linear-gradient(180deg, #0c0a09 0%, rgba(127, 29, 29, 0.45) 45%, #050505 100%)'
    },
    {
        name: 'Ocean Cyan (Aurora)',
        value: 'radial-gradient(circle at 20% 20%, rgba(14, 116, 144, 0.45) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(8, 51, 68, 0.55) 0%, transparent 45%), linear-gradient(180deg, #020617 0%, #000000 100%)'
    },
    {
        name: 'Gold Velvet (Diagonal)',
        value: 'linear-gradient(135deg, rgba(120, 53, 15, 0.45) 0%, #0a0a0a 55%, #000000 100%)'
    },
    {
        name: 'Emerald Night (Bottom Glow)',
        value: 'radial-gradient(ellipse 95% 55% at 50% 115%, rgba(6, 95, 70, 0.45) 0%, transparent 70%), linear-gradient(180deg, #050505 0%, #000000 100%)'
    },
    {
        name: 'Cyber Neon (Dual Corners)',
        value: 'radial-gradient(circle at 0% 0%, rgba(134, 25, 143, 0.45) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(76, 5, 25, 0.55) 0%, transparent 55%), #050505'
    },
    {
        name: 'Arctic Frost (Horizon)',
        value: 'radial-gradient(ellipse 130% 35% at 50% 48%, rgba(51, 65, 85, 0.5) 0%, transparent 75%), linear-gradient(180deg, #020617 0%, #000000 100%)'
    },
    {
        name: 'Titanium Obsidian (Spotlight)',
        value: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(39, 39, 42, 0.55) 0%, transparent 70%), linear-gradient(180deg, #09090b 0%, #000000 100%)'
    },
    {
        name: 'Solar Sunset (Diagonal)',
        value: 'linear-gradient(225deg, rgba(154, 52, 18, 0.45) 0%, #0c0a09 55%, #000000 100%)'
    },
    {
        name: 'Pure OLED Pitch Black',
        value: 'linear-gradient(180deg, #000000 0%, #050505 100%)'
    },
    {
        name: 'Deep Obsidian Minimal',
        value: 'linear-gradient(180deg, #0a0a0a 0%, #171717 50%, #000000 100%)'
    }
]

export function AIBackgroundModal({
    isOpen,
    onClose,
    currentBackground,
    onSave
}: AIBackgroundModalProps) {
    const [tabMode, setTabMode] = useState<'studio' | 'presets' | 'image'>('studio')
    const [selectedPatternId, setSelectedPatternId] = useState<string>(GRADIENT_PATTERNS[0].id)
    const [selectedPaletteId, setSelectedPaletteId] = useState<string>(COLOR_PALETTES[0].id)
    const [customCssValue, setCustomCssValue] = useState<string>(READY_PRESETS[0].value)

    const [imageUrl, setImageUrl] = useState<string>('')
    const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35)
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

    useEffect(() => {
        if (currentBackground) {
            if (currentBackground.type === 'image') {
                setTabMode('image')
                setImageUrl(currentBackground.value || '')
                setOverlayOpacity(currentBackground.overlayOpacity ?? 0.35)
            } else if (currentBackground.type === 'gradient') {
                setCustomCssValue(currentBackground.value || READY_PRESETS[0].value)
            }
        }
    }, [currentBackground, isOpen])

    // Update gradient when pattern or palette changes in studio
    const handleSelectStudioCombination = (patternId: string, paletteId: string) => {
        setSelectedPatternId(patternId)
        setSelectedPaletteId(paletteId)

        const pattern = GRADIENT_PATTERNS.find(p => p.id === patternId) || GRADIENT_PATTERNS[0]
        const palette = COLOR_PALETTES.find(c => c.id === paletteId) || COLOR_PALETTES[0]

        const css = pattern.buildCss(palette.primary, palette.secondary, palette.dark)
        setCustomCssValue(css)
    }

    const handleApply = () => {
        if (tabMode === 'image') {
            onSave({
                type: 'image',
                value: imageUrl,
                overlayOpacity
            })
        } else {
            onSave({
                type: 'gradient',
                value: customCssValue
            })
        }
        onClose()
    }

    const handleImageSelected = (assets: AIAttachment[]) => {
        if (assets && assets.length > 0 && assets[0].url) {
            setImageUrl(assets[0].url)
            setTabMode('image')
        }
        setIsMediaModalOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-2xl z-50">
                {/* Header with Live Gradient Preview Stripe */}
                <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/60 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-40 transition-all duration-500 pointer-events-none"
                        style={{
                            background: tabMode === 'image' && imageUrl
                                ? `url(${imageUrl}) center/cover no-repeat`
                                : customCssValue
                        }}
                    />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md">
                                <Palette className="w-4 h-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                                    Stage Background Studio
                                </DialogTitle>
                                <DialogDescription className="text-xs text-neutral-300">
                                    Customize lighting distribution, color palettes, or full-screen images.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Mode Tabs */}
                <div className="flex border-b border-white/10 bg-neutral-900/40 px-5 pt-2.5 gap-2">
                    <button
                        type="button"
                        onClick={() => setTabMode('studio')}
                        className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                            tabMode === 'studio'
                                ? 'border-purple-500 text-purple-300'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5" />
                        Gradient Studio (9 Styles)
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabMode('presets')}
                        className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                            tabMode === 'presets'
                                ? 'border-purple-500 text-purple-300'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Curated Presets (12)
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabMode('image')}
                        className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                            tabMode === 'image'
                                ? 'border-purple-500 text-purple-300'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Custom Image
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-5 max-h-[64vh] overflow-y-auto">
                    {/* TAB 1: GRADIENT STUDIO (DISTRIBUTION + PALETTE) */}
                    {tabMode === 'studio' && (
                        <div className="space-y-5">
                            {/* Step 1: Distribution Pattern (9 styles) */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>1. Gradient Distribution & Spread</span>
                                        <span className="text-[11px] text-purple-400 font-mono font-normal">({GRADIENT_PATTERNS.length} styles)</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {GRADIENT_PATTERNS.map((pat) => {
                                        const isSelected = selectedPatternId === pat.id
                                        const currentPalette = COLOR_PALETTES.find(c => c.id === selectedPaletteId) || COLOR_PALETTES[0]
                                        const miniPreview = pat.buildCss(currentPalette.primary, currentPalette.secondary, currentPalette.dark)

                                        return (
                                            <button
                                                key={pat.id}
                                                type="button"
                                                onClick={() => handleSelectStudioCombination(pat.id, selectedPaletteId)}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[5.75rem] relative overflow-hidden transition-all group cursor-pointer ${
                                                    isSelected
                                                        ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg'
                                                        : 'border-white/10 hover:border-white/25 bg-neutral-900/70'
                                                }`}
                                            >
                                                <div
                                                    className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                                                    style={{ background: miniPreview }}
                                                />
                                                <div className="relative z-10 flex items-center justify-between w-full">
                                                    <span className="text-xs font-bold text-white flex items-center gap-1.5 drop-shadow">
                                                        <span>{pat.icon}</span> {pat.name}
                                                    </span>
                                                    {isSelected && (
                                                        <span className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white text-[9px] shrink-0 ml-1">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-neutral-300 relative z-10 leading-tight">
                                                    {pat.desc}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Step 2: Color Atmosphere (10 Palettes) */}
                            <div className="space-y-2.5 pt-3 border-t border-white/10">
                                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>2. Color Atmosphere</span>
                                    <span className="text-[11px] text-purple-400 font-mono font-normal">({COLOR_PALETTES.length} palettes)</span>
                                </label>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                    {COLOR_PALETTES.map((pal) => {
                                        const isSelected = selectedPaletteId === pal.id
                                        return (
                                            <button
                                                key={pal.id}
                                                type="button"
                                                onClick={() => handleSelectStudioCombination(selectedPatternId, pal.id)}
                                                className={`py-2 px-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-purple-950/50 text-white ring-2 ring-purple-500/50 shadow-md'
                                                        : 'border-white/10 bg-neutral-900/80 text-neutral-200 hover:border-white/25 hover:text-white'
                                                }`}
                                            >
                                                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${pal.tagColor} shrink-0 shadow-sm ring-1 ring-white/20`} />
                                                <span className="text-xs font-medium whitespace-nowrap">{pal.name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CURATED PRESETS */}
                    {tabMode === 'presets' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {READY_PRESETS.map((preset) => {
                                const isSelected = customCssValue === preset.value
                                return (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => setCustomCssValue(preset.value)}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 relative overflow-hidden transition-all group cursor-pointer ${
                                            isSelected
                                                ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg'
                                                : 'border-white/10 hover:border-white/25'
                                        }`}
                                        style={{ background: preset.value }}
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
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* TAB 3: CUSTOM IMAGE BACKGROUND */}
                    {tabMode === 'image' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-300">Background Image</label>
                                {imageUrl ? (
                                    <div className="relative h-40 rounded-2xl overflow-hidden border border-white/20 group">
                                        <img src={imageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setIsMediaModalOpen(true)}
                                                className="text-xs h-8 cursor-pointer"
                                            >
                                                Change Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="w-full h-36 rounded-2xl border border-dashed border-white/20 hover:border-purple-500/50 bg-neutral-900/60 hover:bg-purple-950/20 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-purple-300 transition-all cursor-pointer"
                                    >
                                        <ImageIcon className="w-7 h-7" />
                                        <span className="text-xs font-medium">Choose photo from Media Library</span>
                                    </button>
                                )}
                            </div>

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
                                        Darkens background image to ensure all white texts and interactive cards remain crisp and legible.
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
                        className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleApply}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-lg shadow-purple-900/40 cursor-pointer"
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
