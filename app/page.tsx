import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { 
  ArrowRight, 
  QrCode, 
  Smartphone, 
  BarChart3, 
  Globe, 
  Lock, 
  Share2, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Sparkles, 
  Volume2,
  ArrowRightLeft
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 font-sans">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/70 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="#interactive-demo" className="hover:text-white transition-colors">Live Demo</Link>
            <Link href="#features" className="hover:text-white transition-colors">Studio Features</Link>
            <Link href="#analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/5">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-28 px-6 relative overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Next-Gen WebAR Storytelling
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Bring Spaces & <br className="hidden md:block" />
              Objects to Life with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Interactive QR Guides
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Create immersive WebAR guides and branching audio stories. No app installation required. Visitors simply scan a QR code to experience 3D models, rich narratives, and interactive quizzes in their browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-neutral-200 shadow-xl transition-all duration-300">
                  Start Creating <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
                </Button>
              </Link>
              <Link href="#interactive-demo">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-neutral-800 hover:bg-white/5 hover:text-white transition-all">
                  Try Live Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="lg:col-span-6 relative flex justify-center">
            {/* Visual Link Indicator (Curator -> WebAR) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none rounded-xl -z-10" />
            
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-xl bg-neutral-900/60 border border-white/10 p-2 shadow-2xl overflow-hidden backdrop-blur-sm group">
              <div className="absolute top-2 left-3 flex gap-1.5 z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="absolute top-2 right-4 text-[10px] text-neutral-500 select-none">Q-ARIS Curator Studio</div>
              
              <div className="w-full h-full rounded-lg overflow-hidden relative bg-black/40">
                <img 
                  src="/curator-graph.png" 
                  alt="Curator Visual Graph Editor" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-700" 
                />
                
                {/* Floating iPhone mock overlay */}
                <div className="absolute bottom-4 right-4 w-40 h-[190px] rounded-2xl bg-neutral-950 border-4 border-neutral-800 shadow-2xl overflow-hidden hidden sm:block transform rotate-[-4deg] hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-neutral-800 flex justify-center items-center">
                    <div className="w-10 h-2 rounded bg-neutral-950" />
                  </div>
                  <div className="w-full h-full pt-4">
                    <img 
                      src="/edit-stage.png" 
                      alt="WebAR Preview" 
                      className="w-full h-full object-cover scale-[1.3] object-right-bottom" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS TICKER --- */}
      <div className="border-y border-white/5 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          {[
            { label: "App Download Required", value: "0" },
            { label: "Device Compatibility", value: "99.8%" },
            { label: "Creation Time", value: "< 10m" },
            { label: "Visitor Retention", value: "+300%" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{stat.value}</span>
              <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- INTERACTIVE DEMO STAND & SCANNER --- */}
      <section id="interactive-demo" className="py-24 bg-black relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Hands-On Showcase
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Experience Q-ARIS Live</h2>
            <p className="text-neutral-400">Scan the QR code with your phone to start the live NASA Voyager guide instantly. No app download required.</p>
          </div>

          <div className="flex justify-center items-center">
            
            {/* Centered: Physical Gallery Stand & QR Code */}
            <div className="w-full max-w-[340px] bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative group">
              {/* Horizontal Neon Scanner Animation */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-bounce opacity-80 z-20 shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ animationDuration: '3s' }} />
              
              <div className="aspect-square bg-white rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
                <img 
                  src="/qr-demo.png" 
                  alt="Demo Scan QR Code" 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div className="mt-6 text-center space-y-2">
                <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-400" /> Exhibit: Voyager 1 Guide
                </h4>
                <p className="text-xs text-neutral-500">Scan this QR Code with your smartphone camera to launch the WebAR guide directly.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STUDIO FEATURE WALKTHROUGH --- */}
      <section id="features" className="py-32 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <Layers className="w-3.5 h-3.5" /> Curator Studio
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Create Rich Experiences. <br />
              <span className="text-neutral-500">Without writing a single line of code.</span>
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Our visual node editor lets you design complex, branching narratives, generate audio voiceovers, and manage exhibits through an intuitive browser workspace.
            </p>
          </div>

          {/* Feature 1: Node Graph */}
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">Visual Story Graph</h3>
              <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
                Map out visitor pathways using a drag-and-drop node graph. Connect entry triggers (QR Codes) to specific content slides, 3D assets, or quizzes. Structure linear tours or design interactive, branching exploration paths.
              </p>
              <ul className="space-y-2">
                {["Drag and drop nodes easily", "Add connections with simple clicks", "Automatic cloud sync and save"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 relative">
              <div className="relative rounded-2xl bg-neutral-900/40 border border-white/10 p-2 shadow-2xl overflow-hidden backdrop-blur-sm group">
                <img 
                  src="/curator-graph.png" 
                  alt="Curator Visual Graph Editor Screen" 
                  className="w-full h-auto rounded-lg" 
                />
              </div>
            </div>
          </div>

          {/* Feature 2: Stage Composer */}
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 order-last lg:order-first relative">
              <div className="relative rounded-2xl bg-neutral-900/40 border border-white/10 p-2 shadow-2xl overflow-hidden backdrop-blur-sm group">
                <img 
                  src="/edit-stage.png" 
                  alt="Stage Composer Screen" 
                  className="w-full h-auto rounded-lg" 
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">Immersive Stage Composer</h3>
              <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
                Build media-rich stages. Add high-definition images, descriptive text blocks, audio guides, video sequences, 3D WebAR models, quizzes, or interactives. Preview changes in real-time on a simulated mobile view.
              </p>
              <ul className="space-y-2">
                {["Rich media block library", "Live mobile screen preview", "Multi-language automatic translation"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3: TTS Voiceovers */}
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-orange-900/30 flex items-center justify-center text-orange-400 border border-orange-500/20">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">AI Voiceover Studio</h3>
              <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
                No narrator needed. Type or paste your exhibit descriptions and instantly generate professional, studio-quality AI voiceovers using Eleven Labs. Assign distinct voices to different nodes for a personalized tour feel.
              </p>
              <ul className="space-y-2">
                {["Eleven Labs high-fidelity integration", "Dozens of character & voice profiles", "Save generated audio directly to tour assets"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 relative">
              <div className="relative rounded-2xl bg-neutral-900/40 border border-white/10 p-2 shadow-2xl overflow-hidden backdrop-blur-sm group">
                <img 
                  src="/tts-studio.png" 
                  alt="Text to Speech Studio Screen" 
                  className="w-full h-auto rounded-lg" 
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- SEGMENT: ANALYTICS & INSIGHTS --- */}
      <section id="analytics" className="py-24 bg-neutral-900/20 border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Visual occupies 7 cols */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-2xl bg-neutral-900/40 border border-white/10 p-2 shadow-2xl overflow-hidden backdrop-blur-sm group">
              <img 
                src="/analytics.png" 
                alt="Analytics Dashboard Screen" 
                className="w-full h-auto rounded-lg" 
              />
            </div>
          </div>

          {/* Text occupies 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/30 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">Actionable Visitor Analytics</h2>
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
              Understand exactly how your visitors interact with your exhibits. Track total unique visitor sessions, page views, and dwell times. View which exhibit stages are most popular and map common visitor journeys.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Unique Visitors</span>
                <div className="text-xl font-bold text-white">11 Unique</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Average Session Duration</span>
                <div className="text-xl font-bold text-emerald-400">10m 55s</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- GRID: ESSENTIAL FEATURES --- */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h3 className="text-3xl font-bold">Engineered for Seamless Engagement</h3>
            <p className="text-neutral-400">Packed with core utilities built to handle scaling museum, outdoor, and commercial deployments.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
              title="Instant Web Loading"
              description="Extremely lightweight web-app optimized to load guides in milliseconds, even on slow mobile connectivity."
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5 text-blue-400" />}
              title="Secure Database & RLS"
              description="Fully authenticated workflows using Supabase with row-level security for secure content isolation."
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5 text-indigo-400" />}
              title="Global Scale Readiness"
              description="Low latency media streaming and model deliveries deployed across multi-region CDNs."
            />
            <FeatureCard
              icon={<Smartphone className="w-5 h-5 text-purple-400" />}
              title="99.8% Device Coverage"
              description="Requires no modern hardware or special settings—any smartphone with a working camera can run Q-ARIS."
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5 text-pink-400" />}
              title="Interactive Quizzes"
              description="Engage visitors and test their memory with scoring mechanisms and visual reward endings."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              title="Text to Speech Studio"
              description="Integrate AI narration easily within any content block, creating accessible paths for visually impaired guests."
            />
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-indigo-950/20 to-neutral-950 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Ready to bring your space to life?</h2>
          <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Join the forward-thinking curators and museum designers using Q-ARIS to build unforgettable visitor experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_40px_-5px_rgba(37,99,235,0.5)] border-0 transition-all duration-300">
                Get Started Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-base text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                View Pricing <ArrowRightLeft className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/5 bg-neutral-950 relative z-10">
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
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-blue-500/30 hover:bg-neutral-900/70 transition-all duration-300 cursor-default group">
      <div className="flex items-center gap-3 mb-3">
        <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="text-neutral-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
