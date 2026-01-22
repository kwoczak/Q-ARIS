'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface VisitorState {
    score: number
    completedBlocks: string[] // IDs of blocks that gave points
}

interface VisitorContextType {
    score: number
    isLoaded: boolean
    addPoints: (amount: number, blockId: string) => void
    hasCompletedBlock: (blockId: string) => boolean
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined)

const STORAGE_KEY = 'quaris_visitor_state_v1'

export function VisitorProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<VisitorState>({
        score: 0,
        completedBlocks: []
    })
    const [isLoaded, setIsLoaded] = useState(false)

    // Hydrate from Storage on Mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setState(JSON.parse(stored))
            }
        } catch (e) {
            console.error("Failed to load visitor state", e)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Persist whenever state changes (if loaded)
    useEffect(() => {
        if (!isLoaded) return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, [state, isLoaded])

    const addPoints = (amount: number, blockId: string) => {
        if (state.completedBlocks.includes(blockId)) return

        setState(prev => ({
            ...prev,
            score: prev.score + amount,
            completedBlocks: [...prev.completedBlocks, blockId]
        }))
    }

    const hasCompletedBlock = (blockId: string) => {
        return state.completedBlocks.includes(blockId)
    }

    return (
        <VisitorContext.Provider value={{ score: state.score, isLoaded, addPoints, hasCompletedBlock }}>
            {children}
        </VisitorContext.Provider>
    )
}

export function useVisitor() {
    const context = useContext(VisitorContext)
    if (context === undefined) {
        throw new Error('useVisitor must be used within a VisitorProvider')
    }
    return context
}
