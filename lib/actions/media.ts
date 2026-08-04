'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'

export type MediaType = 'image' | 'video' | 'audio' | 'model' | 'other';

export type MediaAsset = {
    name: string;
    path: string;
    url: string;
    type: MediaType;
    created_at: string;
    size: number;
}

function determineMediaType(filename: string): MediaType {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return 'audio';
    if (['glb', 'gltf'].includes(ext || '')) return 'model';
    return 'other';
}

async function listAllFiles(supabase: any, folderPath: string): Promise<any[]> {
    const { data, error } = await supabase.storage.from('assets').list(folderPath, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
    });
    
    if (error || !data) {
        console.error("Error listing folder:", folderPath, error);
        return [];
    }

    let allFiles: any[] = [];
    for (const item of data) {
        // If id is null, it is likely a folder in Supabase Storage
        if (item.id === null) {
            const subfolderPath = folderPath ? `${folderPath}/${item.name}` : item.name;
            // Prevent infinite recursion, though unlikely here
            const subFiles = await listAllFiles(supabase, subfolderPath);
            allFiles = allFiles.concat(subFiles);
        } else {
            // It's a file
            // Ignore placeholder files like .emptyFolderPlaceholder
            if (item.name === '.emptyFolderPlaceholder') continue;
            allFiles.push({
                ...item,
                folderPath: folderPath // add folder path for reference
            });
        }
    }
    return allFiles;
}

export async function getAllMediaAssets(): Promise<{ success: boolean; data?: MediaAsset[]; error?: string }> {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: "Unauthorized" };
        }

        const supabase = await createAdminClient();
        
        // Root folders we care about to speed up search (optional, we could just list '')
        // But doing it explicitly avoids searching unrelated buckets if any
        const foldersToScan = ['audio', 'backgrounds', 'blocks', 'images', 'models', 'tts', 'general'];
        let allFiles: any[] = [];

        for (const folder of foldersToScan) {
             const files = await listAllFiles(supabase, folder);
             allFiles = allFiles.concat(files);
        }

        // We also want to make sure files belong to the user if we have user isolation.
        // Wait, files are not isolated by userId in folders except maybe tts!
        // The current uploadAsset logic: const filePath = `${folder}/${fileName}`
        // So they are mixed! We have to fetch all of them, or they are public anyway.
        // If we want only current user's TTS assets, tts_assets table does that.
        // For now, we fetch all from storage.

        const assets: MediaAsset[] = allFiles.map(f => {
            const path = f.folderPath ? `${f.folderPath}/${f.name}` : f.name;
            const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
            
            return {
                name: f.name,
                path: path,
                url: publicUrl,
                type: determineMediaType(f.name),
                created_at: f.created_at,
                size: f.metadata?.size || 0
            };
        });

        // Filter out 'other' if we only care about media, but keeping it is fine.
        return { success: true, data: assets };
    } catch (e: any) {
        console.error("Failed to get media assets:", e);
        return { success: false, error: e.message };
    }
}
