import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth-lib'
import { Badge } from '@/components/ui/badge'
import { Users, KeyRound, Clock, ShieldCheck, AlertCircle } from 'lucide-react'

export default async function LicensePage() {
    const supabase = await createClient()
    const session = await getSession();

    // Fetch License Info
    const { data: license } = await supabase
        .from('licenses')
        .select('*')
        .eq('museum_id', session?.userId)
        .single();

    // Fetch Curators count
    const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('museum_id', session?.userId)
        .eq('role', 'curator');

    const maxSeats = license?.max_seats || 1;
    const seatsUsed = count || 0;
    const seatsAvailable = maxSeats - seatsUsed;
    const isLicenseExpired = license?.expires_at ? new Date(license.expires_at) < new Date() : false;

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white">License Details</h1>
                <p className="text-sm text-neutral-400">Manage your subscription, limits, and billing status.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License Card */}
                <div className="relative overflow-hidden p-6 bg-neutral-900 rounded-xl border border-white/5 shadow-sm group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-emerald-500/10" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-neutral-300">Current Plan</h3>
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
                    <div className="flex flex-col gap-2 text-sm text-neutral-500 mt-4 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <span>Status: {isLicenseExpired ? 'Expired' : 'Active'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-neutral-400" />
                            <span>Valid until: {license?.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Lifetime validity'}</span>
                        </div>
                    </div>
                </div>

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
                    
                    <div className="w-full bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                        <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (seatsUsed / maxSeats) * 100)}%` }}
                        />
                    </div>
                    
                    <p className="text-xs text-neutral-500 mt-3 font-medium">
                        {seatsAvailable} {seatsAvailable === 1 ? 'seat' : 'seats'} available for new curators.
                    </p>
                </div>
            </div>
            
            {/* Contact Support Placeholder */}
            <div className="mt-8 p-6 rounded-xl border border-white/5 bg-neutral-900/30 flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-white">Need more seats?</h3>
                    <p className="text-sm text-neutral-400 mt-1">Upgrade your license to invite more team members to your studio.</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors">
                    Contact Sales
                </button>
            </div>
        </div>
    )
}
