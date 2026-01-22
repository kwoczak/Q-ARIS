import { createClient } from "@/lib/supabase/client"

export async function uploadAsset(file: File, folder: string = 'general'): Promise<string | null> {
    const supabase = createClient()

    // Clean filename and add timestamp to avoid collisions
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

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
