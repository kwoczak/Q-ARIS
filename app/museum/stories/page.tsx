import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
import Link from 'next/link'
import { Users, ChevronRight, Library } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function StoriesDashboardPage() {
    const supabase = await createClient()
    const session = await getSession();

    // Fetch Curators
    const { data: curators } = await supabase
        .from('users')
        .select('*')
        .eq('museum_id', session?.userId)
        .eq('role', 'curator')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-10 pb-10">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white">Stories</h1>
                <p className="text-sm text-neutral-400">Select a curator to view and preview their stories.</p>
            </div>
            
            {/* Curators Table */}
            <div className="rounded-xl border border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-900/80 border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Curator Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {curators?.map((curator) => (
                                <tr key={curator.id} className="group hover:bg-white/[0.02] transition-colors relative">
                                    <td className="px-6 py-4 font-medium text-neutral-200">
                                        <Link href={`/museum/stories/${curator.id}`} className="absolute inset-0 z-10">
                                            <span className="sr-only">View stories for {curator.username}</span>
                                        </Link>
                                        <div className="flex items-center gap-3 relative z-0">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                <Users className="w-4 h-4 text-purple-400" />
                                            </div>
                                            {curator.username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 relative z-0">
                                        <Badge variant="outline" className="text-neutral-400 border-white/10 font-normal shadow-none bg-transparent">
                                            Curator
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-400 relative z-0">
                                        {new Date(curator.created_at).toLocaleDateString(undefined, { 
                                            year: 'numeric', month: 'short', day: 'numeric' 
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right relative z-0">
                                        <div className="flex justify-end items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                                            <span className="flex items-center gap-1.5">
                                                <Library className="w-4 h-4" />
                                                View Stories
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!curators || curators.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                                <Users className="w-5 h-5 text-neutral-500" />
                                            </div>
                                            <p className="text-neutral-400 font-medium">No curators found</p>
                                            <p className="text-sm text-neutral-500">Add a curator from the Curators tab first.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
