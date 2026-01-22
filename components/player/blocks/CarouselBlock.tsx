'use client'

import { CarouselItem, BlockStyle } from "@/types/schema"
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselBlockProps {
    content: CarouselItem[]
    style: any
}

export function CarouselBlock({ content, style }: CarouselBlockProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const onInit = useCallback((emblaApi: any) => {
        setScrollSnaps(emblaApi.scrollSnapList())
    }, [])

    const onSelect = useCallback((emblaApi: any) => {
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        onInit(emblaApi)
        onSelect(emblaApi)
        emblaApi.on('reInit', onInit)
        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)
    }, [emblaApi, onInit, onSelect])

    if (!Array.isArray(content) || content.length === 0) return null

    return (
        <div style={style} className="w-full space-y-4">
            <div className="relative group overflow-hidden rounded-xl">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {content.map((item) => (
                            <div className="flex-[0_0_100%] min-w-0 relative px-1" key={item.id}>
                                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-xl">
                                    {item.url ? (
                                        <img
                                            src={item.url}
                                            className="w-full h-full object-cover"
                                            alt={item.caption || 'Carousel Image'}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                            No Image
                                        </div>
                                    )}
                                    {item.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 backdrop-blur-sm">
                                            <p className="text-white text-sm font-medium">{item.caption}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons (Desktop) */}
                <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    onClick={() => emblaApi?.scrollPrev()}
                    disabled={!emblaApi?.canScrollPrev()}
                >
                    <ChevronLeft className="w-4 h-4 text-black" />
                </button>
                <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    onClick={() => emblaApi?.scrollNext()}
                    disabled={!emblaApi?.canScrollNext()}
                >
                    <ChevronRight className="w-4 h-4 text-black" />
                </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${index === selectedIndex ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                        onClick={() => emblaApi?.scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    )
}
