'use client'

import { ComparisonContent, BlockStyle } from "@/types/schema"
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'

interface ComparisonBlockProps {
    content: ComparisonContent
    style: any
}

export function ComparisonBlock({ content, style }: ComparisonBlockProps) {
    if (!content.imageBefore || !content.imageAfter) return null

    return (
        <div style={style} className="w-full relative group">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
                <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={content.imageBefore} alt="Before" />}
                    itemTwo={<ReactCompareSliderImage src={content.imageAfter} alt="After" />}
                    style={{ height: '400px', width: '100%' }} // Fixed height or responsive? 
                // Let's make it responsive but min height
                />

                {/* Labels Overlay */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {content.labelBefore || 'Before'}
                    </span>
                </div>
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {content.labelAfter || 'After'}
                    </span>
                </div>
            </div>
            <div className="mt-2 text-center text-xs text-neutral-500 italic">
                Drag slider to compare
            </div>
        </div>
    )
}
