import { Settings } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
                <p className="text-sm text-neutral-400">Configure your museum account.</p>
            </div>
            
            <div className="h-96 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Account Settings</h3>
                <p className="text-neutral-400 max-w-sm">
                    Configuration options will be available here.
                </p>
            </div>
        </div>
    )
}
