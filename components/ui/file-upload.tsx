'use client'

import { ChangeEvent, useState, useId } from 'react'
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
    onFileSelect?: (file: File) => void // New optional prop
}

export function FileUpload({ label, accept, folder, onUploadComplete, currentUrl, className, onFileSelect }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const uniqueId = useId()

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // If interceptor is provided, use it and stop
        if (onFileSelect) {
            onFileSelect(file)
            return
        }

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
            {currentUrl && accept.includes('image') && (
                <div className="mb-3 relative w-full h-40 bg-neutral-900/50 rounded-md overflow-hidden border border-white/10 flex items-center justify-center">
                    <img
                        src={currentUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    disabled={isUploading}
                    type="button" // Prevent form submission
                    className="relative cursor-pointer w-full justify-start text-neutral-500 hover:text-neutral-900 border-dashed border-2"
                    onClick={() => document.getElementById(uniqueId)?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "Uploading..." : `Upload ${label}`}
                </Button>
                <input
                    id={uniqueId}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    )
}
