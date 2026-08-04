import { QrCode } from 'lucide-react'

export default function QRCodePlaceholder() {
    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                    QR Codes
                </h1>
                <p className="text-sm text-neutral-400">Manage, export, and track scans for all your physical QR triggers.</p>
            </div>
            
            <div className="h-96 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 bg-neutral-900/20 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 shadow-inner border border-white/5">
                    <QrCode className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Coming Soon</h3>
                <p className="text-neutral-400 max-w-md">
                    The centralized QR Code management dashboard is under construction. You can still generate QR codes from within the individual Stage Editors.
                </p>
            </div>
        </div>
    )
}
