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
import { createMuseumAction } from "@/app/actions/admin"
import { validatePassword } from "@/lib/password-utils"

export function CreateMuseumDialog({ adminId }: { adminId: string }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const validation = useMemo(() => validatePassword(password), [password]);
    const isMatch = password === confirmPassword;
    const canSubmit = validation.isValid && isMatch && password.length > 0;

    async function onSubmit(formData: FormData) {
        if (!canSubmit) return;
        setIsPending(true)
        setError('')
        formData.append('adminId', adminId)

        try {
            const res = await createMuseumAction(formData)
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
                <Button>Add Museum</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Museum Account</DialogTitle>
                    <DialogDescription>
                        Create a new museum account. Strong password required.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">
                                Username
                            </Label>
                            <Input id="username" name="username" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* Password Requirements */}
                        <div className="flex flex-col gap-1 text-xs bg-gray-50 p-3 rounded-md border text-gray-600">
                            <p className="font-semibold mb-1">Password Requirements:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                <li className={password.length >= 8 ? "text-green-600" : ""}>Min 8 characters</li>
                                <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>One uppercase letter</li>
                                <li className={/\d/.test(password) ? "text-green-600" : ""}>One number</li>
                                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-600" : ""}>One special character</li>
                                <li className={isMatch && confirmPassword.length > 0 ? "text-green-600" : confirmPassword.length > 0 ? "text-red-500" : ""}>Passwords match</li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="maxSeats">
                                Max Seats
                            </Label>
                            <Input id="maxSeats" name="maxSeats" type="number" defaultValue="3" required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="expiresAt">
                                License Expires At
                            </Label>
                            <Input
                                id="expiresAt"
                                name="expiresAt"
                                type="date"
                                required
                                defaultValue={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending || !canSubmit}>
                            {isPending ? 'Creating...' : 'Create Museum'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
