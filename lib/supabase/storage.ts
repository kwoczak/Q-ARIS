import { createClient } from "@/lib/supabase/client"
import { getClientUserId } from "@/lib/actions/media"

export async function uploadAsset(file: File, folder: string = 'general'): Promise<string | null> {
    const supabase = createClient()
    const userId = await getClientUserId()
    
    if (!userId) {
        throw new Error("Unauthorized upload attempt")
    }

    // Preserve original filename, sanitize special characters, and append short unique hash to prevent collisions
    const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    const cleanBaseName = originalNameWithoutExt
        .replace(/[^a-zA-Z0-9_\-\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .substring(0, 60) || 'asset'

    const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase()
    const shortHash = Math.random().toString(36).substring(2, 7)
    const fileName = `${cleanBaseName}_${shortHash}.${fileExt}`
    const filePath = `${folder}/${userId}/${fileName}`

    const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

    if (error) {
        console.error('Error uploading file:', error)
        throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

    return publicUrl
}
