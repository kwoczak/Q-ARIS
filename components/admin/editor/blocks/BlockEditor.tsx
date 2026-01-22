'use client'

import { StageBlock, BlockType } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlockEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {

    const updateStyle = (key: string, value: any) => {
        onChange({
            ...block,
            styles: {
                ...block.styles,
                [key]: value
            }
        })
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
                        <FileUpload
                            label="Image"
                            accept="image/*"
                            folder="blocks/images"
                            currentUrl={block.content as string}
                            onUploadComplete={(url) => onChange({ ...block, content: url })}
                        />
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
