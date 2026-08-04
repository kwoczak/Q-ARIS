import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
import { CreateCuratorDialog } from '@/components/museum/CreateCuratorDialog'
import { EditCuratorDialog } from '@/components/museum/EditCuratorDialog'
import { CuratorActions } from '@/components/museum/CuratorActions'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

export default async function CuratorsPage() {
    const supabase = await createClient()
    const session = await getSession();

    // Fetch License Info
    const { data: license } = await supabase
        .from('licenses')
        .select('*')
        .eq('museum_id', session?.userId)
        .single();

    // Fetch Curators
    const { data: curators, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('museum_id', session?.userId)
        .eq('role', 'curator')
        .order('created_at', { ascending: false });

    const maxSeats = license?.max_seats || 1;
    const seatsUsed = count || 0;
    const seatsAvailable = maxSeats - seatsUsed;
    const isLicenseExpired = license?.expires_at ? new Date(license.expires_at) < new Date() : false;
    const canAddCurator = seatsAvailable > 0 && !isLicenseExpired;

    return (
        <div className="space-y-10 pb-10">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white">Curators</h1>
                <p className="text-sm text-neutral-400">Manage your team members with access to the studio.</p>
            </div>
            
            {/* Curators Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Curator Accounts</h2>
                        <p className="text-sm text-neutral-400">View and manage access permissions.</p>
                    </div>
                    <CreateCuratorDialog
                        disabled={!canAddCurator}
                        seatsUsed={seatsUsed}
                        maxSeats={maxSeats}
                    />
                </div>

                <div className="rounded-xl border border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-sm shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-900/80 border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {curators?.map((curator) => (
                                    <tr key={curator.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-200">
                                            {curator.username}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-neutral-400 border-white/10 font-normal shadow-none bg-transparent">
                                                Curator
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            {new Date(curator.created_at).toLocaleDateString(undefined, { 
                                                year: 'numeric', month: 'short', day: 'numeric' 
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <EditCuratorDialog curator={curator} />
                                                <CuratorActions curatorId={curator.id} />
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
                                                <p className="text-sm text-neutral-500">Add a curator to start creating content.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
