import { getAllMediaAssets } from '@/lib/actions/media'
import { getVoices, getTTSAssets } from '@/lib/actions/elevenlabs'
import { TTSGenerator } from '@/components/curator/tts/TTSGenerator'
import { TTSBrowser } from '@/components/curator/tts/TTSBrowser'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, FileVideo, Mic, LayoutGrid } from "lucide-react"
import { MediaCard } from '@/components/curator/media/MediaCard'

export default async function MediaLibraryPage() {
    const { data: assets, error } = await getAllMediaAssets()
    const voices = await getVoices()
    const ttsAssets = await getTTSAssets()
    
    // Safety fallback
    const allAssets = assets || [];
    
    const images = allAssets.filter(a => a.type === 'image');
    const videos = allAssets.filter(a => a.type === 'video');
    const audio = allAssets.filter(a => a.type === 'audio');

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Media Library</h1>
                <p className="text-neutral-400">
                    Manage all your uploaded graphics, videos, and generated audio in one place.
                </p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-neutral-900 border border-white/10 mb-8 p-1 h-auto flex flex-wrap max-w-2xl">
                    <TabsTrigger value="all" className="flex-1 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        All Media
                    </TabsTrigger>
                    <TabsTrigger value="images" className="flex-1 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Images
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="flex-1 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Videos
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex-1 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <Mic className="w-4 h-4 mr-2" />
                        Audio & TTS
                    </TabsTrigger>
                </TabsList>

                {/* ALL TAB */}
                <TabsContent value="all" className="mt-0 outline-none">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allAssets.length === 0 && (
                            <div className="col-span-full text-center py-12 text-neutral-500">No media found.</div>
                        )}
                        {allAssets.map(asset => (
                            <MediaCard key={asset.path} asset={asset} />
                        ))}
                    </div>
                </TabsContent>

                {/* IMAGES TAB */}
                <TabsContent value="images" className="mt-0 outline-none">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.length === 0 && (
                            <div className="col-span-full text-center py-12 text-neutral-500">No images found.</div>
                        )}
                        {images.map(asset => (
                            <MediaCard key={asset.path} asset={asset} />
                        ))}
                    </div>
                </TabsContent>

                {/* VIDEOS TAB */}
                <TabsContent value="videos" className="mt-0 outline-none">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {videos.length === 0 && (
                            <div className="col-span-full text-center py-12 text-neutral-500">No videos found.</div>
                        )}
                        {videos.map(asset => (
                            <MediaCard key={asset.path} asset={asset} />
                        ))}
                    </div>
                </TabsContent>

                {/* AUDIO TAB */}
                <TabsContent value="audio" className="mt-0 outline-none space-y-8">
                    <div className="bg-neutral-900 border border-white/5 rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Generate New Audio</h2>
                        <TTSGenerator voices={voices} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Your Audio Library</h2>
                        <TTSBrowser assets={ttsAssets} />
                    </div>
                    
                    {audio.length > 0 && (
                        <div className="space-y-4 mt-8 pt-8 border-t border-white/10">
                            <h2 className="text-xl font-bold">Other Audio Files</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {audio.map(asset => (
                                    <MediaCard key={asset.path} asset={asset} />
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}


