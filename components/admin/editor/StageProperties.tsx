'use client'

import { useState, useEffect } from "react"
import { Stage, StageContent, Trigger } from "@/types/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { createClient } from "@/lib/supabase/client"
import QRCode from 'qrcode'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Loader2, QrCode } from "lucide-react"

interface StagePropertiesProps {
    stage: Stage | null
    isOpen: boolean
    onClose: () => void
    onSave: (updatedStage: Stage) => void
    onDelete: (stageId: string) => void
}

export function StageProperties({ stage, isOpen, onClose, onSave, onDelete }: StagePropertiesProps) {
    const [formData, setFormData] = useState<Stage | null>(null)
    const [trigger, setTrigger] = useState<Trigger | null>(null)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
    const [isLoadingQr, setIsLoadingQr] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (stage) {
            setFormData({ ...stage })
            fetchTrigger(stage.id)
        } else {
            setTrigger(null)
            setQrCodeDataUrl(null)
        }
    }, [stage])

    const fetchTrigger = async (stageId: string) => {
        const { data } = await supabase.from('triggers').select('*').eq('target_stage_id', stageId).maybeSingle()
        if (data) {
            setTrigger(data)
            generateQrImage(data.code)
        } else {
            setTrigger(null)
            setQrCodeDataUrl(null)
        }
    }

    const generateQrImage = async (code: string) => {
        try {
            // In production, this URL would be https://museum-app.com/play/{code}
            const url = `${window.location.origin}/play/${code}`
            const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
            setQrCodeDataUrl(dataUrl)
        } catch (err) {
            console.error(err)
        }
    }

    const handleCreateTrigger = async () => {
        if (!formData) return
        setIsLoadingQr(true)

        const code = Math.random().toString(36).substring(2, 10).toUpperCase()

        const { data, error } = await supabase.from('triggers').insert({
            code,
            story_id: formData.story_id,
            target_stage_id: formData.id,
            type: 'checkpoint'
        }).select().single()

        if (data) {
            setTrigger(data)
            generateQrImage(data.code)
        }
        setIsLoadingQr(false)
    }

    const handleContentChange = (key: keyof StageContent, value: any) => {
        if (!formData) return
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                [key]: value
            }
        })
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return
        setFormData({ ...formData, title: e.target.value })
    }

    const handleSave = () => {
        if (formData) {
            onSave(formData)
            onClose()
        }
    }

    if (!formData) return null

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full bg-white transition-all p-0 gap-0">
                <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>Edit Stage: {formData.title}</SheetTitle>
                    <SheetDescription>
                        Configure content and media for this step.
                    </SheetDescription>
                </SheetHeader>

                {/* Native CSS Scrolling - More robust than ScrollArea for full height layouts */}
                <div className="flex-1 w-full overflow-y-auto">
                    <div className="p-6 space-y-6">

                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="stage-title">Stage Title (Internal)</Label>
                            <Input
                                id="stage-title"
                                value={formData.title}
                                onChange={handleTitleChange}
                            />
                        </div>

                        {/* Text Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content-text">Text Content</Label>
                            <Textarea
                                id="content-text"
                                value={formData.content?.text || ''}
                                onChange={(e) => handleContentChange('text', e.target.value)}
                                placeholder="Enter the story text here..."
                                rows={5}
                            />
                        </div>

                        <div className="h-px bg-neutral-200" />

                        <h3 className="font-semibold text-sm">Media Assets</h3>

                        {/* Audio Upload */}
                        <div className="space-y-2 p-3 bg-neutral-50 rounded-md">
                            <Label>Voiceover / Audio (MP3)</Label>
                            <FileUpload
                                label="Audio"
                                accept="audio/mp3,audio/mpeg,audio/wav"
                                folder="audio"
                                currentUrl={formData.content?.audio}
                                onUploadComplete={(url) => handleContentChange('audio', url)}
                            />
                            {formData.content?.audio && (
                                <audio
                                    controls
                                    src={formData.content.audio}
                                    className="mt-3 w-full"
                                    key={formData.content.audio} // Force re-render on change
                                />
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="autoplay"
                                    checked={formData.content?.autoplay_audio || false}
                                    onChange={(e) => handleContentChange('autoplay_audio', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="autoplay" className="font-normal text-xs text-neutral-600">Autoplay audio on load</Label>
                            </div>
                        </div>

                        {/* Images Upload */}
                        <div className="space-y-2 p-3 bg-neutral-50 rounded-md">
                            <Label>Image (JPG/PNG)</Label>
                            {/* Simplify to single image for MVP, array logic requires more UI */}
                            <FileUpload
                                label="Image"
                                accept="image/*"
                                folder="images"
                                // Handle array by taking first element if exist, or just treating as single string in this simple UI
                                currentUrl={formData.content?.images?.[0]}
                                onUploadComplete={(url) => handleContentChange('images', [url])}
                            />
                            {formData.content?.images?.[0] && (
                                <div className="mt-2 relative group">
                                    <img
                                        src={formData.content.images[0]}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-md border"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div className="space-y-2 p-3 bg-neutral-50 rounded-md">
                            <Label>Video (MP4)</Label>
                            <FileUpload
                                label="Video"
                                accept="video/mp4"
                                folder="video"
                                currentUrl={formData.content?.video}
                                onUploadComplete={(url) => handleContentChange('video', url)}
                            />
                        </div>

                        {/* 3D Model Upload */}
                        <div className="space-y-2 p-3 bg-neutral-50 rounded-md border-l-4 border-l-purple-500">
                            <Label className="text-purple-700 font-bold">AR Model (GLB)</Label>
                            <FileUpload
                                label="3D Model"
                                accept=".glb,.gltf"
                                folder="models"
                                currentUrl={formData.content?.model_3d}
                                onUploadComplete={(url) => handleContentChange('model_3d', url)}
                            />
                            {formData.content?.model_3d && (
                                <div className="mt-2 p-3 bg-purple-50 border border-purple-100 rounded-md flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600 font-bold text-xs">
                                        3D
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs font-medium text-purple-900 truncate">Model Uploaded</p>
                                        <p className="text-[10px] text-purple-600 truncate opacity-70">Ready for AR View</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-neutral-500 mt-1">
                                Upload a .glb file to enable the "View in AR" button for this stage.
                            </p>
                        </div>

                        <div className="h-px bg-neutral-200" />

                        {/* QR Code Section */}
                        <div className="space-y-4">
                            <div className="flex bg-neutral-100 p-4 rounded-lg items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-neutral-600" />
                                    <span className="font-semibold text-sm">Action Trigger</span>
                                </div>
                                {!trigger && (
                                    <Button size="sm" onClick={handleCreateTrigger} disabled={isLoadingQr}>
                                        {isLoadingQr && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Generate QR Code
                                    </Button>
                                )}
                            </div>

                            {trigger && qrCodeDataUrl && (
                                <div className="flex flex-col items-center p-4 border rounded-lg bg-white">
                                    <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                                    <p className="font-mono text-xs mt-2 text-neutral-500">Code: {trigger.code}</p>
                                    <Button variant="link" className="h-auto p-0 text-blue-600" onClick={() => {
                                        const link = document.createElement('a');
                                        link.download = `qr-${trigger.code}.png`;
                                        link.href = qrCodeDataUrl;
                                        link.click();
                                    }}>
                                        Download PNG
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="h-10" /> {/* Extra spacer */}
                    </div>
                </div>

                <div className="p-4 bg-white border-t flex justify-between gap-2 shrink-0">
                    <Button variant="destructive" onClick={() => {
                        if (formData && confirm("Are you sure you want to delete this stage?")) {
                            onDelete(formData.id)
                            onClose()
                        }
                    }}>Delete Stage</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    )
}
