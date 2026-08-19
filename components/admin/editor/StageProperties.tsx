import { useState, useEffect } from "react"
import { Stage, StageContent, Trigger, Story, AITokenUsage } from "@/types/schema" // Added Story, AITokenUsage

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { createClient } from "@/lib/supabase/client"
import QRCode from 'qrcode'
import { getStableBaseUrl } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Loader2, QrCode, Sparkles, SlidersHorizontal, Wand2, Plus, Palette, Music, Ticket, Layers, HelpCircle, Quote, BarChart3, Image as ImageIcon, Video as VideoIcon, Box as BoxIcon } from "lucide-react"
import { BackgroundEditor } from "./blocks/BackgroundEditor"
import { BlockList } from "./blocks/BlockList"
import { StageRenderer } from "@/components/player/StageRenderer"
import { translateStageContent } from "@/app/actions/translate"
import { AITokenTracker } from "./ai/AITokenTracker"
import { AIModeEditor } from "./ai/AIModeEditor"
import { AIBackgroundModal, StageBackground } from "./ai/AIBackgroundModal"
import { AIMediaLibraryModal } from "./ai/AIMediaLibraryModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import {
    generateQuizHtml,
    generateFactCardHtml,
    generateScratchCardHtml,
    generateAudioCardHtml,
    generateGalleryHtml,
    generateImageCardHtml,
    generateVideoCardHtml,
    generateModel3DHtml,
    generateStatsHtml,
    generateQuoteHtml
} from "./ai/AIComponentInspector"
import { AIAttachment } from "@/types/schema"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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

import { getLocalNetworkIp } from "@/app/actions/network"

interface StagePropertiesProps {
    stage: Stage | null
    story: Story
    isOpen: boolean
    onClose: () => void
    onSave: (updatedStage: Stage) => void
    onDelete: (stageId: string) => void
    onDuplicate: () => void
    readOnly?: boolean
    isAIModeAllowed?: boolean
}

export function StageProperties({
    stage,
    story,
    isOpen,
    onClose,
    onSave,
    onDelete,
    onDuplicate,
    readOnly = false,
    isAIModeAllowed = false
}: StagePropertiesProps) {
    const [formData, setFormData] = useState<Stage | null>(null)
    const [trigger, setTrigger] = useState<Trigger | null>(null)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
    const [isLoadingQr, setIsLoadingQr] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)
    const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false)
    const [isQrModalOpen, setIsQrModalOpen] = useState(false)
    const [localNetworkIp, setLocalNetworkIp] = useState<string>('192.168.100.103')
    const [qrTargetMode, setQrTargetMode] = useState<'local' | 'production'>('local')
    const [currentLanguage, setCurrentLanguage] = useState<string>(story.default_language || 'en')

    // AI Mode States
    const [isAIMode, setIsAIMode] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [lastTokenUsage, setLastTokenUsage] = useState<AITokenUsage | undefined>(undefined)
    const [sessionUsage, setSessionUsage] = useState({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0
    })

    // AI Toolbar & Modals outside Phone Mockup
    const [isAddComponentOpen, setIsAddComponentOpen] = useState(false)
    const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)
    const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // AI History State (Max 5 previous changes back = 6 total snapshots)
    const [history, setHistory] = useState<{ title: string; content: any; timestamp: string; label: string }[]>([])
    const [historyIndex, setHistoryIndex] = useState<number>(0)

    const supabase = createClient()

    useEffect(() => {
        if (stage) {
            setFormData({ ...stage })
            const initialSnapshot = {
                title: stage.title,
                content: JSON.parse(JSON.stringify(stage.content || {})),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                label: 'Initial version'
            }
            setHistory([initialSnapshot])
            setHistoryIndex(0)
            fetchTrigger(stage.id)
            // Auto open AI mode if stage was previously created with custom_html and AI mode is allowed
            if (stage.content?.custom_html && isAIModeAllowed) {
                setIsAIMode(true)
            } else {
                setIsAIMode(false)
            }
        } else {
            setTrigger(null)
            setQrCodeDataUrl(null)
            setIsAIMode(false)
            setHistory([])
            setHistoryIndex(0)
        }
    }, [stage, isAIModeAllowed])

    useEffect(() => {
        getLocalNetworkIp().then(ip => {
            if (ip) setLocalNetworkIp(ip)
        })
    }, [])

    const handleUpdateStage = (updatedStage: Stage, label: string = 'AI Update') => {
        setFormData(updatedStage)

        const newSnapshot = {
            title: updatedStage.title,
            content: JSON.parse(JSON.stringify(updatedStage.content || {})),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            label
        }

        setHistory(prev => {
            const currentSlice = prev.slice(0, historyIndex + 1)
            const last = currentSlice[currentSlice.length - 1]
            if (
                last &&
                last.title === newSnapshot.title &&
                JSON.stringify(last.content) === JSON.stringify(newSnapshot.content)
            ) {
                return prev
            }

            const next = [...currentSlice, newSnapshot]
            // Keep maximum 6 items: current state + 5 changes back
            if (next.length > 6) {
                return next.slice(next.length - 6)
            }
            return next
        })

        setHistoryIndex(prev => {
            const nextIndex = Math.min(historyIndex + 1, 5)
            return nextIndex
        })
    }

    const handleUndo = () => {
        if (historyIndex <= 0 || !formData) return

        const targetIndex = historyIndex - 1
        const targetSnapshot = history[targetIndex]
        if (!targetSnapshot) return

        setHistoryIndex(targetIndex)
        setFormData({
            ...formData,
            title: targetSnapshot.title,
            content: JSON.parse(JSON.stringify(targetSnapshot.content))
        })
    }

    const handleRedo = () => {
        if (historyIndex >= history.length - 1 || !formData) return

        const targetIndex = historyIndex + 1
        const targetSnapshot = history[targetIndex]
        if (!targetSnapshot) return

        setHistoryIndex(targetIndex)
        setFormData({
            ...formData,
            title: targetSnapshot.title,
            content: JSON.parse(JSON.stringify(targetSnapshot.content))
        })
    }

    // Global keyboard shortcuts for Undo / Redo in AI Mode
    useEffect(() => {
        if (!isAIMode) return

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement
            const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

            // Undo: Cmd+Z or Ctrl+Z
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                if (!isTyping) {
                    e.preventDefault()
                    handleUndo()
                }
            }

            // Redo: Cmd+Shift+Z or Ctrl+Shift+Z or Ctrl+Y
            if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
                ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')) {
                if (!isTyping) {
                    e.preventDefault()
                    handleRedo()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isAIMode, historyIndex, history, formData])

    const handleTokenUsageUpdate = (usage: AITokenUsage) => {
        setLastTokenUsage(usage)
        setSessionUsage(prev => ({
            promptTokens: prev.promptTokens + usage.promptTokens,
            completionTokens: prev.completionTokens + usage.completionTokens,
            totalTokens: prev.totalTokens + usage.totalTokens,
            costUsd: Number((prev.costUsd + usage.estimatedCostUsd).toFixed(6))
        }))
    }

    const getTargetUrl = (code: string, mode: 'local' | 'production') => {
        if (mode === 'local' && localNetworkIp) {
            const port = typeof window !== 'undefined' && window.location.port ? window.location.port : '3000'
            return `http://${localNetworkIp}:${port}/play/${code}`
        }
        return `https://q-aris.vercel.app/play/${code}`
    }

    const fetchTrigger = async (stageId: string) => {
        const { data } = await supabase.from('triggers').select('*').eq('target_stage_id', stageId).maybeSingle()
        if (data) {
            setTrigger(data)
            generateQrImage(data.code, qrTargetMode)
        } else {
            setTrigger(null)
            setQrCodeDataUrl(null)
        }
    }

    const generateQrImage = async (code: string, mode: 'local' | 'production' = qrTargetMode) => {
        try {
            const url = getTargetUrl(code, mode)
            const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 })
            setQrCodeDataUrl(dataUrl)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (trigger?.code) {
            generateQrImage(trigger.code, qrTargetMode)
        }
    }, [qrTargetMode, localNetworkIp, trigger?.code])

    const handleCreateTrigger = async () => {
        if (!formData || readOnly) return
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
        if (!formData || readOnly) return
        const updatedStage: Stage = {
            ...formData,
            content: {
                ...formData.content,
                [key]: value
            }
        }
        handleUpdateStage(updatedStage, `Edit ${key}`)
    }

    const insertComponentIntoHtml = (html: string, snippet: string, position: 'top' | 'bottom' = 'bottom'): string => {
        if (!html || !html.trim()) {
            return `<div class="space-y-6 p-4 w-full">\n  ${snippet}\n</div>`
        }

        try {
            if (typeof window !== 'undefined') {
                const parser = new DOMParser()
                const doc = parser.parseFromString(html, 'text/html')
                const body = doc.body

                // 1. If wrapped in a single main container (e.g. <div class="space-y-6 p-4">)
                if (body.children.length === 1 && body.firstElementChild) {
                    const wrapper = body.firstElementChild as HTMLElement
                    // Ensure wrapper has padding if missing
                    if (!wrapper.className.includes('p-') && !wrapper.className.includes('px-')) {
                        wrapper.classList.add('p-4')
                    }
                    if (!wrapper.className.includes('space-y-') && !wrapper.className.includes('gap-')) {
                        wrapper.classList.add('space-y-6')
                    }

                    const temp = doc.createElement('div')
                    temp.innerHTML = snippet.trim()
                    const newEl = temp.firstElementChild
                    if (newEl) {
                        if (position === 'top') {
                            wrapper.insertBefore(newEl, wrapper.firstChild)
                        } else {
                            wrapper.appendChild(newEl)
                        }
                        return body.innerHTML
                    }
                } else if (body.children.length > 1) {
                    // 2. Multiple root children without a wrapper: wrap in standard padded layout
                    const wrapper = doc.createElement('div')
                    wrapper.className = 'space-y-6 p-4 w-full'
                    while (body.firstChild) {
                        wrapper.appendChild(body.firstChild)
                    }

                    const temp = doc.createElement('div')
                    temp.innerHTML = snippet.trim()
                    const newEl = temp.firstElementChild
                    if (newEl) {
                        if (position === 'top') {
                            wrapper.insertBefore(newEl, wrapper.firstChild)
                        } else {
                            wrapper.appendChild(newEl)
                        }
                    }
                    body.appendChild(wrapper)
                    return body.innerHTML
                }
            }
        } catch (err) {
            console.error('Error inserting component into HTML:', err)
        }

        // Fallback: append inside existing div if closed
        const trimmed = html.trim()
        if (trimmed.endsWith('</div>')) {
            const lastDivIndex = trimmed.lastIndexOf('</div>')
            return `${trimmed.slice(0, lastDivIndex)}\n  ${snippet}\n</div>`
        }

        return `<div class="space-y-6 p-4 w-full">\n  ${trimmed}\n  ${snippet}\n</div>`
    }

    const handleInsertComponent = (type: string) => {
        if (!formData) return

        let snippet = ''
        switch (type) {
            case 'scratch_card':
                snippet = generateScratchCardHtml({
                    hiddenImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
                    hiddenTitle: 'Secret Revealed',
                    hiddenDescription: 'You have uncovered the secret hidden detail!',
                    coverText: '🪙 SCRATCH TO REVEAL',
                    scratchInstruction: '(Rub with finger or mouse)',
                    foilTheme: 'silver',
                    points: '+50 PTS'
                })
                break
            case 'quiz':
                snippet = generateQuizHtml({
                    question: 'What is the most remarkable feature of this topic?',
                    options: ['Primary discovery', 'Key milestone', 'Cosmic phenomenon'],
                    correctIndex: 0,
                    points: '+50 PTS',
                    explanation: 'This primary insight represents a turning point in understanding.',
                    title: '⚡ Explorer Quiz'
                })
                break
            case 'fact_card':
                snippet = generateFactCardHtml({
                    icon: '💎',
                    title: 'Key Insight',
                    description: 'This key insight provides crucial context and depth to the story.'
                })
                break
            case 'audio':
                snippet = generateAudioCardHtml({
                    audioUrl: '',
                    title: 'Audio Guide',
                    subtitle: 'Audio Narration'
                })
                break
            case 'image':
                snippet = generateImageCardHtml({
                    url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80',
                    caption: 'Featured Exhibition Photograph'
                })
                break
            case 'video':
                snippet = generateVideoCardHtml({
                    url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
                    title: 'Documentary Video Clip',
                    subtitle: 'Video Player'
                })
                break
            case 'model_3d':
                snippet = generateModel3DHtml({
                    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
                    title: '3D Interactive Artifact',
                    subtitle: 'Drag to rotate in 3D'
                })
                break
            case 'gallery':
                snippet = generateGalleryHtml()
                break
            case 'stats':
                snippet = generateStatsHtml()
                break
            case 'quote':
                snippet = generateQuoteHtml()
                break
        }

        if (snippet) {
            const currentHtml = formData.content?.custom_html || ''
            const updatedHtml = insertComponentIntoHtml(currentHtml, snippet, 'bottom')
            handleContentChange('custom_html', updatedHtml)
        }

        setIsAddComponentOpen(false)
    }

    const handleVoiceoverSelected = (assets: AIAttachment[]) => {
        if (assets && assets.length > 0 && assets[0].url && formData) {
            const audioTrack = assets[0]
            const snippet = generateAudioCardHtml({
                audioUrl: audioTrack.url,
                title: audioTrack.name ? audioTrack.name.replace(/\.[^/.]+$/, '') : 'Voiceover',
                subtitle: 'Audio Narration'
            })

            const currentHtml = formData.content?.custom_html || ''
            const updatedHtml = insertComponentIntoHtml(currentHtml, snippet, 'top')
            handleContentChange('custom_html', updatedHtml)
        }
        setIsVoiceoverModalOpen(false)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData || readOnly) return
        setFormData({ ...formData, title: e.target.value })
    }

    const handleSave = () => {
        if (formData && !readOnly) {
            onSave(formData)
            onClose()
        }
    }

    if (!formData) return null

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className={`w-screen sm:w-screen max-w-none sm:max-w-none flex flex-col h-full bg-neutral-950 border-none transition-all p-0 gap-0 text-white [&>button]:hidden ${readOnly ? 'sm:w-[500px] right-0 left-auto' : ''}`}>
                <SheetHeader className="p-4 border-b border-white/10 shrink-0 flex flex-row items-center justify-between space-y-0 h-16 bg-neutral-900">
                    <div className="flex items-center gap-4">
                        <div>
                            <SheetTitle className="text-white flex items-center gap-2">
                                {readOnly ? 'Preview Stage:' : 'Edit Stage:'} {formData.title}
                                {isAIMode && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-normal">
                                        AI Mode
                                    </span>
                                )}
                            </SheetTitle>
                            <SheetDescription className="hidden sm:block text-neutral-400">
                                {readOnly ? 'Read-only preview' : 'Real-time preview active'}
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Switch to AI Mode Button (when in manual mode, restricted to curator_demo & admin) */}
                        {!readOnly && !isAIMode && isAIModeAllowed && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsAIMode(true)}
                                className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-all shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400 animate-pulse" />
                                Switch to AI Mode
                            </Button>
                        )}

                        {/* QR Code Trigger Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsQrModalOpen(true)}
                            className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-700 transition-all"
                        >
                            <QrCode className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                            QR Code
                        </Button>

                        <Button variant="outline" onClick={onClose} className="border-neutral-700 hover:bg-neutral-800 text-white hover:text-white bg-transparent">{readOnly ? 'Close' : 'Cancel'}</Button>
                        {!readOnly && <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-500">Save Changes</Button>}
                    </div>
                </SheetHeader>

                {/* Token Tracker Top Bar (when in AI Mode or when tokens have been spent) */}
                {!readOnly && (isAIMode || sessionUsage.totalTokens > 0) && (
                    <AITokenTracker
                        sessionUsage={sessionUsage}
                        lastUsage={lastTokenUsage}
                        isGenerating={isGenerating}
                        canUndo={historyIndex > 0}
                        canRedo={historyIndex < history.length - 1}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        undoCount={historyIndex}
                        redoCount={Math.max(0, history.length - 1 - historyIndex)}
                        historySnapshots={history}
                        currentHistoryIndex={historyIndex}
                    />
                )}

                <div className={`flex-1 overflow-hidden grid ${readOnly ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                    {/* LEFT PANEL: EDITOR (HIDDEN IN READONLY) */}
                    {!readOnly && (
                        isAIMode ? (
                            /* --- AI MODE EDITOR --- */
                            <div className="h-full overflow-y-auto border-r border-white/10 bg-neutral-950">
                                <AIModeEditor
                                    stage={formData}
                                    onUpdateStage={handleUpdateStage}
                                    onSwitchToManual={() => setIsAIMode(false)}
                                    onTokenUsageUpdate={handleTokenUsageUpdate}
                                    isGenerating={isGenerating}
                                    setIsGenerating={setIsGenerating}
                                    currentLanguage={currentLanguage}
                                    onOpenQR={() => setIsQrModalOpen(true)}
                                />
                            </div>
                        ) : (
                            /* --- MANUAL BLOCK EDITOR --- */
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
                                                                    onSave(result.data as Stage)
                                                                    setIsTranslateDialogOpen(false)
                                                                } else {
                                                                    alert("Translation reported failure: " + result.message)
                                                                }
                                                            } catch (e) {
                                                                console.error(e)
                                                                alert("Translation failed. Check console.")
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
                                        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                            <h4 className="font-bold text-yellow-400 text-sm mb-2">Legacy Content Detected</h4>
                                            <p className="text-xs text-yellow-300 mb-2">
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
                                            <div className="flex flex-col items-center p-4 border border-white/10 rounded-lg bg-white gap-3">
                                                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                                                <p className="font-mono text-xs text-neutral-900 bg-neutral-100 px-2 py-1 rounded">Code: {trigger.code}</p>

                                                <div className="flex flex-col gap-2 w-full">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                                                        onClick={async () => {
                                                            try {
                                                                const baseUrl = getStableBaseUrl()
                                                                const url = `${baseUrl}/play/${trigger.code}`
                                                                const highResUrl = await QRCode.toDataURL(url, { width: 1500, margin: 2 })
                                                                const link = document.createElement('a');
                                                                link.download = `qr-${trigger.code}-1500px.png`;
                                                                link.href = highResUrl;
                                                                link.click();
                                                            } catch (e) {
                                                                console.error(e)
                                                                alert("Error generating High-Res QR")
                                                            }
                                                        }}
                                                    >
                                                        Download High-Res PNG (1500px)
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                                                        onClick={async () => {
                                                            try {
                                                                const baseUrl = getStableBaseUrl()
                                                                const url = `${baseUrl}/play/${trigger.code}`
                                                                const svgString = await QRCode.toString(url, { type: 'svg', margin: 2 })
                                                                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                                                                const link = document.createElement('a');
                                                                link.download = `qr-${trigger.code}.svg`;
                                                                link.href = URL.createObjectURL(blob);
                                                                link.click();
                                                            } catch (e) {
                                                                console.error(e)
                                                                alert("Error generating SVG QR")
                                                            }
                                                        }}
                                                    >
                                                        Download SVG (Vector)
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-10" />
                                    <div className="pt-4 border-t flex justify-between">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                        >
                                            Delete Stage
                                        </Button>
                                        <Button variant="secondary" onClick={() => {
                                            onDuplicate()
                                            onClose()
                                        }}>Duplicate Stage</Button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* RIGHT PANEL: LIVE PREVIEW */}
                    <div className="h-full bg-neutral-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-black z-0 pointer-events-none" />

                        {/* Top Control Bar OUTSIDE Phone Mockup (Only in AI Mode) */}
                        {isAIMode && (
                            <div className="relative z-20 mb-3 flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-950/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsAddComponentOpen(true)}
                                    className="h-8 px-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Component
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsBackgroundModalOpen(true)}
                                    className="h-8 px-3 bg-neutral-900 hover:bg-neutral-800 border-white/10 text-neutral-200 hover:text-white text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                                    Background
                                </Button>
                            </div>
                        )}

                        {/* Phone Mockup Frame */}
                        <div className="relative z-10 h-[74vh] w-[calc(74vh*(9/19.5))] bg-black rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-neutral-800 ring-1 ring-white/10 aspect-[9/19.5]">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-black z-50 rounded-b-xl pointer-events-none" />

                            {/* Screen Content */}
                            <div className="w-full h-full bg-black overflow-hidden scrollbar-hide">
                                {/* Only render if we have data to prevent errors */}
                                {formData && (
                                    <div className="stage-renderer-preview-wrapper h-full w-full overflow-hidden">
                                        <StageRenderer
                                            stage={formData}
                                            isPreview={true}
                                            language={currentLanguage}
                                            isGamified={story.is_gamified ?? true}
                                            onCustomHtmlChange={(newHtml) => handleContentChange('custom_html', newHtml)}
                                            onBackgroundChange={(bg) => handleContentChange('background', bg)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 text-center text-neutral-500 text-xs">
                            Live Preview (iPhone SE / 12 Mini scale)
                        </div>
                    </div>
                </div>
            </SheetContent>

            {/* ADD COMPONENT DIALOG MODAL (OUTSIDE PREVIEW) */}
            <Dialog open={isAddComponentOpen} onOpenChange={setIsAddComponentOpen}>
                <DialogContent className="max-w-md w-full bg-neutral-950 border border-purple-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-2xl z-50">
                    <DialogHeader className="p-5 border-b border-white/10 bg-neutral-900/60">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-white">Add Component</DialogTitle>
                                <DialogDescription className="text-xs text-neutral-400">
                                    Choose an interactive component to insert into your stage.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[68vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => handleInsertComponent('image')}
                            className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-blue-300">🖼️ Single Photo / Image</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Standalone photo with caption & smart framing</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('video')}
                            className="p-3 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                                <VideoIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-red-300">🎬 Video Clip Player</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Interactive video player with controls & caption</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('model_3d')}
                            className="p-3 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-950/50 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                                <BoxIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">📦 3D Model Viewer</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Interactive 3D model (GLB/GLTF) with rotation & AR</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('gallery')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">🖼️ Photo Gallery</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Swipeable multi-photo carousel with 3:4 cards</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('audio')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                                <Music className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">🎧 Audio Guide</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Audio narration player card</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('scratch_card')}
                            className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                <Ticket className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-amber-300">🎟️ Scratch Card</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Interactive rub-to-reveal canvas with secret image & detail</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('quiz')}
                            className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">⚡ Quiz Widget</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Multiple choice quiz with instant score & explanation</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('fact_card')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">💎 Highlight Card</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Key insight card with icon & description</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('stats')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-purple-300">📊 Stats Grid</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">2x2 key metrics counter cards</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInsertComponent('quote')}
                            className="p-3 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-800/80 text-left transition-all flex items-start gap-3 group cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                                <Quote className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-amber-300">💬 Curatorial Quote</h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Emphasized quote block with author attribution</p>
                            </div>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* BACKGROUND MODAL */}
            <AIBackgroundModal
                isOpen={isBackgroundModalOpen}
                onClose={() => setIsBackgroundModalOpen(false)}
                currentBackground={formData?.content?.background}
                onSave={(bg) => {
                    handleContentChange('background', bg)
                    setIsBackgroundModalOpen(false)
                }}
            />

            {/* VOICEOVER MODAL */}
            <AIMediaLibraryModal
                isOpen={isVoiceoverModalOpen}
                onClose={() => setIsVoiceoverModalOpen(false)}
                onSelectAssets={handleVoiceoverSelected}
                initialCategory="audio"
            />

            {/* QR CODE DIALOG MODAL (Accessible in AI Mode & from Top Header) */}
            <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <QrCode className="w-5 h-5 text-blue-400" />
                            Stage QR Code (Action Trigger)
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400 text-xs">
                            Scan the QR code with your phone camera to open this stage directly on mobile.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Target Switcher: Local Wi-Fi vs Production Domain */}
                        <div className="flex bg-neutral-950 p-1 rounded-xl border border-white/10 gap-1 text-xs">
                            <button
                                type="button"
                                onClick={() => setQrTargetMode('local')}
                                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                                    qrTargetMode === 'local'
                                        ? 'bg-purple-600 text-white shadow'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                📱 Local Phone Test (Wi-Fi)
                            </button>
                            <button
                                type="button"
                                onClick={() => setQrTargetMode('production')}
                                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                                    qrTargetMode === 'production'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                🌐 Production Domain (Vercel)
                            </button>
                        </div>

                        {!trigger ? (
                            <div className="flex flex-col items-center justify-center p-6 bg-neutral-950 rounded-xl border border-white/10 text-center gap-3">
                                <QrCode className="w-12 h-12 text-neutral-600 animate-pulse" />
                                <div>
                                    <p className="text-sm font-medium text-neutral-300">No QR Code generated for this stage yet</p>
                                    <p className="text-xs text-neutral-500 mt-1">Generate a unique access code to connect this stage with a physical exhibit.</p>
                                </div>
                                <Button
                                    onClick={handleCreateTrigger}
                                    disabled={isLoadingQr}
                                    className="bg-blue-600 text-white hover:bg-blue-500 font-medium"
                                >
                                    {isLoadingQr && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Generate QR Code
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center p-5 border border-white/10 rounded-2xl bg-white text-neutral-900 gap-3.5 shadow-xl">
                                {qrCodeDataUrl ? (
                                    <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center bg-neutral-100 rounded-lg">
                                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                    </div>
                                )}

                                <div className="flex flex-col items-center gap-1 w-full bg-neutral-100 p-2.5 rounded-xl border border-neutral-200">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-neutral-500 font-medium">Checkpoint code:</span>
                                        <span className="font-mono text-xs font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-300">{trigger.code}</span>
                                    </div>
                                    <p className="text-[10.5px] text-blue-600 font-mono break-all text-center font-semibold">
                                        {getTargetUrl(trigger.code, qrTargetMode)}
                                    </p>
                                </div>

                                {qrTargetMode === 'local' ? (
                                    <p className="text-[11px] text-neutral-500 text-center leading-snug">
                                        💡 Your phone must be connected to the same Wi-Fi network as this computer. Remember to click <strong>Save Changes</strong> first.
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-neutral-500 text-center leading-snug">
                                        💡 Production domain loads the version deployed to Vercel after running <code>git push</code>.
                                    </p>
                                )}

                                <div className="flex flex-col gap-2 w-full pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-neutral-300 text-neutral-800 hover:bg-neutral-100 font-medium"
                                        onClick={async () => {
                                            try {
                                                const url = getTargetUrl(trigger.code, qrTargetMode)
                                                const highResUrl = await QRCode.toDataURL(url, { width: 1500, margin: 2 })
                                                const link = document.createElement('a')
                                                link.download = `qr-${trigger.code}-${qrTargetMode}-1500px.png`
                                                link.href = highResUrl
                                                link.click()
                                            } catch (e) {
                                                console.error(e)
                                                alert("Error generating High-Res QR")
                                            }
                                        }}
                                    >
                                        Download High-Res PNG (1500px)
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-neutral-300 text-neutral-800 hover:bg-neutral-100 font-medium"
                                        onClick={async () => {
                                            try {
                                                const url = getTargetUrl(trigger.code, qrTargetMode)
                                                const svgString = await QRCode.toString(url, { type: 'svg', margin: 2 })
                                                const blob = new Blob([svgString], { type: 'image/svg+xml' })
                                                const link = document.createElement('a')
                                                link.download = `qr-${trigger.code}-${qrTargetMode}.svg`
                                                link.href = URL.createObjectURL(blob)
                                                link.click()
                                            } catch (e) {
                                                console.error(e)
                                                alert("Error generating Vector SVG")
                                            }
                                        }}
                                    >
                                        Download Vector SVG (Print)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Custom Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (formData) {
                        onDelete(formData.id)
                        setIsDeleteModalOpen(false)
                        onClose()
                    }
                }}
                title="Delete Stage"
                description="Are you sure you want to delete this stage? This action cannot be undone and will permanently remove all its content, components, and triggers."
                itemTitle={formData?.title || 'Untitled Stage'}
                itemBadge={trigger?.code}
                confirmText="Delete Stage"
                cancelText="Cancel"
            />
        </Sheet>
    )
}
