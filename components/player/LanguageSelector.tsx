'use client'

import { useState, useEffect } from 'react'
import { Story, Language } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Globe, Check } from 'lucide-react'

interface LanguageSelectorProps {
    story: Story
    currentLanguage: string | null
    onSelect: (lang: string) => void
}

const LANGUAGE_LABELS: Record<string, string> = {
    en: 'English',
    pl: 'Polski',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    cs: 'Čeština',
    ua: 'Українська',
}

export function LanguageSelector({ story, currentLanguage, onSelect }: LanguageSelectorProps) {
    const supportedLangs = story.supported_languages || ['en']

    // If only one language is supported, we might not need to show this, 
    // but the parent component should handle that check.

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Select Language</h2>
                    <p className="text-sm text-neutral-400">
                        Choose your preferred language for this tour.
                        <br />
                        Wybierz preferowany język.
                    </p>
                </div>

                <div className="space-y-2">
                    {supportedLangs.map((langCode) => (
                        <button
                            key={langCode}
                            onClick={() => onSelect(langCode)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currentLanguage === langCode
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600'
                                }`}
                        >
                            <span className="font-medium text-lg">
                                {LANGUAGE_LABELS[langCode] || langCode.toUpperCase()}
                            </span>
                            {currentLanguage === langCode && <Check className="w-5 h-5" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
