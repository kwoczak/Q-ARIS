'use client'

import { ChangeEvent, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { uploadAsset } from "@/lib/supabase/storage"

interface FileUploadProps {
    label: string
    accept: string
    folder: string
    onUploadComplete: (url: string) => void
    currentUrl?: string
    className?: string
}

export function FileUpload({ label, accept, folder, onUploadComplete, currentUrl, className }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(true)
            const url = await uploadAsset(file, folder)
            if (url) {
                onUploadComplete(url)
            }
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed. Check console for details.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    disabled={isUploading}
                    className="relative cursor-pointer w-full justify-start text-neutral-500 hover:text-neutral-900 border-dashed border-2"
                    onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "Uploading..." : `Upload ${label}`}
                </Button>
                <input
                    id={`file-upload-${label}`}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    )
}
