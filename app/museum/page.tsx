
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
import { CreateCuratorDialog } from '@/components/museum/CreateCuratorDialog'
import { EditCuratorDialog } from '@/components/museum/EditCuratorDialog'
import { CuratorActions } from '@/components/museum/CuratorActions'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Badge } from '@/components/ui/badge'

export default async function MuseumDashboard() {
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
        <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Museum Dashboard</h1>
                    <p className="text-neutral-400">Manage your curators and license.</p>
                </div>
                <LogoutButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="p-6 bg-neutral-900 rounded-lg border border-white/10 shadow-sm">
                    <h3 className="font-medium text-neutral-400">Seats Used</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{seatsUsed}</span>
                        <span className="text-neutral-500">/ {maxSeats}</span>
                    </div>
                </div>
                <div className="p-6 bg-neutral-900 rounded-lg border border-white/10 shadow-sm">
                    <h3 className="font-medium text-neutral-400">License Status</h3>
                    <div className="mt-2">
                        {isLicenseExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                        ) : (
                            <div className="flex flex-col">
                                <Badge variant="outline" className="w-fit border-green-900 text-green-400 bg-green-900/20">Active</Badge>
                                <span className="text-sm text-neutral-500 mt-1">Expires: {license?.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <CreateCuratorDialog
                        disabled={!canAddCurator}
                        seatsUsed={seatsUsed}
                        maxSeats={maxSeats}
                    />
                </div>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden bg-neutral-900/50">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Curators</h2>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-900 border-b border-white/10">
                        <tr>
                            <th className="px-4 py-3 font-medium text-neutral-400">Username</th>
                            <th className="px-4 py-3 font-medium text-neutral-400">Created At</th>
                            <th className="px-4 py-3 font-medium text-right text-neutral-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {curators?.map((curator) => (
                            <tr key={curator.id} className="hover:bg-neutral-900 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">{curator.username}</td>
                                <td className="px-4 py-3 text-neutral-400">
                                    {new Date(curator.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end items-center gap-2">
                                    <EditCuratorDialog curator={curator} />
                                    <CuratorActions curatorId={curator.id} />
                                </td>
                            </tr>
                        ))}
                        {(!curators || curators.length === 0) && (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                                    No curators yet. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
