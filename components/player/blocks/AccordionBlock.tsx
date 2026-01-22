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
        <div style={{ ...style, fontFamily: style.fontFamily }} className="w-full">
            <Accordion type="single" collapsible className="w-full space-y-2">
                {content.map((item) => (
                    <RadixAccordionItem
                        key={item.id}
                        value={item.id}
                        className="border rounded-lg px-4"
                        style={{
                            backgroundColor: style.backgroundColor || 'rgba(255,255,255,0.5)',
                            borderColor: 'transparent',
                            // We can use backdrop-filter if opacity < 1
                        }}
                    >
                        <AccordionTrigger
                            className="hover:no-underline font-medium text-left"
                            style={{
                                color: style.color || 'inherit',
                                fontSize: style.fontSize || '1rem'
                            }}
                        >
                            {item.title}
                        </AccordionTrigger>
                        <AccordionContent
                            className="whitespace-pre-wrap leading-relaxed pb-4"
                            style={{
                                color: style.color || 'inherit',
                                fontSize: '0.9em', // Slightly smaller than title? Or same?
                                opacity: 0.9
                            }}
                        >
                            {item.content}
                        </AccordionContent>
                    </RadixAccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
