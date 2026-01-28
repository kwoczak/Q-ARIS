
import { createClient } from '@/lib/supabase/server'
import { CreateMuseumDialog } from '@/components/admin/CreateMuseumDialog'
import { EditLicenseDialog } from '@/components/admin/EditLicenseDialog'
import { MuseumActions } from '@/components/admin/MuseumActions'
import { getSession } from '@/lib/auth-lib'
import { Badge } from '@/components/ui/badge'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const session = await getSession();

    // Fetch Museums and their licenses
    // Fetch Museums and their stats from the View
    const { data: museums } = await supabase
        .from('museum_dashboard_stats')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Museum Management</h1>
                    <p className="text-gray-500">Manage museum accounts and licenses.</p>
                </div>
                <CreateMuseumDialog adminId={session?.userId} />
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Username</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">License / Seats</th>
                            <th className="px-4 py-3 font-medium">Stats</th>
                            <th className="px-4 py-3 font-medium">Expires</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {museums?.map((museum: any) => {
                            const isExpired = museum.expires_at ? new Date(museum.expires_at) < new Date() : false;

                            return (
                                <tr key={museum.id} className="bg-white">
                                    <td className="px-4 py-3 font-medium">{museum.username}</td>
                                    <td className="px-4 py-3">
                                        {museum.suspended ? (
                                            <Badge variant="destructive">Suspended</Badge>
                                        ) : isExpired ? (
                                            <Badge variant="secondary">License Expired</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {museum.seats_used} / {museum.max_seats || 3}
                                            </span>
                                            <span className="text-xs text-gray-500">Seats Used</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="whitespace-nowrap">📚 {museum.total_stories} Stories</span>
                                            <span className="whitespace-nowrap">📍 {museum.total_nodes} Nodes</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {museum.expires_at ? new Date(museum.expires_at).toLocaleDateString() : 'No License'}
                                    </td>
                                    <td className="px-4 py-3 text-right flex justify-end items-center gap-2">
                                        <EditLicenseDialog
                                            museumId={museum.id}
                                            currentSeats={museum.max_seats || 3}
                                            currentExpiry={museum.expires_at}
                                        />
                                        <MuseumActions museumId={museum.id} suspended={museum.suspended || false} />
                                    </td>
                                </tr>
                            )
                        })}
                        {(!museums || museums.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No museums found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
