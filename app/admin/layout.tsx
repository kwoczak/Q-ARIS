import { Button } from "@/components/ui/button"
import Link from "next/link"
import { logout } from "@/app/actions/auth"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 border-neutral-200">
            <header className="border-b bg-white dark:bg-neutral-950 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-xl font-bold tracking-tight">
                        Museum<span className="text-blue-600">Story</span> CMS
                    </Link>
                </div>
                <div className="flex items-center gap-4">
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
