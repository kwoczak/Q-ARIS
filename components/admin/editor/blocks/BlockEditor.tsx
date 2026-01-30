'use client'

import { StageBlock, BlockType } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useState } from "react"
import { uploadAsset } from "@/lib/supabase/storage"
import { ImageCropperModal } from "../ImageCropperModal"
import { ComparisonEditor } from "./ComparisonEditor"
import { HotspotEditor } from "./HotspotEditor"
import { CarouselEditor } from "./CarouselEditor"
import { AccordionEditor } from "./AccordionEditor"
import { QuizEditor } from "./QuizEditor"
import { ScratchCardEditor } from "./ScratchCardEditor"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { fontOptions } from "@/lib/fonts"
import { TTSPickerModal } from "@/components/curator/tts/TTSPickerModal"
import { Wand2 } from "lucide-react"

interface BlockEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

const fontSizes = [
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px (Base)', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '30px', value: '30px' },
    { label: '36px', value: '36px' },
    { label: '48px', value: '48px' },
    { label: '60px', value: '60px' },
    { label: '72px', value: '72px' },
]

export function BlockEditor({ block, onChange }: BlockEditorProps) {
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isTTSPickerOpen, setIsTTSPickerOpen] = useState(false)

    const updateStyle = (key: string, value: any) => {
        onChange({
            ...block,
            styles: {
                ...block.styles,
                [key]: value
            }
        })
    }

    const handleFileSelect = (file: File) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setImageToCrop(reader.result?.toString() || null)
            setIsCropperOpen(true)
        })
        reader.readAsDataURL(file)
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            setIsUploading(true)
            const file = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })
            const url = await uploadAsset(file, 'blocks/images')
            if (url) {
                onChange({ ...block, content: url })
            }
        } catch (e) {
            console.error("Upload error", e)
        } finally {
            setIsUploading(false)
        }
    }

    const renderContentEditor = () => {
        switch (block.type) {
            case 'text':
                return (
                    <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Textarea
                            value={block.content as string}
                            onChange={(e) => onChange({ ...block, content: e.target.value })}
                            rows={4}
                            placeholder="Type your text here..."
                        />
                    </div>
                )
            case 'image':
                return (
                    <div className="space-y-2">
                        <Label>Image</Label>
                        {isCropperOpen && imageToCrop && (
                            <ImageCropperModal
                                isOpen={isCropperOpen}
                                onClose={() => setIsCropperOpen(false)}
                                imageSrc={imageToCrop}
                                onCropComplete={handleCropComplete}
                            />
                        )}
                        <FileUpload
                            label={isUploading ? "Uploading..." : "Image (Auto-Crop)"}
                            accept="image/*"
                            folder="blocks/images"
                            currentUrl={block.content as string}
                            onUploadComplete={(url) => onChange({ ...block, content: url })}
                            onFileSelect={handleFileSelect}
                        />
                        <p className="text-[10px] text-neutral-500">
                            Selected images will open a cropper tool (16:9 aspect).
                        </p>
                        {block.content && typeof block.content === 'string' && (
                            <img src={block.content} alt="Preview" className="h-32 object-cover rounded border mt-2" />
                        )}

                        {/* --- OVERLAY CONTROLS --- */}
                        <div className="pt-2 border-t border-dashed mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs font-semibold">Text Overlay</Label>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={() => {
                                        if (block.overlay) {
                                            // Remove overlay
                                            const { overlay, ...rest } = block
                                            onChange(rest)
                                        } else {
                                            // Add overlay
                                            onChange({
                                                ...block,
                                                overlay: {
                                                    text: "Caption Text",
                                                    position: 'bottom-center',
                                                    width: '100%',
                                                    style: {
                                                        color: '#ffffff',
                                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                                        padding: '1rem',
                                                        fontSize: 'base'
                                                    }
                                                }
                                            })
                                        }
                                    }}
                                >
                                    {block.overlay ? "Remove Overlay" : "Add Overlay"}
                                </Button>
                            </div>

                            {block.overlay && (
                                <div className="space-y-3 bg-neutral-900 border border-white/10 p-2 rounded text-xs">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-neutral-400">Caption</Label>
                                        <Textarea
                                            value={block.overlay.text}
                                            onChange={(e) => onChange({
                                                ...block,
                                                overlay: { ...block.overlay!, text: e.target.value }
                                            })}
                                            rows={2}
                                            className="text-xs bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-neutral-400">Position</Label>
                                            <Select
                                                value={block.overlay.position}
                                                onValueChange={(v: any) => onChange({
                                                    ...block,
                                                    overlay: { ...block.overlay!, position: v }
                                                })}
                                            >
                                                <SelectTrigger className="h-7 text-[10px] bg-neutral-800 border-neutral-700 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                                    <SelectItem value="top-left">Top Left</SelectItem>
                                                    <SelectItem value="top-center">Top Center</SelectItem>
                                                    <SelectItem value="top-right">Top Right</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-neutral-400">Width</Label>
                                            <Select
                                                value={block.overlay.width}
                                                onValueChange={(v: any) => onChange({
                                                    ...block,
                                                    overlay: { ...block.overlay!, width: v }
                                                })}
                                            >
                                                <SelectTrigger className="h-7 text-[10px] bg-neutral-800 border-neutral-700 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                                    <SelectItem value="auto">Auto</SelectItem>
                                                    <SelectItem value="50%">50%</SelectItem>
                                                    <SelectItem value="75%">75%</SelectItem>
                                                    <SelectItem value="100%">100%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Overlay Styles */}
                                    <div className="space-y-2 pt-2 border-t border-dotted">
                                        <Label className="text-[10px] font-semibold text-neutral-500">Style</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px]">Background</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="transparent-bg"
                                                            checked={block.overlay.style.backgroundColor === 'transparent'}
                                                            onCheckedChange={(checked) => {
                                                                onChange({
                                                                    ...block,
                                                                    overlay: {
                                                                        ...block.overlay!,
                                                                        style: {
                                                                            ...block.overlay!.style,
                                                                            backgroundColor: checked ? 'transparent' : '#000000'
                                                                        }
                                                                    }
                                                                })
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="transparent-bg"
                                                            className="text-[10px] font-medium leading-none cursor-pointer"
                                                        >
                                                            Clear
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="blur-bg"
                                                            checked={block.overlay.style.backdropBlur}
                                                            onCheckedChange={(checked) => {
                                                                onChange({
                                                                    ...block,
                                                                    overlay: {
                                                                        ...block.overlay!,
                                                                        style: {
                                                                            ...block.overlay!.style,
                                                                            backdropBlur: !!checked
                                                                        }
                                                                    }
                                                                })
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="blur-bg"
                                                            className="text-[10px] font-medium leading-none cursor-pointer"
                                                        >
                                                            Blur
                                                        </label>
                                                    </div>

                                                    {block.overlay.style.backgroundColor !== 'transparent' && (
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Input
                                                                type="color"
                                                                className="w-6 h-6 p-0 border-0 shrink-0"
                                                                value={block.overlay.style.backgroundColor?.startsWith('#') ? block.overlay.style.backgroundColor : (block.overlay.style.backgroundColor?.startsWith('rgba') ? (() => {
                                                                    // Simple parser to hex for input
                                                                    const parts = block.overlay.style.backgroundColor?.match(/\d+/g)
                                                                    if (parts && parts.length >= 3) {
                                                                        const r = parseInt(parts[0]).toString(16).padStart(2, '0')
                                                                        const g = parseInt(parts[1]).toString(16).padStart(2, '0')
                                                                        const b = parseInt(parts[2]).toString(16).padStart(2, '0')
                                                                        return `#${r}${g}${b}`
                                                                    }
                                                                    return '#000000'
                                                                })() : '#000000')}
                                                                onChange={(e) => {
                                                                    const hex = e.target.value
                                                                    const currentBg = block.overlay?.style.backgroundColor || 'rgba(0,0,0,0.5)'
                                                                    let currentOpacity = 0.5
                                                                    if (currentBg.startsWith('rgba')) {
                                                                        const match = currentBg.match(/[\d\.]+\)$/)
                                                                        if (match) currentOpacity = parseFloat(match[0])
                                                                    }

                                                                    const r = parseInt(hex.slice(1, 3), 16)
                                                                    const g = parseInt(hex.slice(3, 5), 16)
                                                                    const b = parseInt(hex.slice(5, 7), 16)

                                                                    const newRgba = `rgba(${r},${g},${b},${currentOpacity})`

                                                                    onChange({
                                                                        ...block,
                                                                        overlay: {
                                                                            ...block.overlay!,
                                                                            style: { ...block.overlay!.style, backgroundColor: newRgba }
                                                                        }
                                                                    })
                                                                }}
                                                            />
                                                            <Slider
                                                                min={0}
                                                                max={1}
                                                                step={0.1}
                                                                className="w-20"
                                                                value={[block.overlay.style.backgroundColor?.startsWith('rgba') ? parseFloat(block.overlay.style.backgroundColor.match(/[\d\.]+\)$/)?.[0] || '0.5') : 1]}
                                                                onValueChange={(val) => {
                                                                    const opacity = val[0]
                                                                    const currentBg = block.overlay?.style.backgroundColor || 'rgba(0,0,0,0.5)'
                                                                    let r = 0, g = 0, b = 0

                                                                    if (currentBg.startsWith('#')) {
                                                                        r = parseInt(currentBg.slice(1, 3), 16)
                                                                        g = parseInt(currentBg.slice(3, 5), 16)
                                                                        b = parseInt(currentBg.slice(5, 7), 16)
                                                                    } else if (currentBg.startsWith('rgba')) {
                                                                        const parts = currentBg.match(/\d+/g)
                                                                        if (parts) {
                                                                            r = parseInt(parts[0])
                                                                            g = parseInt(parts[1])
                                                                            b = parseInt(parts[2])
                                                                        }
                                                                    }

                                                                    const newRgba = `rgba(${r},${g},${b},${opacity})`
                                                                    onChange({
                                                                        ...block,
                                                                        overlay: {
                                                                            ...block.overlay!,
                                                                            style: { ...block.overlay!.style, backgroundColor: newRgba }
                                                                        }
                                                                    })
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px]">Text Color</span>
                                                <Input
                                                    type="color"
                                                    className="w-6 h-6 p-0 border-0"
                                                    value={block.overlay.style.color || '#ffffff'}
                                                    onChange={(e) => onChange({
                                                        ...block,
                                                        overlay: {
                                                            ...block.overlay!,
                                                            style: { ...block.overlay!.style, color: e.target.value }
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Font</Label>
                                                <Select
                                                    value={block.overlay.style.fontFamily || 'sans'}
                                                    onValueChange={(v: any) => onChange({
                                                        ...block,
                                                        overlay: { ...block.overlay!, style: { ...block.overlay!.style, fontFamily: v } }
                                                    })}
                                                >
                                                    <SelectTrigger className="h-7 text-[10px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontOptions.map(font => (
                                                            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.fontFamily }}>
                                                                {font.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Size</Label>
                                                <Select
                                                    value={block.overlay.style.fontSize?.includes('px') ? block.overlay.style.fontSize : '16px'}
                                                    onValueChange={(v: any) => onChange({
                                                        ...block,
                                                        overlay: { ...block.overlay!, style: { ...block.overlay!.style, fontSize: v } }
                                                    })}
                                                >
                                                    <SelectTrigger className="h-7 text-[10px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontSizes.map((size) => (
                                                            <SelectItem key={size.value} value={size.value}>
                                                                {size.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            case 'audio':
                return (
                    <div className="space-y-2">
                        <Label>Audio File</Label>
                        <FileUpload
                            label="Audio"
                            accept="audio/*"
                            folder="blocks/audio"
                            currentUrl={block.content as string}
                            onUploadComplete={(url) => onChange({ ...block, content: url })}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-px bg-neutral-800 flex-1" />
                            <span className="text-[10px] text-neutral-500 uppercase">OR</span>
                            <div className="h-px bg-neutral-800 flex-1" />
                        </div>
                        <Button
                            variant="outline"
                            className="w-full bg-neutral-800 border-dashed border-neutral-700 hover:bg-neutral-700 text-neutral-400 hover:text-white"
                            onClick={() => setIsTTSPickerOpen(true)}
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Select from TTS Library
                        </Button>
                        <TTSPickerModal
                            isOpen={isTTSPickerOpen}
                            onClose={() => setIsTTSPickerOpen(false)}
                            onSelect={(url) => onChange({ ...block, content: url })}
                        />
                        <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                                id={`autoplay-${block.id}`}
                                checked={block.styles?.autoplayMedia}
                                onCheckedChange={(checked) => updateStyle('autoplayMedia', checked)}
                            />
                            <Label htmlFor={`autoplay-${block.id}`} className="text-xs">Auto-play audio</Label>
                        </div>
                        {block.content && typeof block.content === 'string' && (
                            <audio controls src={block.content} className="w-full mt-2" />
                        )}
                    </div>
                )
            case 'video':
                return (
                    <div className="space-y-2">
                        <Label>Video File</Label>
                        <FileUpload
                            label="Video"
                            accept="video/*"
                            folder="blocks/video"
                            currentUrl={block.content as string}
                            onUploadComplete={(url) => onChange({ ...block, content: url })}
                        />
                        {block.content && typeof block.content === 'string' && (
                            <div className="mt-2 rounded-lg overflow-hidden border bg-black">
                                <video
                                    controls
                                    playsInline
                                    preload="metadata"
                                    src={`${block.content}#t=0.001`}
                                    className="w-full max-h-48"
                                />
                            </div>
                        )}
                    </div>
                )
            case 'model_3d':
                return (
                    <div className="space-y-2">
                        <Label>3D Model (.glb)</Label>
                        <FileUpload
                            label="Model"
                            accept=".glb,.gltf"
                            folder="blocks/models"
                            currentUrl={block.content as string}
                            onUploadComplete={(url) => onChange({ ...block, content: url })}
                        />
                    </div>
                )
            case 'comparison':
                return (
                    <ComparisonEditor block={block} onChange={onChange} />
                )
            case 'hotspot':
                return (
                    <HotspotEditor block={block} onChange={onChange} />
                )
            case 'carousel':
                return (
                    <CarouselEditor block={block} onChange={onChange} />
                )
            case 'accordion':
                return (
                    <AccordionEditor block={block} onChange={onChange} />
                )
            case 'quiz':
                return (
                    <QuizEditor block={block} onChange={onChange} />
                )
            case 'scratchpad':
                return (
                    <ScratchCardEditor block={block} onChange={onChange} />
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-4">
            {renderContentEditor()}

            {/* Common Styles */}
            <div className="grid grid-cols-2 gap-2">
                {(block.type === 'text' || block.type === 'quiz') && (
                    <div className="space-y-1">
                        <Label className="text-xs text-neutral-400">Alignment</Label>
                        <div className="flex border border-neutral-700 rounded overflow-hidden">
                            {(['left', 'center', 'right', 'justify'] as const).map(align => (
                                <button
                                    key={align}
                                    className={`flex-1 p-1 flex justify-center hover:bg-neutral-800 ${block.styles?.textAlign === align ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                                    onClick={() => updateStyle('textAlign', align)}
                                >
                                    {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                    {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                    {align === 'right' && <AlignRight className="w-4 h-4" />}
                                    {align === 'justify' && <AlignJustify className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {(block.type === 'text' || block.type === 'accordion' || block.type === 'quiz') && (
                    <div className="space-y-1">
                        <Label className="text-xs text-neutral-400">Size</Label>
                        <Select
                            value={block.styles?.fontSize?.includes('px') ? block.styles.fontSize : '16px'}
                            onValueChange={(v: string) => updateStyle('fontSize', v)}
                        >
                            <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                {fontSizes.map((size) => (
                                    <SelectItem key={size.value} value={size.value}>
                                        {size.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {(block.type === 'text' || block.type === 'hotspot' || block.type === 'quiz' || block.type === 'accordion') && (
                    <div className="space-y-1">
                        <Label className="text-xs text-neutral-400">Font Family</Label>
                        <Select
                            value={block.styles?.fontFamily || 'sans'}
                            onValueChange={(v: string) => updateStyle('fontFamily', v)}
                        >
                            <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                {fontOptions.map(font => (
                                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.fontFamily }}>
                                        {font.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {(block.type === 'text' || block.type === 'hotspot' || block.type === 'quiz' || block.type === 'accordion') && (
                    <div className="space-y-1">
                        <Label className="text-xs text-neutral-400">Text Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={block.styles?.color || '#000000'}
                                onChange={(e) => updateStyle('color', e.target.value)}
                                className="w-8 h-8 p-1 bg-neutral-800 border-neutral-700"
                            />
                        </div>
                    </div>
                )}

                {(block.type === 'text' || block.type === 'hotspot' || block.type === 'quiz' || block.type === 'accordion') && (
                    <div className="space-y-1 col-span-2">
                        <Label className="text-xs text-neutral-400">Background (Color + Transparency)</Label>
                        <div className="flex items-center gap-4 border border-neutral-700 p-2 rounded-md bg-neutral-900">
                            <Input
                                type="color"
                                value={block.styles?.backgroundColor?.startsWith('#') ? block.styles.backgroundColor.substring(0, 7) : '#ffffff'}
                                onChange={(e) => {
                                    // Set color but keep approximate opacity if possible? Or just reset to solid. 
                                    // For simplicity, let's assume converting to RGBA is easier for management but HTML color input takes HEX.
                                    // We will store as HEX for the color part, but we need to manage opacity separately or convert on the fly.
                                    // Simplified: Just use HEX and separate Opacity, then combine to rgba string for storage.
                                    const hex = e.target.value
                                    // We need to know current opacity.
                                    const currentBg = block.styles?.backgroundColor || 'rgba(255,255,255,0)'
                                    let currentOpacity = 1
                                    if (currentBg.startsWith('rgba')) {
                                        const match = currentBg.match(/[\d\.]+\)$/)
                                        if (match) currentOpacity = parseFloat(match[0])
                                    }

                                    // Convert hex to rgb
                                    const r = parseInt(hex.slice(1, 3), 16)
                                    const g = parseInt(hex.slice(3, 5), 16)
                                    const b = parseInt(hex.slice(5, 7), 16)

                                    const newRgba = `rgba(${r},${g},${b},${currentOpacity})`
                                    updateStyle('backgroundColor', newRgba)
                                }}
                                className="w-8 h-8 p-1 shrink-0"
                            />
                            <div className="flex-1">
                                <Slider
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={[block.styles?.backgroundColor?.startsWith('rgba') ? parseFloat(block.styles.backgroundColor.match(/[\d\.]+\)$/)?.[0] || '1') : 1]}
                                    onValueChange={(val) => {
                                        const opacity = val[0]
                                        // Get current color RGB
                                        const currentBg = block.styles?.backgroundColor
                                        let r = 255, g = 255, b = 255
                                        if (currentBg?.startsWith('#')) {
                                            r = parseInt(currentBg.slice(1, 3), 16)
                                            g = parseInt(currentBg.slice(3, 5), 16)
                                            b = parseInt(currentBg.slice(5, 7), 16)
                                        } else if (currentBg?.startsWith('rgba')) {
                                            const parts = currentBg.match(/\d+/g)
                                            if (parts) {
                                                r = parseInt(parts[0])
                                                g = parseInt(parts[1])
                                                b = parseInt(parts[2])
                                            }
                                        }
                                        updateStyle('backgroundColor', `rgba(${r},${g},${b},${opacity})`)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {(block.type === 'text' || block.type === 'hotspot') && (
                    <div className="space-y-1">
                        <Label className="text-xs">Size</Label>
                        <Select
                            value={block.styles?.fontSize?.includes('px') ? block.styles.fontSize : '16px'}
                            onValueChange={(v: string) => updateStyle('fontSize', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {fontSizes.map((size) => (
                                    <SelectItem key={size.value} value={size.value}>
                                        {size.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-1">
                    <Label className="text-xs">Padding</Label>
                    <Select
                        value={block.styles?.padding || '1rem'}
                        onValueChange={(v: string) => updateStyle('padding', v)}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            <SelectItem value="0.5rem">Small</SelectItem>
                            <SelectItem value="1rem">Medium</SelectItem>
                            <SelectItem value="2rem">Large</SelectItem>
                            <SelectItem value="4rem">Extra Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-neutral-400">Padding</Label>
                    <Select
                        value={block.styles?.padding || '1rem'}
                        onValueChange={(v: string) => updateStyle('padding', v)}
                    >
                        <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                            <SelectItem value="0">None</SelectItem>
                            <SelectItem value="0.5rem">Small</SelectItem>
                            <SelectItem value="1rem">Medium</SelectItem>
                            <SelectItem value="2rem">Large</SelectItem>
                            <SelectItem value="4rem">Extra Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-neutral-400">Vertical Space (Margin)</Label>
                    <Select
                        value={block.styles?.marginBottom || '0'}
                        onValueChange={(v: string) => updateStyle('marginBottom', v)}
                    >
                        <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                            <SelectItem value="0">None</SelectItem>
                            <SelectItem value="0.5rem">Small</SelectItem>
                            <SelectItem value="1rem">Medium</SelectItem>
                            <SelectItem value="2rem">Large</SelectItem>
                            <SelectItem value="4rem">Extra Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {block.type === 'text' && (
                    <div className="space-y-1">
                        <Label className="text-xs text-neutral-400">Corner Radius</Label>
                        <Select
                            value={block.styles?.borderRadius || '0'}
                            onValueChange={(v: string) => updateStyle('borderRadius', v)}
                        >
                            <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="0.5rem">Small (8px)</SelectItem>
                                <SelectItem value="1rem">Medium (16px)</SelectItem>
                                <SelectItem value="1.5rem">Large (24px)</SelectItem>
                                <SelectItem value="9999px">Full (Pill)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Visual Effects Section */}
            <div className="pt-2 border-t border-dashed mt-2">
                <Label className="text-[10px] uppercase font-bold text-neutral-400 mb-2 block">Visual Effects</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Entrance Animation</Label>
                        <Select
                            value={block.styles?.animation || 'none'}
                            onValueChange={(v: string) => updateStyle('animation', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="fade-in">Fade In</SelectItem>
                                <SelectItem value="slide-up">Slide Up</SelectItem>
                                <SelectItem value="scale-up">Scale Up</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {(block.type === 'image' || block.type === 'comparison') && (
                        <div className="space-y-1">
                            <Label className="text-xs">Color Filter</Label>
                            <Select
                                value={block.styles?.filter || 'none'}
                                onValueChange={(v: string) => updateStyle('filter', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="sepia">Sepia (Old)</SelectItem>
                                    <SelectItem value="grayscale">Black & White</SelectItem>
                                    <SelectItem value="vintage">Vintage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
