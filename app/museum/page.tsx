import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
import { CreateCuratorDialog } from '@/components/museum/CreateCuratorDialog'
import { EditCuratorDialog } from '@/components/museum/EditCuratorDialog'
import { CuratorActions } from '@/components/museum/CuratorActions'
import { Badge } from '@/components/ui/badge'
import { Users, KeyRound, Clock, ShieldCheck, AlertCircle } from 'lucide-react'

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
        <div className="space-y-10 pb-10">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white">Overview</h1>
                <p className="text-sm text-neutral-400">Manage your museum's license and curator accounts.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Seats Card */}
                <div className="relative overflow-hidden p-6 bg-neutral-900 rounded-xl border border-white/5 shadow-sm group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-blue-500/10" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-neutral-300">Curator Seats</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-semibold text-white tracking-tight">{seatsUsed}</span>
                        <span className="text-neutral-500 font-medium">/ {maxSeats}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 font-medium">
                        {seatsAvailable} {seatsAvailable === 1 ? 'seat' : 'seats'} available
                    </p>
                </div>

                {/* License Card */}
                <div className="relative overflow-hidden p-6 bg-neutral-900 rounded-xl border border-white/5 shadow-sm group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-emerald-500/10" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-neutral-300">License Status</h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isLicenseExpired ? (
                            <>
                                <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/20 border-0 shadow-none px-2.5 py-0.5">
                                    <AlertCircle className="w-3 h-3 mr-1.5" /> Expired
                                </Badge>
                            </>
                        ) : (
                            <>
                                <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 border-0 shadow-none px-2.5 py-0.5 pointer-events-none">
                                    <ShieldCheck className="w-3 h-3 mr-1.5" /> Active
                                </Badge>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-3 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {license?.expires_at ? `Valid until ${new Date(license.expires_at).toLocaleDateString()}` : 'Lifetime validity'}
                    </div>
                </div>
            </div>

        </div>
    )
}
