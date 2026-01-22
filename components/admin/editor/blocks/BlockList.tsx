'use client'

import { StageBlock, BlockType } from "@/types/schema"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Settings2 } from "lucide-react"
import { BlockEditor } from "./BlockEditor"
import { useState } from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface BlockListProps {
    blocks: StageBlock[]
    onChange: (blocks: StageBlock[]) => void
}

export function BlockList({ blocks, onChange }: BlockListProps) {

    const addBlock = (type: BlockType) => {
        let initialContent: any = ''

        switch (type) {
            case 'carousel':
            case 'accordion':
                initialContent = []
                break
            case 'hotspot':
                initialContent = { image: '', hotspots: [] }
                break
            case 'comparison':
                initialContent = { imageBefore: '', imageAfter: '' }
                break
            default:
                initialContent = ''
        }

        const newBlock: StageBlock = {
            id: crypto.randomUUID(),
            type,
            content: initialContent,
            styles: {
                textAlign: 'left',
                fontSize: 'base',
                padding: '1rem'
            }
        }
        onChange([...blocks, newBlock])
    }

    const updateBlock = (index: number, updatedBlock: StageBlock) => {
        const newBlocks = [...blocks]
        newBlocks[index] = updatedBlock
        onChange(newBlocks)
    }

    const removeBlock = (index: number) => {
        const newBlocks = blocks.filter((_, i) => i !== index)
        onChange(newBlocks)
    }

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return

        const newBlocks = [...blocks]
        const temp = newBlocks[index]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        newBlocks[index] = newBlocks[targetIndex]
        newBlocks[targetIndex] = temp

        onChange(newBlocks)
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-center flex-wrap p-2 bg-neutral-100 rounded-lg">
                <Button size="sm" variant="outline" onClick={() => addBlock('text')}>+ Text</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('image')}>+ Image</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('audio')}>+ Audio</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('video')}>+ Video</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('model_3d')}>+ 3D</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('comparison')}>+ Compare</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('hotspot')}>+ Hotspot</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('carousel')}>+ Gallery</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('accordion')}>+ Accordion</Button>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
                {blocks.map((block, index) => (
                    <AccordionItem key={block.id} value={block.id} className="border rounded-md bg-white overflow-hidden">
                        <div className="flex items-center p-2 bg-neutral-50 border-b">
                            <span className="text-xs font-mono text-neutral-400 mr-2">{index + 1}</span>
                            <AccordionTrigger className="flex-1 py-0 hover:no-underline text-sm font-medium">
                                {block.type.toUpperCase()} - {typeof block.content === 'string' ? block.content.substring(0, 15) : '...'}
                            </AccordionTrigger>
                            <div className="flex gap-1 ml-2">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up') }}>
                                    <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down') }}>
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); removeBlock(index) }}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <AccordionContent className="p-4 border-t">
                            <BlockEditor block={block} onChange={(updated) => updateBlock(index, updated)} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {blocks.length === 0 && (
                <div className="text-center text-sm text-neutral-400 py-8 border-2 border-dashed rounded-lg">
                    No content blocks. Add one above!
                </div>
            )}
        </div>
    )
}
