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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useTransition } from "react"
import { updateStoryLanguages } from "@/app/actions/story"
import { Story, Language } from "@/types/schema"
import { Loader2, Settings, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

const AVAILABLE_LANGUAGES: { code: Language, label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'pl', label: 'Polish' },
    { code: 'de', label: 'German' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'it', label: 'Italian' },
    { code: 'cs', label: 'Czech' },
    { code: 'ua', label: 'Ukrainian' },
]

export function LanguageManager({ story }: { story: Story }) {
    const [isOpen, setIsOpen] = useState(false)
    const [supportedLanguages, setSupportedLanguages] = useState<string[]>(story.supported_languages || ['en'])
    const [defaultLanguage, setDefaultLanguage] = useState<string>(story.default_language || 'en')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateStoryLanguages(story.id, supportedLanguages, defaultLanguage)
                setIsOpen(false)
                router.refresh()
            } catch (error) {
                console.error("Failed to update languages", error)
                alert("Failed to update languages")
            }
        })
    }

    const toggleLanguage = (code: string) => {
        setSupportedLanguages(prev => {
            if (prev.includes(code)) {
                // Prevent removing default language
                if (code === defaultLanguage) {
                    alert("Cannot remove the default language. Change default language first.")
                    return prev
                }
                return prev.filter(c => c !== code)
            } else {
                return [...prev, code]
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="bg-transparent text-white border-neutral-700 hover:bg-neutral-800 hover:text-white">
                    <Globe className="w-4 h-4 mr-2" />
                    Languages
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Language Settings</DialogTitle>
                    <DialogDescription>
                        Manage supported languages for this tour.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Supported Languages */}
                    <div className="space-y-3">
                        <Label>Supported Languages</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_LANGUAGES.map(lang => (
                                <div key={lang.code} className="flex items-center space-x-2 border rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    <Checkbox
                                        id={`lang-${lang.code}`}
                                        checked={supportedLanguages.includes(lang.code)}
                                        onCheckedChange={() => toggleLanguage(lang.code)}
                                    />
                                    <label
                                        htmlFor={`lang-${lang.code}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                    >
                                        {lang.label} <span className="text-xs text-neutral-400">({lang.code})</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Default Language */}
                    <div className="space-y-2">
                        <Label>Default Language</Label>
                        <Select
                            value={defaultLanguage}
                            onValueChange={(val) => {
                                setDefaultLanguage(val)
                                // Auto-add to supported if not present
                                if (!supportedLanguages.includes(val)) {
                                    setSupportedLanguages(prev => [...prev, val])
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_LANGUAGES.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.label} ({lang.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-neutral-500">
                            This language will be used if the user's preferred language is not supported.
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={isPending} className="w-full">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
