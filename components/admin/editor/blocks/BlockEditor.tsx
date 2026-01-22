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
import { Slider } from "@/components/ui/slider"
import { fontOptions } from "@/lib/fonts"

interface BlockEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

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
            default:
                return null
        }
    }

    return (
        <div className="space-y-4">
            {renderContentEditor()}

            {/* Common Styles */}
            <div className="grid grid-cols-2 gap-2">
                {block.type === 'text' && (
                    <div className="space-y-1">
                        <Label className="text-xs">Alignment</Label>
                        <div className="flex border rounded overflow-hidden">
                            {(['left', 'center', 'right', 'justify'] as const).map(align => (
                                <button
                                    key={align}
                                    className={`flex-1 p-1 flex justify-center hover:bg-neutral-100 ${block.styles?.textAlign === align ? 'bg-neutral-200' : ''}`}
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

                {block.type === 'text' && (
                    <div className="space-y-1">
                        <Label className="text-xs">Font Family</Label>
                        <Select
                            value={block.styles?.fontFamily || 'sans'}
                            onValueChange={(v: string) => updateStyle('fontFamily', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
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
                )}

                {block.type === 'text' && (
                    <div className="space-y-1">
                        <Label className="text-xs">Text Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={block.styles?.color || '#000000'}
                                onChange={(e) => updateStyle('color', e.target.value)}
                                className="w-8 h-8 p-1"
                            />
                        </div>
                    </div>
                )}

                {block.type === 'text' && (
                    <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Background (Color + Transparency)</Label>
                        <div className="flex items-center gap-4 border p-2 rounded-md">
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

                {block.type === 'text' && (
                    <div className="space-y-1">
                        <Label className="text-xs">Size</Label>
                        <Select
                            value={block.styles?.fontSize || 'base'}
                            onValueChange={(v: string) => updateStyle('fontSize', v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sm">Small</SelectItem>
                                <SelectItem value="base">Normal</SelectItem>
                                <SelectItem value="lg">Large</SelectItem>
                                <SelectItem value="xl">Extra Large</SelectItem>
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
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
