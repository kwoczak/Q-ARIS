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
import { createCuratorAction } from "@/app/actions/museum"
import { validatePassword } from "@/lib/password-utils"

export function CreateCuratorDialog({ disabled, seatsUsed, maxSeats }: { disabled: boolean, seatsUsed: number, maxSeats: number }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')

    // Password state for real-time validation
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const validation = useMemo(() => validatePassword(password), [password]);
    const isMatch = password === confirmPassword;
    const canSubmit = validation.isValid && isMatch && password.length > 0;

    async function onSubmit(formData: FormData) {
        if (!canSubmit) return;

        setIsPending(true)
        setError('')

        try {
            const res = await createCuratorAction(formData)
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
                <Button disabled={disabled}>
                    {disabled ? `Limit Reached (${seatsUsed}/${maxSeats})` : 'Add Curator'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Curator</DialogTitle>
                    <DialogDescription>
                        Create a curator account. Strong password required.
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
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending || !canSubmit}>
                            {isPending ? 'Creating...' : 'Create Curator'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
