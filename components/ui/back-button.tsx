'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="sm"
            className="pl-0 hover:bg-transparent text-neutral-400 hover:text-white mb-4"
            onClick={() => router.back()}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
    )
}
