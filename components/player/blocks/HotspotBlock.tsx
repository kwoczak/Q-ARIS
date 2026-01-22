'use client'

import { HotspotContent, BlockStyle } from "@/types/schema"
import { useState } from "react"
import { MapPin, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface HotspotBlockProps {
    content: HotspotContent
    style: any
}

export function HotspotBlock({ content, style }: HotspotBlockProps) {
    const [activeSpotId, setActiveSpotId] = useState<string | null>(null)

    if (!content.image) return null

    const activeSpot = content.hotspots.find(h => h.id === activeSpotId)

    return (
        <div style={style} className="w-full relative select-none">
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img
                    src={content.image}
                    alt="Interactive"
                    className="w-full h-auto block"
                    onClick={() => setActiveSpotId(null)}
                />

                {content.hotspots.map(spot => (
                    <button
                        key={spot.id}
                        onClick={(e) => {
                            e.stopPropagation()
                            setActiveSpotId(activeSpotId === spot.id ? null : spot.id)
                        }}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center transition-transform hover:scale-110 z-10 ${activeSpotId === spot.id
                            ? "bg-blue-600 text-white shadow-xl scale-110"
                            : "bg-white/90 text-blue-600 shadow-md animate-pulse"
                            }`}
                        style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                    >
                        {activeSpotId === spot.id ? <X className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </button>
                ))}

                {/* Info Popover / Modal Overlay */}
                <AnimatePresence>
                    {activeSpot && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-4 left-4 right-4 p-4 rounded-xl shadow-2xl border border-white/20 z-20"
                            style={{
                                backgroundColor: style.backgroundColor || 'rgba(255, 255, 255, 0.95)',
                                color: style.color || 'inherit',
                                fontFamily: style.fontFamily
                            }}
                        >
                            <h4 className="font-bold mb-1" style={{ fontSize: style.fontSize || '0.875rem' }}>{activeSpot.label}</h4>
                            <p className="leading-relaxed opacity-90 text-sm">
                                {activeSpot.text}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
