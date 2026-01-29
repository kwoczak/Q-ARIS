import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import { ArrowRight, QrCode, Smartphone, BarChart3, Globe, Lock, Share2, CheckCircle2, Zap, Layers, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 font-sans">

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-white transition-colors text-white">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/10">
                Log In
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        {/* Abstract Background Blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 Now Available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            The Future of <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Museum Storytelling
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Transform visitors into explorers with immersive WebAR guides.
            No app downloads required. Just scan and play.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-neutral-200">
                Start Creating <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-neutral-700 hover:bg-white/5 hover:text-white">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* --- STATS TICKER --- */}
      <div className="border-y border-white/5 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          {[
            { label: "App Download Required", value: "0" },
            { label: "Platform Supported", value: "100%" },
            { label: "Setup Time", value: "< 5m" },
            { label: "Visitor Engagement", value: "3x" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              <span className="text-xs text-neutral-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- 3-STEP PROCESS (HOW IT WORKS) --- */}
      <section id="how-it-works" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Seamless Visitor Experience</h2>
            <p className="text-neutral-400">No friction, no tutorials. Just intuitive exploration.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 -z-10" />

            {[
              { icon: QrCode, title: "1. Scan", desc: "Visitors scan a QR code placed next to the artifact." },
              { icon: Sparkles, title: "2. Explore", desc: "3D models and stories appear instantly in WebAR." },
              { icon: Layers, title: "3. Learn", desc: "Interactive quizzes and deeper context on demand." },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500 group-hover:border-blue-500/30">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURE SPOTLIGHT: CURATOR STUDIO (FULL WIDTH) --- */}
      <section id="features" className="py-32 relative border-t border-white/5 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-400 mb-6">
                <Layers className="w-3 h-3" /> Curator Tools
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Power to the Curators. <br />
                <span className="text-neutral-500">No IT department needed.</span>
              </h2>
              <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                Our visual node editor lets you design complex, branching narratives as easily as drawing on a whiteboard.
                Drag, drop, and connect stages to create a journey unique to your museum.
              </p>
              <ul className="grid grid-cols-2 gap-4">
                {['Visual Story Graph', 'Instant Cloud Save', 'One-Click Publish', 'Asset Library'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
            {/* Abstract UI Mockup */}
            <div className="relative rounded-xl bg-neutral-900 border border-neutral-800 p-2 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent pointer-events-none rounded-xl" />
              <div className="aspect-[4/3] rounded-lg bg-black/50 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="flex gap-4 opacity-50">
                      <div className="w-24 h-16 rounded border border-neutral-700 bg-neutral-800/50" />
                      <div className="w-24 h-16 rounded border border-neutral-700 bg-neutral-800/50" />
                    </div>
                    <div className="w-0.5 h-8 bg-neutral-700 mx-auto" />
                    <div className="w-24 h-16 rounded border border-orange-500/50 bg-orange-500/10 mx-auto flex items-center justify-center text-xs text-orange-400">
                      Selected Node
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEGMENT: ANALYTICS & INSIGHTS (Asymmetrical) --- */}
      <section className="py-24 bg-neutral-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          {/* Visual occupies 7 cols */}
          <div className="md:col-span-7 relative">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-neutral-800 to-black border border-white/5 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-end gap-2 h-32 opacity-80">
                  {[40, 70, 45, 90, 60, 80, 50, 70, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-500/80 rounded-t-sm hover:bg-green-400 transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text occupies 5 cols */}
          <div className="md:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">Data-Driven Curation</h2>
            <p className="text-neutral-400 leading-relaxed">
              Understand what resonates. Track dwell times, popular paths, and engagement drop-offs to continuously improve your exhibition.
            </p>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-neutral-400">Avg. Engagement Time</span>
                <span className="text-green-400 text-xs">+24%</span>
              </div>
              <div className="text-2xl font-bold">12m 30s</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- GRID: ESSENTIAL FEATURES --- */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold">Everything else you need</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap />}
              title="Instant Loading"
              description="Optimized 3D assets load in milliseconds, even on mobile data."
            />
            <FeatureCard
              icon={<Lock />}
              title="Enterprise Security"
              description="Role-based access, SSO, and encrypted data storage."
            />
            <FeatureCard
              icon={<Globe />}
              title="Global CDN"
              description="Low-latency content delivery worldwide."
            />
            <FeatureCard
              icon={<Smartphone />}
              title="Device Agnostic"
              description="Works on 99% of smartphones with a browser and camera."
            />
            <FeatureCard
              icon={<Share2 />}
              title="Social Sharing"
              description="Built-in tools for visitors to share their experience."
            />
            <FeatureCard
              icon={<CheckCircle2 />}
              title="Accessibility"
              description="Screen reader support and high-contrast modes."
            />
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-blue-950/20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to modernize your museum?</h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Join leading institutions using Q-ARIS to create unforgettable visitor experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_-5px_rgba(37,99,235,0.5)] border-0">
                Get Started Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg hover:bg-white/5">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/5 bg-neutral-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-neutral-500">
            <Logo className="w-6 h-6 text-neutral-600" textClassName="text-lg text-neutral-400" />
            <span className="text-sm">© 2026 Q-ARIS Platform. All rights reserved.</span>
          </div>

          <div className="flex gap-6 text-sm text-neutral-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-neutral-800 transition-all cursor-default">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-neutral-400">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="text-neutral-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
