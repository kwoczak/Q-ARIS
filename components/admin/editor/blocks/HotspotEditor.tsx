'use client'
import { generateId } from "@/lib/utils";

import { StageBlock, HotspotContent, HotspotItem } from "@/types/schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Plus, Trash2, MapPin } from "lucide-react"
import { useState, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"

interface HotspotEditorProps {
    block: StageBlock
    onChange: (block: StageBlock) => void
}

export function HotspotEditor({ block, onChange }: HotspotEditorProps) {
    const content = (typeof block.content === 'object' && block.content !== null && 'hotspots' in block.content)
        ? (block.content as HotspotContent)
        : { image: '', hotspots: [] }

    const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null)
    const [editingHotspot, setEditingHotspot] = useState<HotspotItem | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const imageRef = useRef<HTMLDivElement>(null)

    const updateContent = (partial: Partial<HotspotContent>) => {
        onChange({
            ...block,
            content: { ...content, ...partial }
        })
    }

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!content.image || !imageRef.current) return

        const rect = imageRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        const newHotspot: HotspotItem = {
            id: generateId(),
            x,
            y,
            label: 'New Point',
            text: ''
        }

        setEditingHotspot(newHotspot)
        setIsDialogOpen(true)
    }

    const saveHotspot = () => {
        if (!editingHotspot) return

        let newHotspots = [...content.hotspots]
        const existingIndex = newHotspots.findIndex(h => h.id === editingHotspot.id)

        if (existingIndex >= 0) {
            newHotspots[existingIndex] = editingHotspot
        } else {
            newHotspots.push(editingHotspot)
        }

        updateContent({ hotspots: newHotspots })
        setIsDialogOpen(false)
        setEditingHotspot(null)
    }

    const deleteHotspot = (id: string) => {
        updateContent({ hotspots: content.hotspots.filter(h => h.id !== id) })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Base Image</Label>
                <FileUpload
                    label="Upload Image"
                    accept="image/*"
                    folder="blocks/hotspots"
                    currentUrl={content.image}
                    onUploadComplete={(url) => updateContent({ image: url })}
                />
            </div>

            {content.image && (
                <div className="space-y-2">
                    <Label className="text-xs text-neutral-500">
                        Click on the image to add a hotspot.
                    </Label>
                    <div
                        ref={imageRef}
                        className="relative w-full rounded-lg overflow-hidden border cursor-crosshair group"
                        onClick={handleImageClick}
                    >
                        <img src={content.image} alt="Base" className="w-full h-auto block" />

                        {/* Hotspots Render */}
                        {content.hotspots.map(spot => (
                            <div
                                key={spot.id}
                                className="absolute w-6 h-6 -ml-3 -mt-3 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform z-10"
                                style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingHotspot(spot)
                                    setIsDialogOpen(true)
                                }}
                            >
                                <MapPin className="w-3 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List View of Hotspots */}
            <div className="space-y-2">
                <Label className="text-xs">Active Hotspots</Label>
                <div className="space-y-1">
                    {content.hotspots.length === 0 && (
                        <p className="text-xs text-neutral-400 italic">No hotspots added.</p>
                    )}
                    {content.hotspots.map(spot => (
                        <div key={spot.id} className="flex items-center justify-between p-2 bg-neutral-900 border border-white/10 rounded text-xs">
                            <span className="font-medium truncate flex-1 text-white">{spot.label || 'Point'}</span>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-neutral-800 text-neutral-400" onClick={() => {
                                    setEditingHotspot(spot)
                                    setIsDialogOpen(true)
                                }}>
                                    <MapPin className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-neutral-800" onClick={() => deleteHotspot(spot.id)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Hotspot</DialogTitle>
                    </DialogHeader>
                    {editingHotspot && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Label (Short Title)</Label>
                                <Input
                                    value={editingHotspot.label}
                                    onChange={(e) => setEditingHotspot({ ...editingHotspot, label: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Visible on click)</Label>
                                <Textarea
                                    value={editingHotspot.text}
                                    onChange={(e) => setEditingHotspot({ ...editingHotspot, text: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveHotspot}>Save Point</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
