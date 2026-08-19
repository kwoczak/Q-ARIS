import React, { useState, useRef } from 'react'
import { Stage, StageContent, AIAttachment, AIChatMessage, AITokenUsage } from '@/types/schema'
import { generateStageWithAI, enhancePromptWithAI, COMPOSITION_ARCHETYPES } from '@/app/actions/ai-generator'
import { uploadAsset } from '@/lib/supabase/storage'
import { AIProgressBar } from './AIProgressBar'
import { AIMediaLibraryModal } from './AIMediaLibraryModal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Sparkles,
    UploadCloud,
    Image as ImageIcon,
    Video,
    Music,
    Box,
    X,
    Send,
    Bot,
    User,
    RotateCcw,
    SlidersHorizontal,
    PlusCircle,
    Check,
    AlertCircle,
    FileText,
    QrCode,
    Info,
    Lightbulb,
    HelpCircle,
    LayoutGrid,
    Plus,
    Paperclip,
    Loader2,
    Wand2
} from 'lucide-react'

interface AIModeEditorProps {
    stage: Stage
    onUpdateStage: (updatedStage: Stage) => void
    onSwitchToManual?: () => void
    onTokenUsageUpdate: (usage: AITokenUsage) => void
    isGenerating: boolean
    setIsGenerating: (generating: boolean) => void
    currentLanguage?: string
    onOpenQR?: () => void
}

const QUICK_MODIFICATIONS = [
    "Change background to deep blue gradient",
    "Enlarge the main headline and add gold accent",
    "Add a 3-question interactive quiz at the bottom",
    "Enhance readability and add glassmorphism to cards",
    "Tighten spacing and make layout more compact"
]

export function AIModeEditor({
    stage,
    onUpdateStage,
    onSwitchToManual,
    onTokenUsageUpdate,
    isGenerating,
    setIsGenerating,
    currentLanguage = 'en',
    onOpenQR
}: AIModeEditorProps) {
    // Initial Form State
    const [prompt, setPrompt] = useState('')
    const [language, setLanguage] = useState(currentLanguage || 'en')
    const [materials, setMaterials] = useState<AIAttachment[]>([])
    const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
    const [generateImages, setGenerateImages] = useState(true)
    const [isUploadingMedia, setIsUploadingMedia] = useState(false)
    const [isUploadingRef, setIsUploadingRef] = useState(false)
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
    const [isEnhancingChatPrompt, setIsEnhancingChatPrompt] = useState(false)
    const [selectedArchetype, setSelectedArchetype] = useState<string>('auto')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isPromptTipsOpen, setIsPromptTipsOpen] = useState(false)

    // Media Library Modal State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
    const [mediaModalCategory, setMediaModalCategory] = useState<'all' | 'image' | 'video' | 'audio' | 'model_3d'>('all')
    const [isMediaModalForChat, setIsMediaModalForChat] = useState(false)

    // Chat / Iteration State
    const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([])
    const [chatInput, setChatInput] = useState('')
    const [chatAttachments, setChatAttachments] = useState<AIAttachment[]>([])
    const [isUploadingChatMedia, setIsUploadingChatMedia] = useState(false)
    const [hasGeneratedFirstVersion, setHasGeneratedFirstVersion] = useState<boolean>(
        Boolean(stage.content?.custom_html)
    )

    const fileInputRef = useRef<HTMLInputElement>(null)
    const refImageInputRef = useRef<HTMLInputElement>(null)
    const chatFileInputRef = useRef<HTMLInputElement>(null)

    // Handle Media Files Upload (Brief Form)
    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploadingMedia(true)
        setErrorMessage(null)

        try {
            const newAttachments: AIAttachment[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                let type: AIAttachment['type'] = 'other'

                if (file.type.startsWith('image/')) type = 'image'
                else if (file.type.startsWith('video/')) type = 'video'
                else if (file.type.startsWith('audio/')) type = 'audio'
                else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) type = 'model_3d'

                try {
                    const uploadedUrl = await uploadAsset(file, 'ai-materials')
                    if (uploadedUrl) {
                        newAttachments.push({
                            id: Math.random().toString(36).substring(2, 9),
                            name: file.name,
                            type,
                            url: uploadedUrl
                        })
                    }
                } catch (upErr) {
                    console.warn("Storage upload failed, reading locally as data URL...", upErr)
                    const dataUrl = await readFileAsDataURL(file)
                    newAttachments.push({
                        id: Math.random().toString(36).substring(2, 9),
                        name: file.name,
                        type,
                        url: dataUrl
                    })
                }
            }

            setMaterials(prev => [...prev, ...newAttachments])
        } catch (err: any) {
            console.error("Upload error:", err)
            setErrorMessage("Error uploading file: " + (err.message || 'Unknown error'))
        } finally {
            setIsUploadingMedia(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Handle Direct Upload from Disk in Chat
    const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploadingChatMedia(true)
        setErrorMessage(null)

        try {
            const newAttachments: AIAttachment[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                let type: AIAttachment['type'] = 'other'
                // Images uploaded in chat default to visual feedback / bug inspection
                let purpose: AIAttachment['purpose'] = 'visual_feedback'

                if (file.type.startsWith('image/')) {
                    type = 'image'
                    purpose = 'visual_feedback'
                } else if (file.type.startsWith('video/')) {
                    type = 'video'
                    purpose = 'content_asset'
                } else if (file.type.startsWith('audio/')) {
                    type = 'audio'
                    purpose = 'content_asset'
                } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                    type = 'model_3d'
                    purpose = 'content_asset'
                }

                let url: string | null = null
                try {
                    url = await uploadAsset(file, 'ai-materials')
                } catch (upErr) {
                    console.warn("Storage upload failed, using Data URL fallback:", upErr)
                    url = await readFileAsDataURL(file)
                }

                if (url) {
                    newAttachments.push({
                        id: Math.random().toString(36).substring(2, 9),
                        name: file.name,
                        type,
                        purpose,
                        url
                    })
                }
            }

            setChatAttachments(prev => [...prev, ...newAttachments])
        } catch (err: any) {
            console.error("Chat upload error:", err)
            setErrorMessage("Error uploading chat attachment: " + (err.message || 'Unknown error'))
        } finally {
            setIsUploadingChatMedia(false)
            if (chatFileInputRef.current) chatFileInputRef.current.value = ''
        }
    }

    // Handle Clipboard Paste (e.g. Screenshot or Copied Image) in Chat
    const handleChatPaste = async (e: React.ClipboardEvent) => {
        const clipboardItems = e.clipboardData?.items
        if (!clipboardItems) return

        const imageFiles: File[] = []
        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i]
            if (item.type && item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (file) {
                    imageFiles.push(file)
                }
            }
        }

        if (imageFiles.length === 0) return

        // Image found in clipboard - process paste attachment
        setIsUploadingChatMedia(true)

        try {
            const newAttachments: AIAttachment[] = []

            for (const file of imageFiles) {
                const timestamp = new Date().toISOString().slice(11, 19).replace(/:/g, '')
                const screenshotName = `Screenshot_${timestamp}.png`
                const renamedFile = new File([file], screenshotName, { type: file.type || 'image/png' })

                let url: string | null = null
                try {
                    url = await uploadAsset(renamedFile, 'ai-materials')
                } catch (upErr) {
                    console.warn("Storage upload failed, using Data URL fallback:", upErr)
                    url = await readFileAsDataURL(renamedFile)
                }

                if (url) {
                    newAttachments.push({
                        id: Math.random().toString(36).substring(2, 9),
                        name: screenshotName,
                        type: 'image',
                        purpose: 'visual_feedback', // Tagged strictly as visual inspection
                        url
                    })
                }
            }

            setChatAttachments(prev => [...prev, ...newAttachments])
        } catch (err: any) {
            console.error("Paste image error:", err)
        } finally {
            setIsUploadingChatMedia(false)
        }
    }

    // Handle Style Reference Image Upload
    const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingRef(true)
        setErrorMessage(null)

        try {
            try {
                const url = await uploadAsset(file, 'ai-reference')
                if (url) {
                    setReferenceImageUrl(url)
                }
            } catch (upErr) {
                console.warn("Fallback to data URL for reference image", upErr)
                const dataUrl = await readFileAsDataURL(file)
                setReferenceImageUrl(dataUrl)
            }
        } catch (err: any) {
            console.error("Reference upload error:", err)
            setErrorMessage("Error uploading reference image.")
        } finally {
            setIsUploadingRef(false)
            if (refImageInputRef.current) refImageInputRef.current.value = ''
        }
    }

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // Enhance Prompt with AI (Expand brief into rich detailed prompt)
    const handleEnhancePrompt = async (forcedArchetype?: string) => {
        if (!prompt.trim() || isEnhancingPrompt) return

        setIsEnhancingPrompt(true)
        setErrorMessage(null)

        const archToUse = forcedArchetype || selectedArchetype

        try {
            const res = await enhancePromptWithAI({
                prompt,
                language,
                archetype: archToUse
            })

            if (res.success && res.enhancedPrompt) {
                setPrompt(res.enhancedPrompt)
            } else {
                setErrorMessage(res.error || 'Failed to enhance prompt.')
            }
        } catch (err: any) {
            console.error("Enhance prompt error:", err)
            setErrorMessage(err.message || 'Error occurred while enhancing prompt.')
        } finally {
            setIsEnhancingPrompt(false)
        }
    }

    // Enhance Chat Prompt with AI
    const handleEnhanceChatPrompt = async () => {
        if (!chatInput.trim() || isEnhancingChatPrompt) return

        setIsEnhancingChatPrompt(true)
        try {
            const res = await enhancePromptWithAI({
                prompt: chatInput,
                language
            })

            if (res.success && res.enhancedPrompt) {
                setChatInput(res.enhancedPrompt)
            }
        } catch (err: any) {
            console.error("Enhance chat prompt error:", err)
        } finally {
            setIsEnhancingChatPrompt(false)
        }
    }

    // Execute Initial AI Generation
    const handleInitialGenerate = async () => {
        if (!prompt.trim()) {
            setErrorMessage("Please enter a description of what you want to create.")
            return
        }

        setIsGenerating(true)
        setErrorMessage(null)

        const userMsg: AIChatMessage = {
            id: Math.random().toString(36).substring(2, 9),
            role: 'user',
            content: prompt,
            timestamp: new Date().toLocaleTimeString()
        }

        try {
            const res = await generateStageWithAI({
                prompt,
                materials,
                referenceImageUrl: referenceImageUrl || undefined,
                language,
                generateImages,
                currentTitle: stage.title,
                currentContent: stage.content
            })

            if (!res.success) {
                throw new Error(res.error || 'Generation failed.')
            }

            if (res.tokenUsage) {
                onTokenUsageUpdate(res.tokenUsage)
            }

            // Sync generated images to materials library
            if (res.generatedImages && res.generatedImages.length > 0) {
                setMaterials(prev => {
                    const existingUrls = new Set(prev.map(m => m.url))
                    const newUnique = res.generatedImages!.filter(g => !existingUrls.has(g.url))
                    return [...prev, ...newUnique]
                })
            }

            // Apply updates to stage
            const updatedStage: Stage = {
                ...stage,
                title: res.title || stage.title,
                content: {
                    ...stage.content,
                    background: res.background || stage.content?.background,
                    custom_html: res.custom_html || stage.content?.custom_html,
                    blocks: res.blocks || stage.content?.blocks
                }
            }

            onUpdateStage(updatedStage)
            setHasGeneratedFirstVersion(true)

            const assistantMsg: AIChatMessage = {
                id: Math.random().toString(36).substring(2, 9),
                role: 'assistant',
                content: res.message || 'Stage design generated successfully.',
                timestamp: new Date().toLocaleTimeString(),
                tokenUsage: res.tokenUsage
            }

            setChatHistory([userMsg, assistantMsg])
        } catch (err: any) {
            console.error("Generation failed:", err)
            setErrorMessage(err.message || 'An error occurred during generation.')
        } finally {
            setIsGenerating(false)
        }
    }

    // Execute Iterative Conversational Modification
    const handleChatSubmit = async (customPromptText?: string) => {
        const textToSend = customPromptText || chatInput
        if ((!textToSend.trim() && chatAttachments.length === 0) || isGenerating) return

        setIsGenerating(true)
        setErrorMessage(null)
        setChatInput('')

        const currentAttached = [...chatAttachments]
        setChatAttachments([])

        const userMsg: AIChatMessage = {
            id: Math.random().toString(36).substring(2, 9),
            role: 'user',
            content: textToSend || (currentAttached.length > 0 ? "Attached media / screenshot for layout adjustments." : ""),
            attachments: currentAttached.length > 0 ? currentAttached : undefined,
            timestamp: new Date().toLocaleTimeString()
        }

        const updatedHistory = [...chatHistory, userMsg]
        setChatHistory(updatedHistory)

        try {
            // Only non-visual-feedback items are added to permanent materials
            const allMaterials = [...materials]
            for (const att of currentAttached) {
                if (att.purpose === 'content_asset' && !allMaterials.some(m => m.url === att.url)) {
                    allMaterials.push(att)
                }
            }

            const res = await generateStageWithAI({
                prompt: textToSend || "Inspect the attached screenshot / media and apply the requested layout fixes or additions.",
                materials: allMaterials,
                attachedMedia: currentAttached,
                referenceImageUrl: referenceImageUrl || undefined,
                language,
                currentTitle: stage.title,
                currentContent: stage.content,
                chatHistory: updatedHistory.map(m => ({
                    role: m.role,
                    content: m.content,
                    attachments: m.attachments
                }))
            })

            if (!res.success) {
                throw new Error(res.error || 'Failed to apply refinement.')
            }

            if (res.tokenUsage) {
                onTokenUsageUpdate(res.tokenUsage)
            }

            // Apply modifications to stage
            const updatedStage: Stage = {
                ...stage,
                title: res.title || stage.title,
                content: {
                    ...stage.content,
                    background: res.background || stage.content?.background,
                    custom_html: res.custom_html || stage.content?.custom_html,
                    blocks: res.blocks || stage.content?.blocks
                }
            }

            onUpdateStage(updatedStage)

            const assistantMsg: AIChatMessage = {
                id: Math.random().toString(36).substring(2, 9),
                role: 'assistant',
                content: res.message || 'Refinements applied successfully.',
                timestamp: new Date().toLocaleTimeString(),
                tokenUsage: res.tokenUsage
            }

            setChatHistory([...updatedHistory, assistantMsg])
        } catch (err: any) {
            console.error("Chat error:", err)
            setErrorMessage(err.message || 'Error while applying refinements.')
        } finally {
            setIsGenerating(false)
        }
    }

    const imageMaterials = materials.filter(m => m.type === 'image')
    const videoMaterials = materials.filter(m => m.type === 'video')
    const audioMaterials = materials.filter(m => m.type === 'audio')
    const modelMaterials = materials.filter(m => m.type === 'model_3d')

    const handleAttachMediaAssets = (newAssets: AIAttachment[]) => {
        const taggedAssets = newAssets.map(a => ({ ...a, purpose: 'content_asset' as const }))
        if (isMediaModalForChat) {
            setChatAttachments(prev => {
                const existingUrls = new Set(prev.map(m => m.url))
                const filteredNew = taggedAssets.filter(na => !existingUrls.has(na.url))
                return [...prev, ...filteredNew]
            })
        }
        setMaterials(prev => {
            const existingUrls = new Set(prev.map(m => m.url))
            const filteredNew = taggedAssets.filter(na => !existingUrls.has(na.url))
            return [...prev, ...filteredNew]
        })
        setIsMediaModalForChat(false)
    }

    const toggleAttachmentPurpose = (id: string) => {
        setChatAttachments(prev => prev.map(att => {
            if (att.id === id) {
                const nextPurpose = att.purpose === 'visual_feedback' ? 'content_asset' : 'visual_feedback'
                return { ...att, purpose: nextPurpose }
            }
            return att
        }))
    }

    const removeMaterial = (id: string) => {
        setMaterials(prev => prev.filter(m => m.id !== id))
    }

    const removeChatAttachment = (id: string) => {
        setChatAttachments(prev => prev.filter(m => m.id !== id))
    }

    const getMaterialIcon = (type: AIAttachment['type']) => {
        switch (type) {
            case 'image': return <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            case 'video': return <Video className="w-3.5 h-3.5 text-red-400" />
            case 'audio': return <Music className="w-3.5 h-3.5 text-emerald-400" />
            case 'model_3d': return <Box className="w-3.5 h-3.5 text-purple-400" />
            default: return <FileText className="w-3.5 h-3.5 text-neutral-400" />
        }
    }

    return (
        <div className="flex flex-col h-full bg-neutral-950 text-white">
            {/* Error banner */}
            {errorMessage && (
                <div className="p-3 bg-red-950/80 border-b border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-400 hover:bg-red-900/40"
                        onClick={() => setErrorMessage(null)}
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Progress bar when generating */}
                <AIProgressBar isGenerating={isGenerating} />

                {!hasGeneratedFirstVersion ? (
                    /* ========================================================================= */
                    /* BRIEF CREATOR FORM (INITIAL VIEW)                                          */
                    /* ========================================================================= */
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    AI Creator - Project Brief
                                </h2>
                                <p className="text-xs text-neutral-400">
                                    Describe your concept, attach multimedia assets, and specify a visual style. OpenAI will generate a complete stage screen for you.
                                </p>
                            </div>
                            {onOpenQR && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onOpenQR}
                                    className="h-8 text-xs bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800 shrink-0"
                                >
                                    <QrCode className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                                    QR Code
                                </Button>
                            )}
                        </div>

                        {/* 1. Prompt Input with Archetype Selector, Enhance Button, and Prompt Tips */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <Label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                                    <span>1. Stage Description (Prompt)</span> <span className="text-purple-400">*</span>
                                </Label>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* 15 Composition Archetypes Selector */}
                                    <Select
                                        value={selectedArchetype}
                                        onValueChange={(val) => {
                                            setSelectedArchetype(val)
                                            if (prompt.trim()) {
                                                handleEnhancePrompt(val)
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-[200px] bg-neutral-900/90 border-purple-500/30 text-[11px] text-purple-200 focus:ring-1 focus:ring-purple-500 rounded-lg">
                                            <SelectValue placeholder="Style Archetype" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-950 border-purple-500/30 text-white max-h-[340px] z-50">
                                            <SelectItem value="auto" className="text-xs font-semibold text-amber-300">
                                                🎲 Auto-Detect (Dynamic AI Choice)
                                            </SelectItem>
                                            {COMPOSITION_ARCHETYPES.map((arch) => (
                                                <SelectItem key={arch.id} value={arch.id} className="text-xs cursor-pointer">
                                                    <span className="mr-1.5">{arch.icon}</span> {arch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <button
                                        type="button"
                                        disabled={isEnhancingPrompt || !prompt.trim()}
                                        onClick={() => handleEnhancePrompt()}
                                        className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 hover:text-amber-200 font-semibold px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-950/60 to-amber-900/40 hover:from-amber-950/90 hover:to-amber-900/70 border border-amber-500/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                        title="AI will expand and enrich your prompt using the selected composition archetype"
                                    >
                                        {isEnhancingPrompt ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                                <span>Enhancing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                <span>Enhance Prompt</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsPromptTipsOpen(!isPromptTipsOpen)}
                                        className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium px-2 py-1 rounded-md hover:bg-purple-950/60 border border-purple-500/25 transition-all cursor-pointer"
                                        title="Explore all 15 composition archetypes and tips"
                                    >
                                        <Info className="w-3.5 h-3.5" />
                                        <span>Archetypes & Tips</span>
                                    </button>
                                </div>
                            </div>

                            {/* Prompt Tips & 15 Archetypes Modal Card */}
                            {isPromptTipsOpen && (
                                <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-500/30 text-xs text-purple-200 space-y-3.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between font-semibold text-purple-300 border-b border-white/10 pb-2">
                                        <span className="flex items-center gap-1.5">
                                            <Lightbulb className="w-4 h-4 text-amber-400" />
                                            15 Composition Archetypes (Click to Apply):
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsPromptTipsOpen(false)}
                                            className="text-purple-400 hover:text-white p-0.5 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* 15 Archetypes Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                        {COMPOSITION_ARCHETYPES.map((arch) => (
                                            <button
                                                key={arch.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedArchetype(arch.id)
                                                    setIsPromptTipsOpen(false)
                                                    if (prompt.trim()) {
                                                        handleEnhancePrompt(arch.id)
                                                    }
                                                }}
                                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                    selectedArchetype === arch.id
                                                        ? 'bg-purple-900/60 border-purple-400 text-white'
                                                        : 'bg-neutral-900/70 border-white/10 text-neutral-300 hover:border-purple-500/40 hover:text-white'
                                                }`}
                                            >
                                                <span className="font-bold text-xs text-white flex items-center gap-1">
                                                    <span>{arch.icon}</span> {arch.name}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 mt-1 line-clamp-2">
                                                    {arch.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. Create an engaging, immersive experience about SpaceX Falcon 9. Add a launch date headline, an audio player with rocket telemetry, an image gallery, and finish with a 2-question quiz..."
                                className="min-h-[110px] bg-neutral-900 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500 text-sm"
                            />

                            {/* Auto-generate AI images toggle checkbox */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/30 transition-all">
                                <label htmlFor="generateImagesCheckbox" className="flex items-start gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        id="generateImagesCheckbox"
                                        checked={generateImages}
                                        onChange={(e) => setGenerateImages(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-purple-500/40 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                                    />
                                    <div className="text-xs text-neutral-300">
                                        <span className="font-semibold text-white flex items-center gap-1.5">
                                            <span>🎨 Auto-generate AI visuals (2–3 bespoke photos)</span>
                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-medium">GPT-Image</span>
                                        </span>
                                        <p className="text-[11px] text-neutral-400 mt-0.5">
                                            AI will design, generate and embed photorealistic high-fidelity visuals (Hero showcase & gallery) directly into the page.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* 2. Categorized Media Assets (Photos, Videos, Audio, 3D Models) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-xs font-medium text-neutral-300">
                                        2. Media Assets (Photos, Videos, Audio, 3D Models)
                                    </Label>
                                    <p className="text-[11px] text-neutral-400">
                                        Attach assets per category or pick from your Quaris Media Library.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMediaModalCategory('all')
                                        setIsMediaModalOpen(true)
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 transition-all cursor-pointer shadow-sm"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Browse Library</span>
                                </button>
                            </div>

                            {/* Hidden file input for direct computer uploads */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,audio/*,.glb,.gltf"
                                className="hidden"
                                onChange={handleMediaUpload}
                            />

                            {/* 4 Separate Category Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* 1. Photos & Images */}
                                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2.5 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-white block leading-tight">Photos & Graphics</span>
                                                    <span className="text-[10px] text-neutral-400">JPG, PNG, WebP</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 font-mono font-bold">
                                                {imageMaterials.length}
                                            </span>
                                        </div>

                                        {/* Image Badges List */}
                                        {imageMaterials.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                                                {imageMaterials.map(mat => (
                                                    <div key={mat.id} className="flex items-center gap-1.5 bg-neutral-950 border border-white/10 px-2 py-1 rounded-md text-[11px] text-neutral-200">
                                                        <ImageIcon className="w-3 h-3 text-blue-400 shrink-0" />
                                                        <span className="truncate max-w-[110px]" title={mat.name}>{mat.name}</span>
                                                        <button type="button" onClick={() => removeMaterial(mat.id)} className="text-neutral-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMediaModalCategory('image')
                                            setIsMediaModalOpen(true)
                                        }}
                                        className="w-full text-xs h-8 bg-neutral-950/70 border-white/10 hover:border-blue-500/40 text-neutral-300 hover:text-white cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1 text-blue-400" />
                                        Select / Add Photos
                                    </Button>
                                </div>

                                {/* 2. Video Clips */}
                                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2.5 flex flex-col justify-between hover:border-red-500/30 transition-all">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-white block leading-tight">Video Clips</span>
                                                    <span className="text-[10px] text-neutral-400">MP4, WebM, MOV</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 font-mono font-bold">
                                                {videoMaterials.length}
                                            </span>
                                        </div>

                                        {/* Video Badges List */}
                                        {videoMaterials.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                                                {videoMaterials.map(mat => (
                                                    <div key={mat.id} className="flex items-center gap-1.5 bg-neutral-950 border border-white/10 px-2 py-1 rounded-md text-[11px] text-neutral-200">
                                                        <Video className="w-3 h-3 text-red-400 shrink-0" />
                                                        <span className="truncate max-w-[110px]" title={mat.name}>{mat.name}</span>
                                                        <button type="button" onClick={() => removeMaterial(mat.id)} className="text-neutral-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMediaModalCategory('video')
                                            setIsMediaModalOpen(true)
                                        }}
                                        className="w-full text-xs h-8 bg-neutral-950/70 border-white/10 hover:border-red-500/40 text-neutral-300 hover:text-white cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1 text-red-400" />
                                        Select / Add Videos
                                    </Button>
                                </div>

                                {/* 3. Audio & Voiceover */}
                                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2.5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                                    <Music className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-white block leading-tight">Audio & Voiceover</span>
                                                    <span className="text-[10px] text-neutral-400">MP3, WAV, Voice</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                                                {audioMaterials.length}
                                            </span>
                                        </div>

                                        {/* Audio Badges List */}
                                        {audioMaterials.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                                                {audioMaterials.map(mat => (
                                                    <div key={mat.id} className="flex items-center gap-1.5 bg-neutral-950 border border-white/10 px-2 py-1 rounded-md text-[11px] text-neutral-200">
                                                        <Music className="w-3 h-3 text-emerald-400 shrink-0" />
                                                        <span className="truncate max-w-[110px]" title={mat.name}>{mat.name}</span>
                                                        <button type="button" onClick={() => removeMaterial(mat.id)} className="text-neutral-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMediaModalCategory('audio')
                                            setIsMediaModalOpen(true)
                                        }}
                                        className="w-full text-xs h-8 bg-neutral-950/70 border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                        Select / Add Audio
                                    </Button>
                                </div>

                                {/* 4. 3D Models */}
                                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2.5 flex flex-col justify-between hover:border-purple-500/30 transition-all">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                                    <Box className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-white block leading-tight">3D Models (GLB)</span>
                                                    <span className="text-[10px] text-neutral-400">GLB, GLTF</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono font-bold">
                                                {modelMaterials.length}
                                            </span>
                                        </div>

                                        {/* 3D Model Badges List */}
                                        {modelMaterials.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                                                {modelMaterials.map(mat => (
                                                    <div key={mat.id} className="flex items-center gap-1.5 bg-neutral-950 border border-white/10 px-2 py-1 rounded-md text-[11px] text-neutral-200">
                                                        <Box className="w-3 h-3 text-purple-400 shrink-0" />
                                                        <span className="truncate max-w-[110px]" title={mat.name}>{mat.name}</span>
                                                        <button type="button" onClick={() => removeMaterial(mat.id)} className="text-neutral-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMediaModalCategory('model_3d')
                                            setIsMediaModalOpen(true)
                                        }}
                                        className="w-full text-xs h-8 bg-neutral-950/70 border-white/10 hover:border-purple-500/40 text-neutral-300 hover:text-white cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1 text-purple-400" />
                                        Select / Add 3D Models
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Reference Image Upload */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-neutral-300">
                                    3. Visual Style Reference (Design Mockup / Screenshot)
                                </Label>
                                <span className="text-[11px] text-neutral-500">Optional</span>
                            </div>

                            <input
                                ref={refImageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleReferenceUpload}
                            />

                            {referenceImageUrl ? (
                                <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-neutral-900 p-2 flex items-center gap-3">
                                    <img
                                        src={referenceImageUrl}
                                        alt="Reference Style"
                                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-white/10"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-purple-300">Style reference attached</p>
                                        <p className="text-[11px] text-neutral-400">AI will match color palette and visual elegance to this mockup.</p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setReferenceImageUrl(null)}
                                        className="text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => refImageInputRef.current?.click()}
                                    disabled={isUploadingRef}
                                    className="w-full justify-start text-xs bg-neutral-900 border-white/10 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                >
                                    <ImageIcon className="w-4 h-4 mr-2 text-purple-400" />
                                    {isUploadingRef ? "Uploading reference..." : "+ Upload website screenshot or poster as style reference"}
                                </Button>
                            )}
                        </div>

                        {/* 4. Language Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-neutral-300">
                                4. Content Language
                            </Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="bg-neutral-900 border-white/10 text-white text-xs">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <SelectItem value="en">English (EN)</SelectItem>
                                    <SelectItem value="pl">Polski (PL)</SelectItem>
                                    <SelectItem value="de">Deutsch (DE)</SelectItem>
                                    <SelectItem value="es">Español (ES)</SelectItem>
                                    <SelectItem value="fr">Français (FR)</SelectItem>
                                    <SelectItem value="it">Italiano (IT)</SelectItem>
                                    <SelectItem value="cs">Čeština (CS)</SelectItem>
                                    <SelectItem value="ua">Українська (UA)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Generate Action Button - Only "Create" */}
                        <div className="pt-2">
                            <Button
                                onClick={handleInitialGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                {isGenerating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ========================================================================= */
                    /* CONVERSATIONAL AGENT CHAT (ITERATION VIEW)                                 */
                    /* ========================================================================= */
                    <div className="space-y-4 flex flex-col h-full">
                        {/* Top bar with quick actions */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                            <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-purple-400" />
                                <span className="font-semibold text-white">AI Stage Assistant (Live Chat)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {onOpenQR && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onOpenQR}
                                        className="h-7 text-[11px] bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800"
                                    >
                                        <QrCode className="w-3 h-3 mr-1 text-blue-400" />
                                        QR Code
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setHasGeneratedFirstVersion(false)}
                                    className="h-7 text-[11px] text-purple-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/20"
                                >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    New Brief
                                </Button>
                            </div>
                        </div>

                        {/* Chat History Messages */}
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {chatHistory.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 text-xs ${
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3 h-3 text-purple-300" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                                            msg.role === 'user'
                                                 ? 'bg-purple-600 text-white rounded-br-none'
                                                : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-bl-none'
                                        }`}
                                    >
                                        {/* Attached Media / Screenshots in User Message */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2.5">
                                                {msg.attachments.map((att) => (
                                                    <div key={att.id} className="relative rounded-lg overflow-hidden border border-white/20 bg-black/40">
                                                        {att.type === 'image' ? (
                                                            <a href={att.url} target="_blank" rel="noreferrer" title={att.name}>
                                                                <img src={att.url} alt={att.name} className="w-24 h-24 object-cover hover:scale-105 transition-transform" />
                                                            </a>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-neutral-200">
                                                                {getMaterialIcon(att.type)}
                                                                <span className="truncate max-w-[120px]">{att.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {msg.tokenUsage && (
                                            <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-neutral-400 flex items-center justify-between gap-2">
                                                <span>Tokens: {msg.tokenUsage.totalTokens}</span>
                                                <span className="text-emerald-400 font-mono">
                                                    +${msg.tokenUsage.estimatedCostUsd.toFixed(4)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0">
                                            <User className="w-3 h-3 text-neutral-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Quick modification suggestions */}
                        <div className="pt-2">
                            <p className="text-[11px] text-neutral-400 mb-1.5">Quick Edits:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_MODIFICATIONS.map((mod, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={isGenerating}
                                        onClick={() => handleChatSubmit(mod)}
                                        className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-purple-300 px-2.5 py-1 rounded-full border border-white/5 transition-colors disabled:opacity-50 text-left cursor-pointer"
                                    >
                                        {mod}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hidden file input for chat uploads */}
                        <input
                            ref={chatFileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*,.glb,.gltf"
                            className="hidden"
                            onChange={handleChatFileUpload}
                        />

                        {/* Chat input box with attachments */}
                        <div className="pt-2 border-t border-white/10 space-y-2">
                            {/* Chat Attachment Preview Bar */}
                            {chatAttachments.length > 0 && (
                                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between text-[11px] text-purple-300 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                                            Attached for next prompt ({chatAttachments.length})
                                        </span>
                                        <span className="text-[10px] text-purple-400/80">Vision analysis enabled</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {chatAttachments.map((att) => (
                                            <div key={att.id} className="flex items-center gap-2 bg-neutral-900 border border-purple-500/30 pl-1.5 pr-2 py-1 rounded-lg text-xs shadow-sm">
                                                {att.type === 'image' ? (
                                                    <img src={att.url} alt={att.name} className="w-6 h-6 rounded object-cover border border-white/10" />
                                                ) : (
                                                    getMaterialIcon(att.type)
                                                )}
                                                <span className="truncate max-w-[100px] text-neutral-200 text-[11px]" title={att.name}>{att.name}</span>
                                                
                                                {/* Purpose Selector / Toggle */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAttachmentPurpose(att.id)}
                                                    className={`text-[9.5px] px-1.5 py-0.5 rounded font-medium border transition-colors cursor-pointer ${
                                                        att.purpose === 'visual_feedback'
                                                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40 hover:bg-purple-900/50'
                                                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                                                    }`}
                                                    title={att.purpose === 'visual_feedback'
                                                        ? "🔍 Vision Bug Report: Analyzed by AI for layout fixes. Will NOT be inserted into HTML. Click to change."
                                                        : "🖼️ Content Asset: AI will insert this into HTML page. Click to change."}
                                                >
                                                    {att.purpose === 'visual_feedback' ? '🔍 Vision Bug' : '🖼️ Insert'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => removeChatAttachment(att.id)}
                                                    className="text-neutral-400 hover:text-red-400 ml-0.5 cursor-pointer p-0.5"
                                                    title="Remove attachment"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isUploadingChatMedia && (
                                <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/30 border border-purple-500/20 px-3 py-1.5 rounded-lg animate-pulse">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                                    <span>Uploading / attaching media...</span>
                                </div>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleChatSubmit()
                                }}
                                className="flex items-center gap-1.5"
                            >
                                {/* Upload from Computer Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={isGenerating || isUploadingChatMedia}
                                    onClick={() => chatFileInputRef.current?.click()}
                                    className="h-10 w-10 text-neutral-400 hover:text-purple-300 hover:bg-neutral-900 shrink-0 rounded-xl cursor-pointer"
                                    title="Upload images or screenshots from disk"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>

                                {/* Open Media Library Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={isGenerating || isUploadingChatMedia}
                                    onClick={() => {
                                        setIsMediaModalForChat(true)
                                        setMediaModalCategory('all')
                                        setIsMediaModalOpen(true)
                                    }}
                                    className="h-10 w-10 text-neutral-400 hover:text-purple-300 hover:bg-neutral-900 shrink-0 rounded-xl cursor-pointer"
                                    title="Pick assets from Media Library"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>

                                {/* Chat Input with onPaste for Direct Clipboard Screenshots */}
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onPaste={handleChatPaste}
                                    placeholder="Tell what to refine (or paste screenshot with Cmd+V)..."
                                    disabled={isGenerating}
                                    className="bg-neutral-900 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500 text-xs h-10 flex-1"
                                />

                                {/* Quick Enhance Chat Prompt Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={isGenerating || isEnhancingChatPrompt || !chatInput.trim()}
                                    onClick={handleEnhanceChatPrompt}
                                    className="h-10 w-10 text-amber-400/70 hover:text-amber-300 hover:bg-neutral-900 shrink-0 rounded-xl cursor-pointer"
                                    title="Enhance prompt with AI"
                                >
                                    {isEnhancingChatPrompt ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                    ) : (
                                        <Wand2 className="w-4 h-4" />
                                    )}
                                </Button>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isGenerating || (!chatInput.trim() && chatAttachments.length === 0)}
                                    className="h-10 w-10 bg-purple-600 hover:bg-purple-500 text-white shrink-0 rounded-xl cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Library Modal */}
            <AIMediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelectAssets={handleAttachMediaAssets}
                initialCategory={mediaModalCategory}
                selectedUrls={materials.map(m => m.url)}
            />
        </div>
    )
}
