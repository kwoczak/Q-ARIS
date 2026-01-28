'use client'

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/brand/Logo"
import Link from "next/link"

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <Link href="/">
                        <Logo className="w-10 h-10 text-white" textClassName="text-2xl text-white" />
                    </Link>
                </div>

                <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-md shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={action} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-neutral-200">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="bg-neutral-950/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-neutral-200">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-neutral-950/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                                    placeholder="••••••••"
                                />
                            </div>

                            {state?.error && (
                                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                                    {state.error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isPending ? 'Authenticating...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center text-xs text-neutral-500 w-full">
                            Protected by Q-ARIS Secure Access
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
