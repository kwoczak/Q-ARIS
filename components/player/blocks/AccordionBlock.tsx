'use client'

import { AccordionItem, BlockStyle } from "@/types/schema"
import {
    Accordion,
    AccordionContent,
    AccordionItem as RadixAccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface AccordionBlockProps {
    content: AccordionItem[]
    style: any
}

export function AccordionBlock({ content, style }: AccordionBlockProps) {
    if (!Array.isArray(content) || content.length === 0) return null

    return (
        <div style={style} className="w-full">
            <Accordion type="single" collapsible className="w-full space-y-2">
                {content.map((item) => (
                    <RadixAccordionItem key={item.id} value={item.id} className="border rounded-lg bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm px-4">
                        <AccordionTrigger className="hover:no-underline font-medium text-left">
                            {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed pb-4">
                            {item.content}
                        </AccordionContent>
                    </RadixAccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
