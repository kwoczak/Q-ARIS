import { getVoices, getTTSAssets } from '@/lib/actions/elevenlabs'
import { TTSGenerator } from '@/components/curator/tts/TTSGenerator'
import { TTSBrowser } from '@/components/curator/tts/TTSBrowser'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'


export default async function TTSPage() {
    const voices = await getVoices()
    const assets = await getTTSAssets()

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div>
                <BackButton />
                <h1 className="text-3xl font-bold mb-2">Text to Speech Studio</h1>
                <p className="text-neutral-400">
                    Generate high-quality AI voiceovers using Eleven Labs.
                    Created assets are saved to your library and can be used in your tours.
                </p>
            </div>

            <TTSGenerator voices={voices} />

            <div className="h-px bg-white/10 my-8" />

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Your Audio Library</h2>
                <TTSBrowser assets={assets} />
            </div>
        </div>
    )
}
