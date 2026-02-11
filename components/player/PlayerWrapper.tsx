'use client'

import { useState, useEffect } from 'react'
import { Stage, Story } from "@/types/schema" // Added Story
import { StageRenderer } from './StageRenderer'
import { LanguageSelector } from './LanguageSelector'
import { useSearchParams } from 'next/navigation'

interface PlayerWrapperProps {
    stage: Stage
    story: {
        id: string
        supported_languages?: string[]
        default_language?: string
        is_gamified?: boolean
    }
}

export function PlayerWrapper({ stage, story }: PlayerWrapperProps) {
    const [language, setLanguage] = useState<string | null>(null)
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        // 1. Check URL param (debug/share override)
        const urlLang = searchParams.get('lang')
        if (urlLang && story.supported_languages?.includes(urlLang)) {
            setLanguage(urlLang)
            return
        }

        // 2. Check LocalStorage
        const savedLang = localStorage.getItem(`story_lang_${story.id}`) || localStorage.getItem('user_preferred_lang')

        if (savedLang && story.supported_languages?.includes(savedLang)) {
            setLanguage(savedLang)
        } else {
            // 3. Fallback: If only 1 language supported, use it. Else open selector.
            if (story.supported_languages && story.supported_languages.length === 1) {
                setLanguage(story.supported_languages[0])
            } else {
                setIsSelectorOpen(true)
            }
        }
    }, [story.id, story.supported_languages, searchParams])

    const handleSelectLanguage = (lang: string) => {
        setLanguage(lang)
        localStorage.setItem(`story_lang_${story.id}`, lang)
        localStorage.setItem('user_preferred_lang', lang)
        setIsSelectorOpen(false)
    }

    // Pass changeLanguage handler to StageRenderer (e.g. for QR Scanner view)
    const handleChangeLanguageRequest = () => {
        setIsSelectorOpen(true)
    }

    if (!language && isSelectorOpen) {
        // Just show selector if no language chosen yet
        return (
            <LanguageSelector
                story={story as Story}
                currentLanguage={language}
                onSelect={handleSelectLanguage}
            />
        )
    }

    if (!language) {
        // Still initializing or waiting for selector
        return <div className="min-h-screen bg-black" />
    }

    return (
        <>
            <StageRenderer
                stage={stage}
                language={language}
                onChangeLanguage={handleChangeLanguageRequest}
                isGamified={story.is_gamified ?? true}
                isPaused={isSelectorOpen}
            />
            {isSelectorOpen && (
                <LanguageSelector
                    story={story as Story}
                    currentLanguage={language}
                    onSelect={handleSelectLanguage}
                />
            )}
        </>
    )
}
