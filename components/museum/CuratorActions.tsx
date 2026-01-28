'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteCuratorAction } from "@/app/actions/museum"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function CuratorActions({ curatorId }: { curatorId: string }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter() // Though action revalidates, we might want manual refresh UI feedback if used

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this curator?')) return;

        setIsPending(true);
        try {
            await deleteCuratorAction(curatorId);
        } catch (e) {
            alert('Failed to delete');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isPending}
            title="Delete Curator"
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}
