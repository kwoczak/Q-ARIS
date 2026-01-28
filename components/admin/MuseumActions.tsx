'use client'

import { Button } from "@/components/ui/button"
import { deleteMuseumAction } from "@/app/actions/admin"

export function MuseumActions({ museumId, suspended }: { museumId: string, suspended: boolean }) {
    return (
        <div className="flex items-center gap-2">

            <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                    if (confirm('Are you sure you want to delete this museum account?')) {
                        deleteMuseumAction(museumId)
                    }
                }}
            >
                Delete
            </Button>
        </div>
    )
}
