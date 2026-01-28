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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 border-neutral-200">
            <header className="border-b bg-white dark:bg-neutral-950 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-xl font-bold tracking-tight">
                        Museum<span className="text-blue-600">Story</span> CMS
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    {adminUser && <EditAdminDialog adminUser={adminUser} />}
                    <div className="h-4 w-px bg-gray-200" />
                    <form action={logout}>
                        <Button variant="ghost" size="sm" type="submit">Logout</Button>
                    </form>
                </div>
            </header>
            <main className="p-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
