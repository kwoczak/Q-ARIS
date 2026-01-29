'use client'

import { StageBackground } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"

interface BackgroundEditorProps {
    background?: StageBackground
    onChange: (bg: StageBackground) => void
}

export function BackgroundEditor({ background, onChange }: BackgroundEditorProps) {
    const type = background?.type || 'color'
    const value = background?.value || '#ffffff'
    const opacity = background?.overlayOpacity || 0

    const handleTypeChange = (newType: 'color' | 'image' | 'gradient') => {
        let newValue = value
        if (newType === 'color' && !value.startsWith('#')) newValue = '#ffffff'
        if (newType === 'gradient' && value.startsWith('#')) newValue = 'linear-gradient(to bottom, #000000, #434343)'

        onChange({ type: newType, value: newValue, overlayOpacity: opacity })
    }

    return (
        <div className="space-y-4 p-4 bg-neutral-900 rounded-lg border border-white/10">
            <h3 className="font-semibold text-sm text-white">Background Settings</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-neutral-200">Type</Label>
                    <Select value={type} onValueChange={(v: string) => handleTypeChange(v as any)}>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                            <SelectItem value="color" className="focus:bg-neutral-700 focus:text-white">Solid Color</SelectItem>
                            <SelectItem value="gradient" className="focus:bg-neutral-700 focus:text-white">Gradient</SelectItem>
                            <SelectItem value="image" className="focus:bg-neutral-700 focus:text-white">Image</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {type === 'color' && (
                    <div className="space-y-2">
                        <Label className="text-neutral-200">Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={value}
                                onChange={(e) => onChange({ type, value: e.target.value, overlayOpacity: opacity })}
                                className="w-12 p-1 h-10 bg-neutral-800 border-neutral-700"
                            />
                            <Input
                                value={value}
                                onChange={(e) => onChange({ type, value: e.target.value, overlayOpacity: opacity })}
                                className="bg-neutral-800 border-neutral-700 text-white"
                            />
                        </div>
                    </div>
                )}
            </div>

            {type === 'gradient' && (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-200">Start Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={value.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#000000'}
                                    onChange={(e) => {
                                        const color1 = e.target.value
                                        const color2 = value.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#434343'
                                        // Assume linear to bottom for simplicity if parsing fails, but generally try to preserve
                                        onChange({ type, value: `linear-gradient(to bottom, ${color1}, ${color2})`, overlayOpacity: opacity })
                                    }}
                                    className="w-12 p-1 h-10 bg-neutral-800 border-neutral-700"
                                />
                                <div className="text-xs flex items-center text-neutral-400">
                                    {(value.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#000000').toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-neutral-200">End Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={value.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#434343'}
                                    onChange={(e) => {
                                        const color1 = value.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#000000'
                                        const color2 = e.target.value
                                        onChange({ type, value: `linear-gradient(to bottom, ${color1}, ${color2})`, overlayOpacity: opacity })
                                    }}
                                    className="w-12 p-1 h-10 bg-neutral-800 border-neutral-700"
                                />
                                <div className="text-xs flex items-center text-neutral-400">
                                    {(value.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#434343').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-neutral-200">Direction</Label>
                        <Select
                            value={value.includes('to right') ? 'to right' : value.includes('to bottom right') ? 'to bottom right' : 'to bottom'}
                            onValueChange={(dir) => {
                                const colors = value.match(/#[0-9a-fA-F]{6}/g) || ['#000000', '#434343']
                                onChange({ type, value: `linear-gradient(${dir}, ${colors[0]}, ${colors[1]})`, overlayOpacity: opacity })
                            }}
                        >
                            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                <SelectItem value="to bottom">Vertical ↓</SelectItem>
                                <SelectItem value="to right">Horizontal →</SelectItem>
                                <SelectItem value="to bottom right">Diagonal ↘</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Input
                        value={value}
                        readOnly
                        className="bg-neutral-950 border-neutral-800 text-neutral-500 text-xs font-mono"
                    />
                </div>
            )}

            {type === 'image' && (
                <div className="space-y-2">
                    <Label>Background Image</Label>
                    <FileUpload
                        label="Background"
                        accept="image/*"
                        folder="backgrounds"
                        currentUrl={value.startsWith('http') ? value : undefined}
                        onUploadComplete={(url) => onChange({ type, value: url, overlayOpacity: opacity })}
                    />
                </div>
            )}

            {type === 'image' && (
                <div className="space-y-2">
                    <Label>Overlay Opacity ({opacity})</Label>
                    <input
                        type="range"
                        min="0"
                        max="0.9"
                        step="0.1"
                        value={opacity}
                        onChange={(e) => onChange({ type, value, overlayOpacity: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <p className="text-[10px] text-neutral-500">Darken image to make text readable</p>
                </div>
            )}
        </div>
    )
}
