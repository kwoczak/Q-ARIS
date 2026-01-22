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
import { BackgroundEditor } from "./blocks/BackgroundEditor"
import { BlockList } from "./blocks/BlockList"

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
                <SheetHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <SheetTitle>Edit Stage: {formData.title}</SheetTitle>
                        <SheetDescription>
                            Configure content and media for this step.
                        </SheetDescription>
                    </div>
                    {trigger && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-4 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => window.open(`/play/${trigger.code}`, '_blank')}
                        >
                            <QrCode className="w-4 h-4" />
                            Preview
                        </Button>
                    )}
                </SheetHeader>

                {/* Native CSS Scrolling - More robust than ScrollArea for full height layouts */}
                <div className="flex-1 w-full overflow-y-auto">
                    <div className="p-6 space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="stage-title">Stage Title (Internal)</Label>
                            <Input
                                id="stage-title"
                                value={formData.title}
                                onChange={handleTitleChange}
                            />
                        </div>

                        {/* --- ADVANCED BUILDER --- */}
                        <div className="space-y-6">
                            <BackgroundEditor
                                background={formData.content?.background}
                                onChange={(bg) => handleContentChange('background', bg)}
                            />

                            <div className="border-t pt-4">
                                <Label className="mb-4 block">Content Blocks</Label>
                                <BlockList
                                    blocks={formData.content?.blocks || []}
                                    onChange={(blocks) => handleContentChange('blocks', blocks)}
                                />
                            </div>
                        </div>

                        {/* Legacy Warnings / Fallback */}
                        {(formData.content?.text || formData.content?.images?.length || formData.content?.audio) && (
                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <h4 className="font-bold text-yellow-800 text-sm mb-2">Legacy Content Detected</h4>
                                <p className="text-xs text-yellow-700 mb-2">
                                    This stage has content created with the old editor. It will still display, but consider moving it to Blocks for better styling.
                                </p>
                            </div>
                        )}

                        <div className="h-10" />
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

            </SheetContent >
        </Sheet >
    )
}
