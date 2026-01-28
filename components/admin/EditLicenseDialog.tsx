'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { updateLicenseAction } from "@/app/actions/admin"

interface Props {
    museumId: string
    currentSeats: number
    currentExpiry?: string
    buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link' | 'destructive'
}

export function EditLicenseDialog({ museumId, currentSeats, currentExpiry, buttonVariant = 'outline' }: Props) {
    const [open, setOpen] = useState(false)

    async function onSubmit(formData: FormData) {
        formData.append('museumId', museumId)
        await updateLicenseAction(formData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={buttonVariant} size="sm">Manage License</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage License</DialogTitle>
                    <DialogDescription>
                        Update the license seat limit or extend the expiration date.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="maxSeats">
                                Max Seats
                            </Label>
                            <Input id="maxSeats" name="maxSeats" type="number" defaultValue={currentSeats} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="expiresAt">
                                License Expiry
                            </Label>
                            <Input
                                id="expiresAt"
                                name="expiresAt"
                                type="date"
                                defaultValue={currentExpiry ? new Date(currentExpiry).toISOString().split('T')[0] : ''}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
