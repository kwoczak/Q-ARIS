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
import { useTransition } from "react"

export function CreateStoryDialog() {
    const [isPending, startTransition] = useTransition()

    // Wrapper to handle form submit with transition state if needed,
    // though 'action' prop usually handles pending state with useFormStatus.
    // But here we use standard action which is simplest.
    // To get loading state on button, we can use useFormStatus inside a button component,
    // but for simplicity here we rely on the action.

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create New Story</Button>
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
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Brief overview..." />
                    </div>
                    <Button type="submit" className="w-full">
                        Create Story
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
