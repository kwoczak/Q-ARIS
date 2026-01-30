'use client'

import { useState } from 'react'
import { Voice, generateAndSaveTTS } from '@/lib/actions/elevenlabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TTSGenerator({ voices }: { voices: Voice[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [label, setLabel] = useState('')
    const [text, setText] = useState('')
    const [voiceId, setVoiceId] = useState<string>('')

    const handleGenerate = async () => {
        if (!label || !text || !voiceId) return

        try {
            setLoading(true)
            const selectedVoice = voices.find(v => v.voice_id === voiceId)
            const result = await generateAndSaveTTS({
                text,
                label,
                voice_id: voiceId,
                voice_name: selectedVoice?.name || 'Unknown'
            })

            if (!result.success) {
                alert(`Error: ${result.error}`)
                return
            }

            setLabel('')
            setText('')
            router.refresh() // Refresh server components to show new asset
        } catch (error) {
            console.error(error)
            alert("Unexpected error occurred. Check network connection.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-400" />
                Generate New Audio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Short Label (for identifying file)</Label>
                    <Input
                        placeholder="e.g. Intro Welcome"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="bg-neutral-800 border-neutral-700"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Voice</Label>
                    <Select value={voiceId} onValueChange={setVoiceId}>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700 text-white max-h-[300px]">
                            {voices.map(voice => (
                                <SelectItem key={voice.voice_id} value={voice.voice_id}>
                                    {voice.name} ({voice.category})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Text to Speech Content</Label>
                <Textarea
                    placeholder="Enter the text you want to generate..."
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-neutral-500 text-right">{text.length} characters</p>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleGenerate}
                    disabled={loading || !text || !label || !voiceId}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>Generate Audio</>
                    )}
                </Button>
            </div>
        </div>
    )
}
