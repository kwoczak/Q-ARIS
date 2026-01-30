'use client'

import { useState, useEffect } from "react"
import { Stage, StageContent, Trigger, Story } from "@/types/schema" // Added Story

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
import { StageRenderer } from "@/components/player/StageRenderer"
import { translateStageContent } from "@/app/actions/translate"
import { Sparkles } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"




interface StagePropertiesProps {
    stage: Stage | null
    story: Story // Added story prop
    isOpen: boolean
    onClose: () => void
    onSave: (updatedStage: Stage) => void
    onDelete: (stageId: string) => void
    onDuplicate: () => void
}

export function StageProperties({ stage, story, isOpen, onClose, onSave, onDelete, onDuplicate }: StagePropertiesProps) {
    const [formData, setFormData] = useState<Stage | null>(null)
    const [trigger, setTrigger] = useState<Trigger | null>(null)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
    const [isLoadingQr, setIsLoadingQr] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)
    const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false)
    const [currentLanguage, setCurrentLanguage] = useState<string>(story.default_language || 'en')

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
            <SheetContent className="w-screen sm:w-screen max-w-none sm:max-w-none flex flex-col h-full bg-neutral-950 border-none transition-all p-0 gap-0 text-white [&>button]:hidden">
                <SheetHeader className="p-4 border-b border-white/10 shrink-0 flex flex-row items-center justify-between space-y-0 h-16 bg-neutral-900">
                    <div className="flex items-center gap-4">
                        <div>
                            <SheetTitle className="text-white">Edit Stage: {formData.title}</SheetTitle>
                            <SheetDescription className="hidden sm:block text-neutral-400">
                                Real-time preview active
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose} className="border-neutral-700 hover:bg-neutral-800 text-white hover:text-white bg-transparent">Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-500">Save Changes</Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    {/* LEFT PANEL: EDITOR */}
                    <div className="h-full overflow-y-auto border-r border-white/10 bg-neutral-950">
                        {/* Language Switcher */}
                        {story.supported_languages && story.supported_languages.length > 0 && (
                            <div className="p-4 border-b border-white/10 bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-sm flex justify-between items-start">
                                <div>
                                    <Label className="text-xs text-neutral-400 mb-2 block">Editing Language</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {story.supported_languages.map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setCurrentLanguage(lang)}
                                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${currentLanguage === lang
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700'
                                                    }`}
                                            >
                                                {lang.toUpperCase()}
                                                {lang === story.default_language && <span className="ml-1 opacity-50 text-[10px]">(Default)</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <AlertDialog open={isTranslateDialogOpen} onOpenChange={setIsTranslateDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-900/40 hover:text-purple-300"
                                            disabled={story.supported_languages.length <= 1}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                                            Auto-Translate
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Auto-Translate Content?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-neutral-400">
                                                This will use AI to translate content from the default language ({story.default_language?.toUpperCase()})
                                                to all other supported languages ({story.supported_languages.filter(l => l !== story.default_language).join(', ').toUpperCase()}).
                                                <br /><br />
                                                <strong className="text-red-400">Warning: This will overwrite any existing translations you have manually entered.</strong>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent border-neutral-700 text-white hover:bg-neutral-800 hover:text-white" disabled={isTranslating}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                                disabled={isTranslating}
                                                onClick={async (e) => {
                                                    e.preventDefault()
                                                    if (!formData || !story.supported_languages) return

                                                    const targetLangs = story.supported_languages.filter(l => l !== story.default_language)
                                                    if (targetLangs.length === 0) return

                                                    setIsTranslating(true)

                                                    try {
                                                        const result = await translateStageContent(formData.id, targetLangs)
                                                        if (result.success && result.data) {
                                                            setFormData(result.data as Stage)
                                                            onSave(result.data as Stage) // Propagate update to parent
                                                            setIsTranslateDialogOpen(false)
                                                        }
                                                    } catch (e) {
                                                        console.error(e)
                                                        alert("Translation failed. Please check logs.")
                                                    } finally {
                                                        setIsTranslating(false)
                                                    }
                                                }}
                                            >
                                                {isTranslating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Translating...
                                                    </>
                                                ) : (
                                                    "Start Translation"
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}

                        <div className="p-6 space-y-8 max-w-2xl mx-auto">
                            {/* Basic Info */}
                            <div className="space-y-2">
                                <Label htmlFor="stage-title">Stage Title (Internal)</Label>
                                <Input
                                    id="stage-title"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="bg-neutral-900 border-white/10"
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
                                        currentLanguage={currentLanguage}
                                        defaultLanguage={story.default_language || 'en'}
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

                            {/* QR Code Section */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex bg-neutral-900 p-4 rounded-lg items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="w-5 h-5 text-neutral-400" />
                                        <span className="font-semibold text-sm text-neutral-200">Action Trigger</span>
                                    </div>
                                    {!trigger && (
                                        <Button size="sm" onClick={handleCreateTrigger} disabled={isLoadingQr} variant="secondary">
                                            {isLoadingQr && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Generate QR Code
                                        </Button>
                                    )}
                                </div>

                                {trigger && qrCodeDataUrl && (
                                    <div className="flex flex-col items-center p-4 border border-white/10 rounded-lg bg-white">
                                        <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                                        <p className="font-mono text-xs mt-2 text-neutral-900">Code: {trigger.code}</p>
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

                            <div className="h-10" />
                            <div className="pt-4 border-t flex justify-between">
                                <Button variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => {
                                    if (formData && confirm("Are you sure you want to delete this stage?")) {
                                        onDelete(formData.id)
                                        onClose()
                                    }
                                }}>Delete Stage</Button>
                                <Button variant="secondary" onClick={() => {
                                    onDuplicate()
                                    onClose()
                                }}>Duplicate Stage</Button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: LIVE PREVIEW */}
                    <div className="h-full bg-neutral-900 flex items-center justify-center p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-black z-0 pointer-events-none" />

                        {/* Phone Mockup Frame */}
                        <div className="relative z-10 h-[80vh] w-[calc(80vh*(9/19.5))] bg-black rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-neutral-800 ring-1 ring-white/10 aspect-[9/19.5]">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-black z-50 rounded-b-xl" />

                            {/* Screen Content */}
                            <div className="w-full h-full bg-white overflow-hidden scrollbar-hide">
                                {/* Only render if we have data to prevent errors */}
                                {formData && (
                                    <div className="stage-renderer-preview-wrapper h-full w-full overflow-y-auto">
                                        <StageRenderer stage={formData} isPreview={true} language={currentLanguage} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 text-center text-neutral-500 text-xs">
                            Live Preview (iPhone SE / 12 Mini scale)
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
