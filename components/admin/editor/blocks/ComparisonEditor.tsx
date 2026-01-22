'use client'

import { StageBlock, ComparisonContent } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/ui/file-upload" // Assuming this exists as reusable
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface ComparisonEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function ComparisonEditor({ block, onChange }: ComparisonEditorProps) {
    // Cast content to ComparisonContent or init default
    const content = (typeof block.content === 'object' && block.content !== null)
        ? (block.content as ComparisonContent)
        : { imageBefore: '', imageAfter: '', labelBefore: 'Before', labelAfter: 'After' }

    const updateContent = (partial: Partial<ComparisonContent>) => {
        onChange({
            ...block,
            content: { ...content, ...partial }
        })
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Image 1 (Left/Before)</Label>
                    <FileUpload
                        label="Upload Before"
                        accept="image/*"
                        folder="blocks/comparison"
                        currentUrl={content.imageBefore}
                        onUploadComplete={(url) => updateContent({ imageBefore: url })}
                    />
                    <Input
                        placeholder="Label (e.g. 1920)"
                        value={content.labelBefore || ''}
                        onChange={(e) => updateContent({ labelBefore: e.target.value })}
                        className="mt-1 h-8 text-xs"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Image 2 (Right/After)</Label>
                    <FileUpload
                        label="Upload After"
                        accept="image/*"
                        folder="blocks/comparison"
                        currentUrl={content.imageAfter}
                        onUploadComplete={(url) => updateContent({ imageAfter: url })}
                    />
                    <Input
                        placeholder="Label (e.g. 2024)"
                        value={content.labelAfter || ''}
                        onChange={(e) => updateContent({ labelAfter: e.target.value })}
                        className="mt-1 h-8 text-xs"
                    />
                </div>
            </div>

            {/* Preview */}
            {content.imageBefore && content.imageAfter && (
                <div className="space-y-2">
                    <Label className="text-xs text-neutral-500">Preview</Label>
                    <div className="h-64 rounded-lg overflow-hidden border">
                        <ReactCompareSlider
                            itemOne={<ReactCompareSliderImage src={content.imageBefore} alt="Image one" />}
                            itemTwo={<ReactCompareSliderImage src={content.imageAfter} alt="Image two" />}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
