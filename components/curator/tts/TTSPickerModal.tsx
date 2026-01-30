'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TTSBrowser } from './TTSBrowser'
import { TTSAsset, getTTSAssets } from '@/lib/actions/elevenlabs'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TTSPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
}

export function TTSPickerModal({ isOpen, onClose, onSelect }: TTSPickerModalProps) {
    const [assets, setAssets] = useState<TTSAsset[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            getTTSAssets()
                .then(setAssets)
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] bg-neutral-950 border-neutral-800 text-white overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select from Audio Library</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-[300px] p-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                        </div>
                    ) : (
                        <TTSBrowser
                            assets={assets}
                            onSelect={(asset) => {
                                onSelect(asset.public_url)
                                onClose()
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
