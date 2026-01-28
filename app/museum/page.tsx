
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
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Museum Dashboard</h1>
                    <p className="text-gray-500">Manage your curators and license.</p>
                </div>
                <LogoutButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="p-6 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-medium text-gray-500">Seats Used</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{seatsUsed}</span>
                        <span className="text-gray-500">/ {maxSeats}</span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-medium text-gray-500">License Status</h3>
                    <div className="mt-2">
                        {isLicenseExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                        ) : (
                            <div className="flex flex-col">
                                <Badge variant="outline" className="w-fit border-green-200 text-green-700 bg-green-50">Active</Badge>
                                <span className="text-sm text-gray-500 mt-1">Expires: {license?.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}</span>
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

            <div className="rounded-md border bg-white">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Curators</h2>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Username</th>
                            <th className="px-4 py-3 font-medium">Created At</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {curators?.map((curator) => (
                            <tr key={curator.id}>
                                <td className="px-4 py-3 font-medium">{curator.username}</td>
                                <td className="px-4 py-3 text-gray-500">
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
                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
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
