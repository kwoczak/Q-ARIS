import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import { ArrowRight, QrCode, Smartphone, BarChart3, Globe, Lock, Share2, CheckCircle2 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 Now Available with Advanced Analytics
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

      {/* --- MAJOR FEATURE SEGMENTS --- */}

      {/* Segment 1: No App Required */}
      <section id="features" className="py-24 border-t border-white/5 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Absolutely No Code. <br />No App Download.</h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Remove the biggest barrier to entry for museum visitors. Q-ARIS works directly in the mobile browser.
              Visitors simply scan a QR code at the exhibit and instantly start the experience.
            </p>
            <ul className="space-y-3 pt-4">
              {['Works on iOS and Android', 'Instant load times', 'Zero friction onboarding'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square md:aspect-video rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-900 border border-white/5 overflow-hidden group">
            {/* Visual Placeholder for "Scan to Play" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 opacity-50">
                <QrCode className="w-24 h-24 mx-auto text-neutral-600" />
                <p className="text-sm font-mono text-neutral-500">SCAN_ME.svg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segment 2: WebAR */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative aspect-square md:aspect-video rounded-2xl bg-gradient-to-bl from-neutral-900 to-black border border-white/5 overflow-hidden">
            {/* Visual Placeholder for "AR Model" */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone className="w-24 h-24 text-neutral-700" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Immersive 3D Models in Your Browser</h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Bring history to life. Display high-fidelity 3D artifacts, reconstructions, and animated content
              directly in the visitor's physical space using advanced WebAR technology.
            </p>
            <ul className="space-y-3 pt-4">
              {['Interactive 3D viewing', 'Contextual info overlays', 'Seamless reality blending'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Segment 3: Analytics */}
      <section className="py-24 border-t border-white/5 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Understand Your Visitors Like Never Before</h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Go beyond ticket sales. Our deep analytics dashboard lets you track visitor flow through the exhibition,
              measure engagement time at specific artifacts, and identify popular routes.
            </p>
            <ul className="space-y-3 pt-4">
              {['Heatmaps & Visitor Flow', 'Engagement retention stats', 'Exportable reports'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square md:aspect-video rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 overflow-hidden">
            {/* Visual Placeholder for "Dashboard" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-24 h-24 text-neutral-700" />
            </div>
          </div>
        </div>
      </section>


      {/* --- SECONDARY FEATURES GRID --- */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold">Enterprise-Grade Reliability</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe />}
              title="Multi-Language"
              description="Automatically translate tours into multiple languages to welcome international visitors."
            />
            <FeatureCard
              icon={<Lock />}
              title="Enterprise Security"
              description="Role-based access control, secure data storage, and guaranteed uptime for major institutions."
            />
            <FeatureCard
              icon={<Share2 />}
              title="Easy Sharing"
              description="Visitors can seamlessly share their favorite exhibits on social media, amplifying your reach."
            />
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
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
