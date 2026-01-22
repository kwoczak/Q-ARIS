'use client'

import { PuzzleContent, StageBlock } from "@/types/schema"
import { FileUpload } from "@/components/admin/FileUpload"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface PuzzleEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function PuzzleEditor({ block, onChange }: PuzzleEditorProps) {
    const content = block.content as PuzzleContent

    const updateContent = (updates: Partial<PuzzleContent>) => {
        onChange({
            ...block,
            content: { ...content, ...updates }
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Puzzle Image</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                    <FileUpload
                        label="Puzzle Image"
                        folder="blocks/puzzles"
                        accept="image/*"
                        currentUrl={content.image}
                        onUploadComplete={(url) => updateContent({ image: url })}
                    />
                    {content.image && (
                        <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-md border">
                            <img
                                src={content.image}
                                alt="Preview"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Difficulty (Grid Size)</Label>
                    <Select
                        value={content.gridSize?.toString() || '3'}
                        onValueChange={(val) => updateContent({ gridSize: parseInt(val) as 3 | 4 | 5 })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">Easy (3x3)</SelectItem>
                            <SelectItem value="4">Medium (4x4)</SelectItem>
                            <SelectItem value="5">Hard (5x5)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Points Reward</Label>
                    <Input
                        type="number"
                        min={0}
                        max={1000}
                        value={content.points || 0}
                        onChange={(e) => updateContent({ points: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>
        </div>
    )
}
