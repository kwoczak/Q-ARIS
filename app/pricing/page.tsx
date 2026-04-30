import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl tracking-tight">
                        Q-ARIS
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/10">
                                Log In
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                        We partner with venues and creators to build bespoke interactive experiences.
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="max-w-md mx-auto">
                    <div className="rounded-3xl border border-blue-500/30 bg-neutral-900/50 backdrop-blur-sm p-8 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/10 transition-colors" />

                        <div className="flex items-baseline justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Professional</h3>
                                <p className="text-sm text-neutral-400 mt-1">For venues & creators</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold">Custom</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Unlimited interactive stories",
                                "Audience Analytics & Flows",
                                "Custom 3D Model Hosting",
                                "Multi-language AI Translation",
                                "White-label branding options",
                                "Dedicated Success Manager",
                                "SLA & Priority Support",
                                "On-premise deployment available"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-neutral-300">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button asChild size="lg" className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                            <a href="mailto:sales@q-aris.com?subject=Enterprise Inquiry">
                                Request Pricing <ArrowRight className="w-4 h-4 ml-2" />
                            </a>
                        </Button>

                        <p className="text-xs text-center text-neutral-500 mt-4">
                            No credit card required. Billed annually.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-12 px-6 border-t border-white/5 bg-neutral-950 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-neutral-500 text-sm">
                        © 2026 Q-ARIS Platform.
                    </div>
                </div>
            </footer>
        </div>
    )
}
