'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createStory } from "@/app/actions/story"


import { useFormStatus } from "react-dom"

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating..." : "Create Story"}
        </Button>
    )
}

export function CreateStoryDialog({ customTrigger }: { customTrigger?: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {customTrigger || <Button>Create New Story</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new story</DialogTitle>
                    <DialogDescription>
                        Start a new storytelling journey.
                    </DialogDescription>
                </DialogHeader>
                <form action={createStory} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="e.g. Ancient Armor Tour" required />
                    </div>

                    <SubmitButton />
                </form>
            </DialogContent>
        </Dialog>
    )
}
