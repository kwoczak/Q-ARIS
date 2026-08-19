'use client'

import React, { useState, useRef } from 'react'
import { Stage, StageContent, AIAttachment, AIChatMessage, AITokenUsage } from '@/types/schema'
import { generateStageWithAI } from '@/app/actions/ai-generator'
import { uploadAsset } from '@/lib/supabase/storage'
import { AIProgressBar } from './AIProgressBar'
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
    QrCode
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

const QUICK_PROMPTS = [
    "Misja kosmiczna Voyager 1 z odtwarzaczem audio i quizem wiedzy",
    "Wystawa dinozaurów: interaktywny model 3D tyranozaura i karta ciekawostek",
    "Renowacja arcydzieła: porównanie przed/po z eleganckim opisem kuratorskim",
    "Tajemnice starożytnego Egiptu z galerią artefaktów i klimatycznym tłem"
]

const QUICK_MODIFICATIONS = [
    "Zmień tło na ciemnoniebieski gradient",
    "Zwiększ rozmiar głównego nagłówka i dodaj akcent",
    "Dodaj na dole quiz sprawdzający wiedzę z 3 odpowiedziami",
    "Popraw czytelność tekstu i dodaj efekt glassmorphism do kart",
    "Zmniejsz odstępy i spraw, by układ był bardziej zwarty"
]

export function AIModeEditor({
    stage,
    onUpdateStage,
    onSwitchToManual,
    onTokenUsageUpdate,
    isGenerating,
    setIsGenerating,
    currentLanguage = 'pl',
    onOpenQR
}: AIModeEditorProps) {
    // Initial Form State
    const [prompt, setPrompt] = useState('')
    const [language, setLanguage] = useState(currentLanguage || 'pl')
    const [materials, setMaterials] = useState<AIAttachment[]>([])
    const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
    const [isUploadingMedia, setIsUploadingMedia] = useState(false)
    const [isUploadingRef, setIsUploadingRef] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Chat / Iteration State
    const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([])
    const [chatInput, setChatInput] = useState('')
    const [hasGeneratedFirstVersion, setHasGeneratedFirstVersion] = useState<boolean>(
        Boolean(stage.content?.custom_html)
    )

    const fileInputRef = useRef<HTMLInputElement>(null)
    const refImageInputRef = useRef<HTMLInputElement>(null)

    // Handle Media Files Upload
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
                    // Fallback to local Data URL for preview/AI vision
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
            setErrorMessage("Błąd podczas wgrywania pliku: " + (err.message || 'Nieznany błąd'))
        } finally {
            setIsUploadingMedia(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
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
            setErrorMessage("Błąd wgrywania zdjęcia referencyjnego.")
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

    // Execute Initial AI Generation
    const handleInitialGenerate = async () => {
        if (!prompt.trim()) {
            setErrorMessage("Proszę wpisać opis tego, co chcesz wygenerować.")
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
                currentTitle: stage.title,
                currentContent: stage.content
            })

            if (!res.success) {
                throw new Error(res.error || 'Generowanie nie powiodło się.')
            }

            if (res.tokenUsage) {
                onTokenUsageUpdate(res.tokenUsage)
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
                content: res.message || 'Wygenerowano projekt etapu.',
                timestamp: new Date().toLocaleTimeString(),
                tokenUsage: res.tokenUsage
            }

            setChatHistory([userMsg, assistantMsg])
        } catch (err: any) {
            console.error("Generation failed:", err)
            setErrorMessage(err.message || 'Wystąpił błąd podczas generowania.')
        } finally {
            setIsGenerating(false)
        }
    }

    // Execute Iterative Conversational Modification
    const handleChatSubmit = async (customPromptText?: string) => {
        const textToSend = customPromptText || chatInput
        if (!textToSend.trim() || isGenerating) return

        setIsGenerating(true)
        setErrorMessage(null)
        setChatInput('')

        const userMsg: AIChatMessage = {
            id: Math.random().toString(36).substring(2, 9),
            role: 'user',
            content: textToSend,
            timestamp: new Date().toLocaleTimeString()
        }

        const updatedHistory = [...chatHistory, userMsg]
        setChatHistory(updatedHistory)

        try {
            const res = await generateStageWithAI({
                prompt: textToSend,
                materials,
                referenceImageUrl: referenceImageUrl || undefined,
                language,
                currentTitle: stage.title,
                currentContent: stage.content,
                chatHistory: updatedHistory.map(m => ({ role: m.role, content: m.content }))
            })

            if (!res.success) {
                throw new Error(res.error || 'Wprowadzenie poprawki nie powiodło się.')
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
                content: res.message || 'Wprowadzono żądane zmiany.',
                timestamp: new Date().toLocaleTimeString(),
                tokenUsage: res.tokenUsage
            }

            setChatHistory([...updatedHistory, assistantMsg])
        } catch (err: any) {
            console.error("Chat error:", err)
            setErrorMessage(err.message || 'Błąd podczas nanoszenia poprawek.')
        } finally {
            setIsGenerating(false)
        }
    }

    const removeMaterial = (id: string) => {
        setMaterials(prev => prev.filter(m => m.id !== id))
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
                                    Kreator AI - Brief projektu
                                </h2>
                                <p className="text-xs text-neutral-400">
                                    Opisz swój pomysł, dodaj materiały multimedialne i wskaż styl graficzny. Model OpenAI wygeneruje dla Ciebie kompletny ekran etapu.
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

                        {/* 1. Prompt Input */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-neutral-300">
                                1. Opis etapu (Prompt) <span className="text-purple-400">*</span>
                            </Label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Np. Stwórz immersyjną opowieść o sondzie Voyager 1. Dodaj nagłówek z datą startu, odtwarzacz audio z sygnałem radiowym, zdjęcie i na końcu krótki quiz z 2 pytaniami..."
                                className="min-h-[110px] bg-neutral-900 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500 text-sm"
                            />
                            {/* Quick prompts */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {QUICK_PROMPTS.map((qp, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setPrompt(qp)}
                                        className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-purple-300 px-2.5 py-1 rounded-full border border-white/5 transition-colors text-left"
                                    >
                                        + {qp.slice(0, 42)}...
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Media Uploads */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-neutral-300">
                                    2. Twoje materiały (Zdjęcia, Wideo, Audio, Modele 3D)
                                </Label>
                                <span className="text-[11px] text-neutral-500">Opcjonalne</span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,audio/*,.glb,.gltf"
                                className="hidden"
                                onChange={handleMediaUpload}
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-dashed border-white/15 hover:border-purple-500/50 rounded-xl p-4 bg-neutral-900/50 hover:bg-neutral-900/80 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
                            >
                                <UploadCloud className="w-6 h-6 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                <p className="text-xs font-medium text-neutral-300 group-hover:text-white">
                                    {isUploadingMedia ? "Wgrywanie plików..." : "Kliknij, aby wybrać lub upuść pliki tutaj"}
                                </p>
                                <p className="text-[10px] text-neutral-500">
                                    Obsługuje JPG, PNG, MP4, MP3, WAV, GLB (3D)
                                </p>
                            </div>

                            {/* Uploaded Materials Badges */}
                            {materials.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {materials.map((mat) => (
                                        <div
                                            key={mat.id}
                                            className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs"
                                        >
                                            {getMaterialIcon(mat.type)}
                                            <span className="truncate max-w-[140px] text-neutral-200" title={mat.name}>
                                                {mat.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeMaterial(mat.id)}
                                                className="text-neutral-500 hover:text-red-400"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Reference Image Upload */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-neutral-300">
                                    3. Zdjęcie referencyjne stylu (Wzór graficzny / Zrzut ekranu)
                                </Label>
                                <span className="text-[11px] text-neutral-500">Opcjonalne</span>
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
                                        <p className="text-xs font-medium text-purple-300">Wzór stylu załączony</p>
                                        <p className="text-[11px] text-neutral-400">AI dopasuje kolory i klimat do tego zrzutu.</p>
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
                                    {isUploadingRef ? "Wgrywanie wzorca..." : "+ Wgraj zrzut ekranu strony www / plakatu jako wzór"}
                                </Button>
                            )}
                        </div>

                        {/* 4. Language Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-neutral-300">
                                4. Język treści
                            </Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="bg-neutral-900 border-white/10 text-white text-xs">
                                    <SelectValue placeholder="Wybierz język" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <SelectItem value="pl">Polski (PL)</SelectItem>
                                    <SelectItem value="en">English (EN)</SelectItem>
                                    <SelectItem value="de">Deutsch (DE)</SelectItem>
                                    <SelectItem value="es">Español (ES)</SelectItem>
                                    <SelectItem value="fr">Français (FR)</SelectItem>
                                    <SelectItem value="it">Italiano (IT)</SelectItem>
                                    <SelectItem value="cs">Čeština (CS)</SelectItem>
                                    <SelectItem value="ua">Українська (UA)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Generate Action Button */}
                        <div className="pt-2">
                            <Button
                                onClick={handleInitialGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                {isGenerating ? "Generowanie etapu..." : "Generuj z OpenAI (Reasoning Medium)"}
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
                                <span className="font-semibold text-white">Asystent Etapu (Czat na żywo)</span>
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
                                    Nowy Brief
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
                            <p className="text-[11px] text-neutral-400 mb-1.5">Szybkie poprawki:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_MODIFICATIONS.map((mod, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={isGenerating}
                                        onClick={() => handleChatSubmit(mod)}
                                        className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-purple-300 px-2.5 py-1 rounded-full border border-white/5 transition-colors disabled:opacity-50 text-left"
                                    >
                                        {mod}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat input box */}
                        <div className="pt-2 border-t border-white/10">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleChatSubmit()
                                }}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Napisz agentowi co zmienić (np. 'Zwiększ kontrast', 'Dodaj quiz', 'Zmień kolor tła')..."
                                    disabled={isGenerating}
                                    className="bg-neutral-900 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500 text-xs h-10"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isGenerating || !chatInput.trim()}
                                    className="h-10 w-10 bg-purple-600 hover:bg-purple-500 text-white shrink-0 rounded-xl"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
