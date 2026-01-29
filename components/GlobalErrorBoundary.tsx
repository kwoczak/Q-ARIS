'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
        this.setState({ errorInfo })
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="bg-black text-white p-8 h-screen w-screen overflow-auto flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Oops, something went wrong.</h1>
                    <p className="mb-4">Please take a screenshot of this error and send it to support.</p>

                    <div className="bg-neutral-900 p-4 rounded-md w-full max-w-lg border border-red-900/50">
                        <p className="font-mono text-sm text-red-400 mb-2 font-bold">{this.state.error?.toString()}</p>
                        <pre className="font-mono text-xs text-neutral-400 whitespace-pre-wrap overflow-x-auto">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>

                    <button
                        className="mt-8 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
