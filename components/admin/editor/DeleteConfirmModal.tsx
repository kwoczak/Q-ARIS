'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Loader2, Smartphone, QrCode } from 'lucide-react'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title?: string
    description?: string
    itemTitle?: string
    itemSubtitle?: string
    itemBadge?: string
    itemThumbnail?: string | null
    confirmText?: string
    cancelText?: string
    isDeleting?: boolean
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Stage',
    description = 'Are you sure you want to delete this stage? This action cannot be undone and will permanently remove all its content, components, and triggers.',
    itemTitle,
    itemSubtitle,
    itemBadge,
    itemThumbnail,
    confirmText = 'Delete Stage',
    cancelText = 'Cancel',
    isDeleting = false
}: DeleteConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
            <DialogContent className="max-w-md w-full bg-neutral-950/95 border border-red-500/30 text-white shadow-2xl p-0 overflow-hidden sm:rounded-3xl z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Red ambient header glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/15 blur-3xl pointer-events-none" />

                <div className="p-6 space-y-4 relative z-10">
                    {/* Header Icon + Title */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-950/50">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-bold text-white tracking-tight">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-400 leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Stage Preview Box (if stage details provided) */}
                    {(itemTitle || itemThumbnail !== undefined) && (
                        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center gap-3.5 shadow-inner">
                            <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                {itemThumbnail ? (
                                    <img
                                        src={itemThumbnail}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Smartphone className="w-5 h-5 text-neutral-500" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-white truncate">
                                        {itemTitle || 'Untitled Stage'}
                                    </h4>
                                    {itemBadge && (
                                        <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-white/10 text-[10px] font-mono text-neutral-300 shrink-0 flex items-center gap-1">
                                            <QrCode className="w-2.5 h-2.5 text-neutral-400" />
                                            {itemBadge}
                                        </span>
                                    )}
                                </div>
                                {itemSubtitle && (
                                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate font-mono">
                                        {itemSubtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <DialogFooter className="p-4 border-t border-white/10 bg-neutral-900/60 flex flex-row items-center justify-end gap-2.5 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isDeleting}
                        onClick={onClose}
                        className="text-xs text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl h-9 px-4 cursor-pointer"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl h-9 px-4 shadow-lg shadow-red-950/60 transition-all cursor-pointer"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                {confirmText}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
