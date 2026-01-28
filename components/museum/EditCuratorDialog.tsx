'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useMemo } from "react"
import { updateCuratorAction } from "@/app/actions/museum"
import { Pencil } from "lucide-react"
import { validatePassword } from "@/lib/password-utils"

export function EditCuratorDialog({ curator }: { curator: any }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const validation = useMemo(() => validatePassword(password), [password]);
    const isMatch = password === confirmPassword;
    const isPasswordChanged = password.length > 0;

    // Valid if password not changed OR (valid complexity AND match)
    const canSubmit = !isPasswordChanged || (validation.isValid && isMatch);

    async function onSubmit(formData: FormData) {
        if (!canSubmit) return;

        setIsPending(true)
        setError('')
        formData.append('curatorId', curator.id)

        try {
            const res = await updateCuratorAction(formData)
            if (res?.error) {
                setError(res.error)
            } else {
                setOpen(false)
                setPassword('')
                setConfirmPassword('')
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Edit Curator">
                    <Pencil className="w-4 h-4 text-blue-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Curator</DialogTitle>
                    <DialogDescription>
                        Update username or change password. Leave password blank to keep current.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">
                                Username
                            </Label>
                            <Input id="username" name="username" defaultValue={curator.username} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">
                                New Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword">
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1 text-xs bg-neutral-900 p-3 rounded-md border border-white/10 text-neutral-400">
                            <p className="font-semibold mb-1 text-neutral-300">New Password Requirements:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                <li className={password.length >= 8 ? "text-green-500" : ""}>Min 8 characters</li>
                                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>One uppercase letter</li>
                                <li className={/\d/.test(password) ? "text-green-500" : ""}>One number</li>
                                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-500" : ""}>One special character</li>
                                <li className={isMatch && confirmPassword.length > 0 ? "text-green-500" : confirmPassword.length > 0 ? "text-red-400" : ""}>Passwords match</li>
                            </ul>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending || !canSubmit}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
