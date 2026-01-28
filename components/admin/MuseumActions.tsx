'use client'

import { useState, useTransition } from 'react'

import { Button } from "@/components/ui/button"
import { deleteMuseumAction } from "@/app/actions/admin"

export function MuseumActions({ museumId, suspended }: { museumId: string, suspended: boolean }) {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => {
                    if (confirm('Are you sure you want to delete this museum account? This action cannot be undone.')) {
                        startTransition(async () => {
                            const result = await deleteMuseumAction(museumId);
                            if (result?.error) {
                                alert(`Failed to delete: ${result.error}`);
                            }
                        });
                    }
                }}
            >
                {isPending ? 'Deleting...' : 'Delete'}
            </Button>
        </div>
    )
}
