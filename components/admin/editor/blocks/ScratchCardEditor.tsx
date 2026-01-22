'use client'

import { StageBlock, ScratchContent } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/ui/file-upload"

interface ScratchCardEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function ScratchCardEditor({ block, onChange }: ScratchCardEditorProps) {
    const content = block.content as ScratchContent

    const updateContent = (updates: Partial<ScratchContent>) => {
        onChange({
            ...block,
            content: {
                ...content,
                ...updates
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Hidden Image (Secret)</Label>
                <FileUpload
                    label="Secrets"
                    folder="blocks/scratch"
                    accept="image/*"
                    currentUrl={content.hiddenImage}
                    onUploadComplete={(url) => updateContent({ hiddenImage: url })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Cover Color</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="color"
                            value={content.coverColor || '#C0C0C0'}
                            onChange={(e) => updateContent({ coverColor: e.target.value })}
                            className="w-full h-10 p-1 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Cover Text</Label>
                    <Input
                        value={content.coverText || ''}
                        onChange={(e) => updateContent({ coverText: e.target.value })}
                        placeholder="e.g. Scratch to reveal!"
                    />
                </div>
            </div>
        </div>
    )
}
