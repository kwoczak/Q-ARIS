'use client'

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function TypewriterEffect({ text, style, delay }: { text: string, style: any, delay?: string }) {
    // If text is long, splitting by char is performance heavy. Splitting by words is better.
    const words = text.split(" ")
    const d = delay ? parseFloat(delay) : 0

    return (
        <div style={style} className="w-full flex flex-wrap gap-x-1.5 gap-y-1">
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.05,
                        delay: d + (i * 0.05), // faster word reveal
                        ease: "linear"
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    )
}
