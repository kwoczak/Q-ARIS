'use client'

import { StageBlock, AccordionItem } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, GripVertical } from "lucide-react"

interface AccordionEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function AccordionEditor({ block, onChange }: AccordionEditorProps) {
    const items = (Array.isArray(block.content) ? block.content : []) as AccordionItem[]

    const updateItems = (newItems: AccordionItem[]) => {
        onChange({ ...block, content: newItems })
    }

    const addItem = () => {
        const newItem: AccordionItem = {
            id: crypto.randomUUID(),
            title: 'New Section',
            content: ''
        }
        updateItems([...items, newItem])
    }

    const removeItem = (id: string) => {
        updateItems(items.filter(i => i.id !== id))
    }

    const updateItem = (id: string, partial: Partial<AccordionItem>) => {
        updateItems(items.map(i => i.id === id ? { ...i, ...partial } : i))
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Accordion Sections</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" /> Add Section
                </Button>
            </div>

            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded text-xs text-neutral-400">
                        Add sections to create an accordion.
                    </div>
                )}

                {items.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-neutral-50 flex gap-4 items-start">
                        <div className="mt-2 text-neutral-300">
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Input
                                value={item.title}
                                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                placeholder="Section Title"
                                className="font-medium"
                            />
                            <Textarea
                                value={item.content}
                                onChange={(e) => updateItem(item.id, { content: e.target.value })}
                                placeholder="Content text..."
                                rows={2}
                                className="text-sm"
                            />
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
