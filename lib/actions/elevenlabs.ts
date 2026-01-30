'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
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
    console.log("Fetching voices...")
    if (!ELEVENLABS_API_KEY) {
        console.warn("getVoices: No API Key")
        return []
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error("Failed to fetch voices:", response.status, await response.text())
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

export type ActionResponse<T> = {
    success: boolean
    error?: string
    data?: T
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
}): Promise<ActionResponse<any>> {
    console.log("Generating TTS...")

    try {
        // 1. Verify Custom Session
        const session = await getSession()
        if (!session || !session.userId) {
            console.error("Auth error: No custom session found")
            return { success: false, error: "Unauthorized: Please log in." }
        }
        const userId = session.userId

        if (!ELEVENLABS_API_KEY) {
            console.error("Missing ELEVENLABS_API_KEY")
            return { success: false, error: "Server Configuration Error: Missing API Key." }
        }

        // 2. Output generation logs
        console.log(`User ${userId} generating audio...`)

        // 3. Authenticate with Supabase (Admin Client to bypass RLS since we have custom auth)
        const supabase = await createAdminClient()

        // 4. Generate Audio
        console.log("Calling ElevenLabs API...")
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Eleven Labs Error:", response.status, errorText)
            return { success: false, error: `Eleven Labs API Error (${response.status}): ${errorText}` }
        }

        const audioBuffer = await response.arrayBuffer()

        // 5. Upload to Supabase Storage
        const fileName = `tts_${userId}_${Date.now()}.mp3`
        const filePath = `tts/${userId}/${fileName}`
        console.log("Uploading to storage:", filePath)

        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: false
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return { success: false, error: `Storage Upload Failed: ${uploadError.message}` }
        }

        // 6. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath)

        // 7. Save Metadata to DB
        console.log("Saving metadata to DB...")
        const { data: asset, error: dbError } = await supabase
            .from('tts_assets')
            .insert({
                curator_id: userId, // Use session userId
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
            // Delete file if DB insert fails to maintain consistency
            await supabase.storage.from('assets').remove([filePath])
            console.error("DB Error:", dbError)
            return { success: false, error: `Database Save Failed: ${dbError.message}` }
        }

        revalidatePath('/curator/tts')
        return { success: true, data: asset }

    } catch (e: any) {
        console.error("Unexpected error in generateAndSaveTTS:", e)
        return { success: false, error: `Unexpected Server Error: ${e.message}` }
    }
}

export async function deleteTTSAsset(id: string, filePath: string) {
    const session = await getSession()
    if (!session || !session.userId) throw new Error("Unauthorized")

    const supabase = await createAdminClient()

    // Explicitly check ownership since we are using Admin Client
    const { error: dbError } = await supabase
        .from('tts_assets')
        .delete()
        .eq('id', id)
        .eq('curator_id', session.userId) // Vital Security Check

    if (dbError) throw dbError

    await supabase.storage
        .from('assets')
        .remove([filePath])

    revalidatePath('/curator/tts')
}

export async function getTTSAssets(): Promise<TTSAsset[]> {
    console.log("Fetching TTS assets...")
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            console.warn("getTTSAssets: No custom session")
            return []
        }

        const supabase = await createAdminClient()

        const { data, error } = await supabase
            .from('tts_assets')
            .select('*')
            .eq('curator_id', session.userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("getTTSAssets: DB Error", error)
            return []
        }

        return (data as TTSAsset[]) || []
    } catch (error) {
        console.error("getTTSAssets: Unexpected error", error)
        return []
    }
}
