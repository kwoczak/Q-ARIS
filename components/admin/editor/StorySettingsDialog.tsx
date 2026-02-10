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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Story } from "@/types/schema"

interface StorySettingsDialogProps {
    story: Story
    onUpdate: (updatedStory: Story) => void
}

export function StorySettingsDialog({ story, onUpdate }: StorySettingsDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isGamified, setIsGamified] = useState(story.is_gamified ?? true)
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    const handleSave = async () => {
        setIsSaving(true)
        const { error } = await supabase
            .from('stories')
            .update({ is_gamified: isGamified })
            .eq('id', story.id)

        setIsSaving(false)

        if (error) {
            console.error("Failed to update story settings:", error)
            // You might want to show a toast here
        } else {
            onUpdate({ ...story, is_gamified: isGamified })
            setIsOpen(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="bg-transparent text-white border-neutral-700 hover:bg-neutral-800 hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-neutral-900 text-white border-neutral-800">
                <DialogHeader>
                    <DialogTitle>Story Settings</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Configure global settings for this tour.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="gamification" className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Gamification
                            </Label>
                            <span className="text-xs text-neutral-400">
                                Enable points, scores, and leaderboards for this tour.
                            </span>
                        </div>
                        <Switch
                            id="gamification"
                            checked={isGamified}
                            onCheckedChange={setIsGamified}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
