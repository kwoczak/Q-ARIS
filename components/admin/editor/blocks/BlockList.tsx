'use client'

import { StageBlock, BlockType } from "@/types/schema"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Settings2, Copy } from "lucide-react"
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
            case 'quiz':
                initialContent = { question: '', answers: [], points: 10 }
                break
            case 'scratchpad':
                initialContent = { hiddenImage: '', coverColor: '#C0C0C0', coverText: 'Scratch me!' }
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

    const duplicateBlock = (index: number) => {
        const blockToClone = blocks[index]
        const clonedBlock: StageBlock = {
            ...structuredClone(blockToClone),
            id: crypto.randomUUID() // Ensure new ID
        }

        const newBlocks = [...blocks]
        newBlocks.splice(index + 1, 0, clonedBlock) // Insert after original
        onChange(newBlocks)
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-center flex-wrap p-2 bg-neutral-900 rounded-lg border border-white/5">
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('text')}>+ Text</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('image')}>+ Image</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('audio')}>+ Audio</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('video')}>+ Video</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('model_3d')}>+ 3D</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('comparison')}>+ Compare</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('hotspot')}>+ Hotspot</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('quiz')}>+ Quiz</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('scratchpad')}>+ Scratch</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('carousel')}>+ Gallery</Button>
                <Button size="sm" variant="outline" className="border-neutral-700 hover:bg-neutral-800 hover:text-white bg-transparent text-neutral-300" onClick={() => addBlock('accordion')}>+ Accordion</Button>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
                {blocks.map((block, index) => (
                    <AccordionItem key={block.id} value={block.id} className="border border-white/10 rounded-md bg-neutral-900 overflow-hidden">
                        <div className="flex items-center p-2 bg-neutral-950 border-b border-white/10">
                            <span className="text-xs font-mono text-neutral-500 mr-2">{index + 1}</span>
                            <AccordionTrigger className="flex-1 py-0 hover:no-underline text-sm font-medium text-white">
                                {block.type.toUpperCase()} - {typeof block.content === 'string' ? block.content.substring(0, 15) : '...'}
                            </AccordionTrigger>
                            <div className="flex gap-1 ml-2">
                                <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-neutral-800 text-neutral-400" onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up') }}>
                                    <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-neutral-800 text-neutral-400" onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down') }}>
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-500 hover:text-blue-400 hover:bg-blue-900/20" onClick={(e) => { e.stopPropagation(); duplicateBlock(index) }}>
                                    <Copy className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-900/20" onClick={(e) => { e.stopPropagation(); removeBlock(index) }}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <AccordionContent className="p-4 border-t border-white/10 bg-neutral-900 text-white">
                            <BlockEditor block={block} onChange={(updated) => updateBlock(index, updated)} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {blocks.length === 0 && (
                <div className="text-center text-sm text-neutral-500 py-8 border-2 border-dashed border-neutral-800 rounded-lg">
                    No content blocks. Add one above!
                </div>
            )}
        </div>
    )
}
