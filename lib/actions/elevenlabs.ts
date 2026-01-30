'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TTSAsset = {
    id: string
    label: string
    text_content: string
    voice_name: string
    public_url: string
    file_path: string
    created_at: string
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

if (!ELEVENLABS_API_KEY) {
    console.warn("Missing ELEVENLABS_API_KEY environment variable")
}

export type Voice = {
    voice_id: string
    name: string
    category: string
    preview_url?: string
}

export async function getVoices(): Promise<Voice[]> {
    if (!ELEVENLABS_API_KEY) return []

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error("Failed to fetch voices", await response.text())
            // Fallback to empty or default if error
            return []
        }

        const data = await response.json()
        return data.voices.map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            category: v.category,
            preview_url: v.preview_url
        }))
    } catch (error) {
        console.error("Error getting voices:", error)
        return []
    }
}

export async function generateAndSaveTTS({
    text,
    voice_id,
    voice_name,
    label
}: {
    text: string
    voice_id: string
    voice_name: string
    label: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    if (!ELEVENLABS_API_KEY) {
        throw new Error("Eleven Labs API Key not configured")
    }

    // 1. Generate Audio
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2", // Best for general use including Polish
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error("Eleven Labs Error:", errorText)
        throw new Error(`Generation failed: ${response.statusText}`)
    }

    const audioBuffer = await response.arrayBuffer()

    // 2. Upload to Supabase Storage
    const fileName = `tts_${user.id}_${Date.now()}.mp3`
    const filePath = `tts/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: false
        })

    if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error("Failed to upload audio file")
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

    // 4. Save Metadata to DB
    const { data: asset, error: dbError } = await supabase
        .from('tts_assets')
        .insert({
            curator_id: user.id,
            label,
            text_content: text,
            voice_name,
            voice_id,
            file_path: filePath,
            public_url: publicUrl
        })
        .select()
        .single()

    if (dbError) {
        console.error("DB Error:", dbError)
        throw new Error("Failed to save asset metadata")
    }

    revalidatePath('/curator/tts')
    return asset
}

export async function deleteTTSAsset(id: string, filePath: string) {
    const supabase = await createClient()

    // Check permissions (RLS will handle DB, but we need to check for Storage)
    // Actually, RLS on DELETE tts_assets ensures owner. 
    // We should delete from DB first or verify ownership.

    const { error: dbError } = await supabase
        .from('tts_assets')
        .delete()
        .eq('id', id)

    if (dbError) throw dbError

    // Clean up file
    await supabase.storage
        .from('assets')
        .remove([filePath])

    revalidatePath('/curator/tts')
}

export async function getTTSAssets(): Promise<TTSAsset[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('tts_assets')
        .select('*')
        .eq('curator_id', user.id)
        .order('created_at', { ascending: false })

    return (data as TTSAsset[]) || []
}
