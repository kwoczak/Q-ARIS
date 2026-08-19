'use client'

import { Mic, Box, Eye } from "lucide-react"
import { MediaAsset } from "@/lib/actions/media"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { formatMediaDisplayName } from "@/components/admin/editor/ai/AIMediaLibraryModal"

export function MediaCard({ asset }: { asset: MediaAsset }) {
    const ModelViewer = 'model-viewer' as any;
    const displayName = formatMediaDisplayName(asset.name)
    
    return (
        <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden group flex flex-col">
            <div className="aspect-square bg-black flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {asset.type === 'image' && (
                    <img src={asset.url} alt={displayName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                )}
                {asset.type === 'video' && (
                    <video 
                        src={asset.url} 
                        className="w-full h-full object-cover" 
                        muted 
                        loop 
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})} 
                        onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }} 
                    />
                )}
                {asset.type === 'audio' && (
                    <div className="flex flex-col w-full h-full items-center justify-center text-purple-400 bg-neutral-900/50 p-4">
                        <Mic className="w-10 h-10 mb-4 opacity-50" />
                        <audio src={asset.url} controls className="w-full h-10" />
                    </div>
                )}
                {asset.type === 'model' && (
                    <div className="w-full h-full relative group/model">
                        <ModelViewer 
                            src={asset.url} 
                            auto-rotate 
                            camera-controls 
                            className="w-full h-full"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-md text-white/80 pointer-events-none">
                            <Box className="w-4 h-4" />
                        </div>
                    </div>
                )}
                {asset.type === 'other' && (
                    <div className="text-neutral-600 font-medium">Unknown File</div>
                )}
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
                <p className="text-sm text-neutral-300 truncate mb-1" title={`${displayName} (${asset.name})`}>{displayName}</p>
                <div className="flex justify-between items-center mt-auto pt-1">
                    <p className="text-xs text-neutral-500 uppercase">{asset.type}</p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                                <Eye className="w-3 h-3" /> View
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-neutral-950 border-white/10 text-white p-6 shadow-2xl">
                            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                                <p className="font-semibold text-lg mb-4 text-center text-neutral-200">{displayName}</p>
                                
                                {asset.type === 'image' && (
                                    <img src={asset.url} alt={asset.name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
                                )}
                                {asset.type === 'video' && (
                                    <video src={asset.url} controls autoPlay className="max-w-full max-h-[70vh] rounded-lg shadow-lg" />
                                )}
                                {asset.type === 'audio' && (
                                    <div className="flex flex-col items-center w-full max-w-md p-8 bg-neutral-900 rounded-2xl border border-white/5">
                                        <Mic className="w-16 h-16 text-purple-500 mb-6" />
                                        <audio src={asset.url} controls autoPlay className="w-full" />
                                    </div>
                                )}
                                {asset.type === 'model' && (
                                    <div className="w-full h-[70vh] bg-neutral-900 rounded-lg overflow-hidden relative">
                                        <ModelViewer 
                                            src={asset.url} 
                                            auto-rotate 
                                            camera-controls 
                                            className="w-full h-full"
                                        />
                                    </div>
                                )}
                                {asset.type === 'other' && (
                                    <p className="text-neutral-500">Preview not available for this file type.</p>
                                )}
                                
                                <a href={asset.url} target="_blank" rel="noreferrer" className="mt-6 text-sm text-purple-400 hover:text-purple-300 underline underline-offset-4">
                                    Open original file
                                </a>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
