'use client'

import { StageBlock, CarouselItem } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { Trash2, Plus, GripVertical } from "lucide-react"

interface CarouselEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function CarouselEditor({ block, onChange }: CarouselEditorProps) {
    const items = (Array.isArray(block.content) ? block.content : []) as CarouselItem[]

    const updateItems = (newItems: CarouselItem[]) => {
        onChange({ ...block, content: newItems })
    }

    const addItem = () => {
        const newItem: CarouselItem = {
            id: crypto.randomUUID(),
            url: '',
            caption: ''
        }
        updateItems([...items, newItem])
    }

    const removeItem = (id: string) => {
        updateItems(items.filter(i => i.id !== id))
    }

    const updateItem = (id: string, partial: Partial<CarouselItem>) => {
        updateItems(items.map(i => i.id === id ? { ...i, ...partial } : i))
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Gallery Images</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" /> Add Image
                </Button>
            </div>

            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded text-xs text-neutral-400">
                        Add images to create a carousel.
                    </div>
                )}

                {items.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-neutral-50 flex gap-4 items-start">
                        <div className="mt-2 text-neutral-300">
                            <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-[140px_1fr] gap-4">
                                <div className="space-y-1">
                                    <FileUpload
                                        accept="image/*"
                                        folder="blocks/carousel"
                                        currentUrl={item.url}
                                        onUploadComplete={(url) => updateItem(item.id, { url })}
                                        label="Image"
                                    />
                                    {item.url && (
                                        <div className="w-full h-12 rounded bg-neutral-200 overflow-hidden">
                                            <img src={item.url} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Caption</Label>
                                    <Input
                                        value={item.caption || ''}
                                        onChange={(e) => updateItem(item.id, { caption: e.target.value })}
                                        placeholder="Optional caption..."
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8" onClick={() => removeItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
