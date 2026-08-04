import { Settings } from 'lucide-react'

export default function SettingsPlaceholder() {
    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                    Curator Settings
                </h1>
                <p className="text-sm text-neutral-400">Manage your profile, preferences, and workspace settings.</p>
            </div>
            
            <div className="h-96 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 bg-neutral-900/20 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 shadow-inner border border-white/5">
                    <Settings className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Coming Soon</h3>
                <p className="text-neutral-400 max-w-md">
                    Workspace settings and profile management will be available in a future update.
                </p>
            </div>
        </div>
    )
}
