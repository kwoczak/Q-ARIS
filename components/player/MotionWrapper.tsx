'use client'

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { BlockStyle } from "@/types/schema"

interface MotionWrapperProps {
    children: ReactNode
    animation?: BlockStyle['animation']
    delay?: string
    style?: any
}

export function MotionWrapper({ children, animation, delay, style }: MotionWrapperProps) {
    if (!animation || animation === 'none') {
        return <div style={style} className="w-full">{children}</div>
    }

    const d = delay ? parseFloat(delay) : 0

    let initial = {}
    let whileInView = {}
    let transition = { duration: 0.6, delay: d, ease: "easeOut" }

    switch (animation) {
        case 'fade-in':
            initial = { opacity: 0 }
            whileInView = { opacity: 1 }
            break
        case 'slide-up':
            initial = { opacity: 0, y: 30 }
            whileInView = { opacity: 1, y: 0 }
            break
        case 'scale-up':
            initial = { opacity: 0, scale: 0.95 }
            whileInView = { opacity: 1, scale: 1 }
            break
        case 'typewriter':
            // Special case, maybe handled by child or simpler fade for wrapper
            initial = { opacity: 0, x: -10 }
            whileInView = { opacity: 1, x: 0 }
            break
    }

    return (
        <motion.div
            style={style}
            initial={initial}
            whileInView={whileInView}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: d, ease: "easeOut" } as any}
            className="w-full"
        >
            {children}
        </motion.div>
    )
}
