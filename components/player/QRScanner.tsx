'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export function QRScanner({ onClose }: { onClose: () => void }) {
    const [error, setError] = useState<string | null>(null)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const router = useRouter()
    const mounted = useRef(false)

    useEffect(() => {
        mounted.current = true
        let scanner: Html5Qrcode | null = null

        const startScanner = async () => {
            try {
                scanner = new Html5Qrcode("reader")
                scannerRef.current = scanner

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // Success callback
                        console.log("Scanned:", decodedText)

                        // Stop scanning
                        scanner?.stop().then(() => {
                            // Check if it's our app URL
                            if (decodedText.includes('/play/')) {
                                // Extract the relative path if possible, or just push full URL
                                // router.push handles internal URLs fine usually, but let's be safe
                                window.location.href = decodedText
                            } else {
                                alert("Invalid QR Code for this app")
                                // Resume scanning?
                            }
                        }).catch(err => console.error(err))
                    },
                    (errorMessage) => {
                        // Ignore parse errors, they spam console
                    }
                )
            } catch (err) {
                console.error("Error starting scanner", err)
                if (mounted.current) setError("Could not start camera. Please ensure permissions are granted.")
            }
        }

        // Small delay to ensure DOM is ready
        setTimeout(startScanner, 100)

        return () => {
            mounted.current = false
            try {
                if (scanner && scanner.isScanning) {
                    scanner.stop().catch(e => console.warn("Failed to stop scanner", e))
                }
            } catch (e) {
                console.warn("Error during scanner cleanup", e)
            }
        }
    }, [router])

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
                onClick={onClose}
            >
                <X className="w-8 h-8" />
            </Button>

            <div className="w-full max-w-md px-4 relative">
                <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border-2 border-white/20"></div>

                <p className="text-white text-center mt-8 text-lg font-medium">
                    Scan next QR Code
                </p>
                <p className="text-neutral-400 text-center text-sm mt-2">
                    Point your camera at a story marker
                </p>

                {error && (
                    <div className="text-red-500 text-center mt-4 bg-red-900/20 p-4 rounded-md">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
