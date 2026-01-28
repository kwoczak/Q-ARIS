
import { createClient } from '@/lib/supabase/server'
import { CreateMuseumDialog } from '@/components/admin/CreateMuseumDialog'
import { EditLicenseDialog } from '@/components/admin/EditLicenseDialog'
import { EditMuseumDialog } from '@/components/admin/EditMuseumDialog'
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

            <div className="rounded-md border border-white/10 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-900 border-b border-white/10">
                        <tr>
                            <th className="px-4 py-3 font-medium text-neutral-300">Username</th>
                            <th className="px-4 py-3 font-medium text-neutral-300">Status</th>
                            <th className="px-4 py-3 font-medium text-neutral-300">License / Seats</th>
                            <th className="px-4 py-3 font-medium text-neutral-300">Stats</th>
                            <th className="px-4 py-3 font-medium text-neutral-300">Expires</th>
                            <th className="px-4 py-3 font-medium text-right text-neutral-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {museums?.map((museum: any) => {
                            const isExpired = museum.expires_at ? new Date(museum.expires_at) < new Date() : false;

                            return (
                                <tr key={museum.id} className="bg-neutral-950 hover:bg-neutral-900 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{museum.username}</td>
                                    <td className="px-4 py-3">
                                        {museum.suspended ? (
                                            <Badge variant="destructive">Suspended</Badge>
                                        ) : isExpired ? (
                                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700">License Expired</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/20">Active</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-300">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">
                                                {museum.seats_used} / {museum.max_seats || 3}
                                            </span>
                                            <span className="text-xs text-neutral-500">Seats Used</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-300">
                                        <div className="flex flex-col gap-1">
                                            <span className="whitespace-nowrap">📚 {museum.total_stories} Stories</span>
                                            <span className="whitespace-nowrap">📍 {museum.total_nodes} Nodes</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-400">
                                        {museum.expires_at ? new Date(museum.expires_at).toLocaleDateString() : 'No License'}
                                    </td>
                                    <td className="px-4 py-3 text-right flex justify-end items-center gap-2">
                                        <EditLicenseDialog
                                            museumId={museum.id}
                                            currentSeats={museum.max_seats || 3}
                                            currentExpiry={museum.expires_at}
                                        />
                                        <EditMuseumDialog museum={museum} />
                                        <MuseumActions museumId={museum.id} suspended={museum.suspended || false} />
                                    </td>
                                </tr>
                            )
                        })}
                        {(!museums || museums.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
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
