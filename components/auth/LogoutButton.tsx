'use client'

import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"

export function LogoutButton() {
    return (
        <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">Logout</Button>
        </form>
    )
}
