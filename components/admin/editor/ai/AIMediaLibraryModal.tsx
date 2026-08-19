'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AIAttachment } from '@/types/schema'
import { getAllMediaAssets, MediaAsset } from '@/lib/actions/media'
import { uploadAsset } from '@/lib/supabase/storage'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    ImageIcon,
    Video,
    Music,
    Box,
    LayoutGrid,
    Search,
    UploadCloud,
    Check,
    Loader2,
    X,
    Play,
    Pause,
    Plus
} from 'lucide-react'

interface AIMediaLibraryModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectAssets: (assets: AIAttachment[]) => void
    initialCategory?: 'all' | 'image' | 'video' | 'audio' | 'model_3d'
    lockCategory?: boolean
    selectedUrls?: string[]
}

export function formatMediaDisplayName(rawName: string): string {
    if (!rawName) return 'Media Asset'
    
    const lastDotIndex = rawName.lastIndexOf('.')
    const ext = lastDotIndex !== -1 ? rawName.substring(lastDotIndex) : ''
    const baseName = lastDotIndex !== -1 ? rawName.substring(0, lastDotIndex) : rawName

    // Pattern 1: name_shortHash (e.g. "Golden_Mask_7k2m")
    const hashPatternMatch = baseName.match(/^(.+)_[a-z0-9]{4,8}$/i)
    if (hashPatternMatch && hashPatternMatch[1]) {
        return hashPatternMatch[1].replace(/[_]/g, ' ') + ext
    }

    // Pattern 2: old random hash with timestamp (e.g. "5qd58q9pn1m_1787152185282")
    const oldHashTimestampMatch = baseName.match(/^[a-z0-9]{8,15}_([0-9]+)$/i)
    if (oldHashTimestampMatch) {
        return `Asset_${baseName.substring(0, 6)}${ext}`
    }

    return baseName.replace(/[_]/g, ' ') + ext
}

export function AIMediaLibraryModal({
    isOpen,
    onClose,
    onSelectAssets,
    initialCategory = 'all',
    lockCategory,
    selectedUrls = []
}: AIMediaLibraryModalProps) {
    const [assets, setAssets] = useState<MediaAsset[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isLocked = lockCategory ?? (initialCategory !== 'all')
    const categoryNormalized = initialCategory === 'model_3d' ? 'model' : initialCategory
    const [activeTab, setActiveTab] = useState<string>(categoryNormalized)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItems, setSelectedItems] = useState<Map<string, AIAttachment>>(new Map())
    const [isUploading, setIsUploading] = useState(false)
    const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

    // Load media assets from Supabase storage
    useEffect(() => {
        if (isOpen) {
            fetchMedia()
            const normalized = initialCategory === 'model_3d' ? 'model' : initialCategory
            setActiveTab(normalized)
            setSelectedItems(new Map())
            setSearchQuery('')
        } else {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause()
            }
            setPlayingAudioUrl(null)
        }
    }, [isOpen, initialCategory])

    const fetchMedia = async () => {
        setIsLoading(true)
        try {
            const res = await getAllMediaAssets()
            if (res.success && res.data) {
                setAssets(res.data)
            }
        } catch (err) {
            console.error("Error fetching media assets:", err)
        } finally {
            setIsLoading(false)
        }
    }

    // Toggle selection of asset
    const toggleAsset = (asset: MediaAsset) => {
        // Enforce type match if locked
        if (isLocked) {
            if (categoryNormalized === 'image' && asset.type !== 'image') return
            if (categoryNormalized === 'audio' && asset.type !== 'audio') return
            if (categoryNormalized === 'video' && asset.type !== 'video') return
            if (categoryNormalized === 'model' && asset.type !== 'model') return
        }

        const key = asset.url
        const newMap = new Map(selectedItems)

        if (newMap.has(key)) {
            newMap.delete(key)
        } else {
            let aiType: AIAttachment['type'] = 'other'
            if (asset.type === 'image') aiType = 'image'
            else if (asset.type === 'video') aiType = 'video'
            else if (asset.type === 'audio') aiType = 'audio'
            else if (asset.type === 'model') aiType = 'model_3d'

            const displayName = formatMediaDisplayName(asset.name)

            newMap.set(key, {
                id: Math.random().toString(36).substring(2, 9),
                name: displayName,
                type: aiType,
                url: asset.url
            })
        }
        setSelectedItems(newMap)
    }

    // Direct Upload Handler inside Modal
    const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                let folder = 'general'
                let aiType: AIAttachment['type'] = 'other'

                if (file.type.startsWith('image/')) { folder = 'images'; aiType = 'image' }
                else if (file.type.startsWith('video/')) { folder = 'videos'; aiType = 'video' }
                else if (file.type.startsWith('audio/')) { folder = 'audio'; aiType = 'audio' }
                else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) { folder = 'models'; aiType = 'model_3d' }

                // Check lock compatibility on upload
                if (isLocked) {
                    if (categoryNormalized === 'image' && aiType !== 'image') continue
                    if (categoryNormalized === 'audio' && aiType !== 'audio') continue
                    if (categoryNormalized === 'video' && aiType !== 'video') continue
                    if (categoryNormalized === 'model' && aiType !== 'model_3d') continue
                }

                const uploadedUrl = await uploadAsset(file, folder)
                if (uploadedUrl) {
                    // Auto-select uploaded file with its actual original name
                    setSelectedItems(prev => {
                        const newMap = new Map(prev)
                        newMap.set(uploadedUrl, {
                            id: Math.random().toString(36).substring(2, 9),
                            name: file.name,
                            type: aiType,
                            url: uploadedUrl
                        })
                        return newMap
                    })
                }
            }
            // Refresh list
            await fetchMedia()
        } catch (err) {
            console.error("Upload error:", err)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Handle Confirm
    const handleConfirmSelection = () => {
        onSelectAssets(Array.from(selectedItems.values()))
        onClose()
    }

    // Filter assets by tab and search
    const filteredAssets = assets.filter(a => {
        const displayName = formatMediaDisplayName(a.name)
        const matchesSearch = !searchQuery || 
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            displayName.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        if (isLocked) {
            if (categoryNormalized === 'image') return a.type === 'image'
            if (categoryNormalized === 'audio') return a.type === 'audio'
            if (categoryNormalized === 'video') return a.type === 'video'
            if (categoryNormalized === 'model') return a.type === 'model'
        }

        if (activeTab === 'all') return true
        if (activeTab === 'images' || activeTab === 'image') return a.type === 'image'
        if (activeTab === 'videos' || activeTab === 'video') return a.type === 'video'
        if (activeTab === 'audio') return a.type === 'audio'
        if (activeTab === 'model' || activeTab === 'model_3d') return a.type === 'model'
        return true
    })

    const handleAudioPreview = (e: React.MouseEvent, url: string) => {
        e.stopPropagation()
        if (playingAudioUrl === url) {
            audioPlayerRef.current?.pause()
            setPlayingAudioUrl(null)
        } else {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.src = url
                audioPlayerRef.current.play()
                setPlayingAudioUrl(url)
            }
        }
    }

    const fileAccept = isLocked
        ? categoryNormalized === 'image'
            ? 'image/*'
            : categoryNormalized === 'audio'
            ? 'audio/*'
            : categoryNormalized === 'video'
            ? 'video/*'
            : categoryNormalized === 'model'
            ? '.glb,.gltf'
            : '*/*'
        : 'image/*,video/*,audio/*,.glb,.gltf'

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
                {/* Audio player element for sound preview */}
                <audio
                    ref={audioPlayerRef}
                    onEnded={() => setPlayingAudioUrl(null)}
                    className="hidden"
                />

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={fileAccept}
                    className="hidden"
                    onChange={handleUploadFiles}
                />

                {/* Header */}
                <DialogHeader className="p-5 border-b border-white/10 shrink-0 bg-neutral-950 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-purple-400" />
                            {isLocked
                                ? categoryNormalized === 'image'
                                    ? 'Select Image Asset'
                                    : categoryNormalized === 'audio'
                                    ? 'Select Audio Track / Voiceover'
                                    : categoryNormalized === 'video'
                                    ? 'Select Video Asset'
                                    : 'Select 3D Model'
                                : 'Media Library'}
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400 text-xs mt-0.5">
                            {isLocked
                                ? categoryNormalized === 'image'
                                    ? 'Choose an image from your library or upload a new photo.'
                                    : categoryNormalized === 'audio'
                                    ? 'Choose an audio track from your library or upload a sound file.'
                                    : 'Select a compatible asset from your library.'
                                : 'Select media files from your Quaris library or upload new files to attach to this AI stage.'}
                        </DialogDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shrink-0 cursor-pointer"
                    >
                        {isUploading ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {isLocked
                            ? categoryNormalized === 'image'
                                ? 'Upload Image'
                                : categoryNormalized === 'audio'
                                ? 'Upload Audio'
                                : 'Upload File'
                            : 'Upload Files'}
                    </Button>
                </DialogHeader>

                {/* Tabs & Search Filter */}
                <div className="px-5 py-3 border-b border-white/10 bg-neutral-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    {isLocked ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-purple-500/30 text-xs font-semibold text-purple-300">
                            {categoryNormalized === 'image' && <><ImageIcon className="w-3.5 h-3.5 text-purple-400" /> Images Filter Active</>}
                            {categoryNormalized === 'audio' && <><Music className="w-3.5 h-3.5 text-purple-400" /> Audio Tracks Only</>}
                            {categoryNormalized === 'video' && <><Video className="w-3.5 h-3.5 text-purple-400" /> Videos Only</>}
                            {categoryNormalized === 'model' && <><Box className="w-3.5 h-3.5 text-purple-400" /> 3D Models Only</>}
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList className="bg-neutral-950 border border-white/10 p-1 h-9">
                                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    All
                                </TabsTrigger>
                                <TabsTrigger value="images" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <ImageIcon className="w-3.5 h-3.5 mr-1" />
                                    Images
                                </TabsTrigger>
                                <TabsTrigger value="videos" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Video className="w-3.5 h-3.5 mr-1" />
                                    Videos
                                </TabsTrigger>
                                <TabsTrigger value="audio" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Music className="w-3.5 h-3.5 mr-1" />
                                    Audio
                                </TabsTrigger>
                                <TabsTrigger value="model" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Box className="w-3.5 h-3.5 mr-1" />
                                    3D Models
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by filename..."
                            className="bg-neutral-950 border-white/10 text-white pl-8 h-8 text-xs placeholder:text-neutral-500 focus-visible:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Media Grid Content */}
                <div className="flex-1 overflow-y-auto p-5 min-h-[320px] max-h-[50vh]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-neutral-400">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                            <p className="text-xs">Loading media assets...</p>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl p-6 text-center gap-3">
                            <UploadCloud className="w-10 h-10 text-neutral-600" />
                            <div>
                                <p className="text-sm font-medium text-neutral-300">No media found</p>
                                <p className="text-xs text-neutral-500 mt-1">Upload files from your computer to attach them to your project.</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Upload First Asset
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                            {filteredAssets.map((asset) => {
                                const isSelected = selectedItems.has(asset.url) || selectedUrls.includes(asset.url)

                                return (
                                    <div
                                        key={asset.path}
                                        onClick={() => toggleAsset(asset)}
                                        className={`relative group rounded-xl overflow-hidden border cursor-pointer transition-all flex flex-col bg-neutral-950 ${
                                            isSelected
                                                ? 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-950/20'
                                                : 'border-white/10 hover:border-purple-500/40 hover:bg-neutral-900/60'
                                        }`}
                                    >
                                        {/* Selection Indicator Checkbox */}
                                        <div className={`absolute top-2 right-2 z-20 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                                            isSelected
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-black/60 border border-white/30 text-transparent group-hover:text-white/40'
                                        }`}>
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>

                                        {/* Media Preview Thumbnail */}
                                        <div className="w-full aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                                            {asset.type === 'image' && (
                                                <img
                                                    src={asset.url}
                                                    alt={asset.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            )}

                                            {asset.type === 'video' && (
                                                <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                                                    <video
                                                        src={asset.url}
                                                        className="w-full h-full object-cover opacity-80"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <Video className="w-8 h-8 text-white/90" />
                                                    </div>
                                                </div>
                                            )}

                                            {asset.type === 'audio' && (
                                                <div className="w-full h-full bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-3 text-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleAudioPreview(e, asset.url)}
                                                        className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-md"
                                                    >
                                                        {playingAudioUrl === asset.url ? (
                                                            <Pause className="w-4 h-4" />
                                                        ) : (
                                                            <Play className="w-4 h-4 ml-0.5" />
                                                        )}
                                                    </button>
                                                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Audio File</span>
                                                </div>
                                            )}

                                            {asset.type === 'model' && (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-950/40 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-3 text-center gap-2">
                                                    <Box className="w-8 h-8 text-purple-400 animate-pulse" />
                                                    <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">3D GLB Model</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Media Metadata Info */}
                                        <div className="p-2 bg-neutral-950 border-t border-white/5 flex flex-col gap-0.5">
                                            <p className="text-[11px] font-medium text-neutral-200 truncate" title={`${formatMediaDisplayName(asset.name)} (${asset.name})`}>
                                                {formatMediaDisplayName(asset.name)}
                                            </p>
                                            <span className="text-[10px] text-neutral-500 uppercase font-mono">
                                                {asset.type}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between shrink-0">
                    <span className="text-xs text-neutral-400">
                        {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-xs text-neutral-400 hover:text-white"
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleConfirmSelection}
                            disabled={selectedItems.size === 0}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            Attach Selected ({selectedItems.size})
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
