import { Button } from "@/components/ui/button"
import Link from "next/link"
import { logout } from "@/app/actions/auth"
import { getSession } from "@/lib/auth-lib"
import { createClient } from "@/lib/supabase/server"
import { EditAdminDialog } from "@/components/admin/EditAdminDialog"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession();
    const supabase = await createClient();

    // Fetch current admin info for the edit dialog
    const { data: adminUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', session?.userId)
        .single();

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
            <header className="border-b border-white/5 bg-neutral-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-xl font-bold tracking-tight">
                        Museum<span className="text-blue-500">Story</span> CMS
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    {adminUser && <EditAdminDialog adminUser={adminUser} />}
                    <div className="h-4 w-px bg-white/10" />
                    <form action={logout}>
                        <Button variant="ghost" size="sm" type="submit" className="text-neutral-400 hover:text-white hover:bg-white/5">Logout</Button>
                    </form>
                </div>
            </header>
            <main className="p-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
