"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  QrCode,
  Smartphone,
  Tv,
  Sparkles,
  BookOpen,
  HelpCircle,
  MapPin,
  Box,
  TrendingUp,
  CheckCircle2,
  Menu,
  X,
  BarChart3,
  Film,
  Zap,
  Layers,
  Clock,
  Compass,
  ArrowUpRight
} from "lucide-react";

export function CreatorsView() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mailtoFreePilot = "mailto:wojciech.kwoczak@mymetaskill.com?subject=Q-ARIS%20Free%20Creator%20Pilot";
  const mailtoFreePilotWithBody = "mailto:wojciech.kwoczak@mymetaskill.com?subject=Q-ARIS%20Free%20Creator%20Pilot&body=Channel%20name%3A%0AYouTube%20video%20or%20topic%3A%0AWhat%20would%20you%20like%20viewers%20to%20explore%3F%3A";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 font-sans scroll-smooth">
      
      {/* ========================================================= */}
      {/* 2. HEADER                                                */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/creators" 
            className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-lg"
            aria-label="Q-ARIS for Creators Home"
          >
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-md px-1 py-0.5">
              How It Works
            </Link>
            <Link href="#use-cases" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-md px-1 py-0.5">
              Use Cases
            </Link>
            <Link href="#demo" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-md px-1 py-0.5">
              Live Demo
            </Link>
            <Link href="#analytics" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-md px-1 py-0.5">
              Analytics
            </Link>
          </nav>

          {/* Desktop Single CTA Button */}
          <div className="hidden md:flex items-center">
            <a href={mailtoFreePilot}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20 font-medium cursor-pointer">
                Get a Free Pilot
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-neutral-950/95 backdrop-blur-xl px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-neutral-300">
              <Link
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="py-2 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#use-cases"
                onClick={closeMobileMenu}
                className="py-2 hover:text-white transition-colors"
              >
                Use Cases
              </Link>
              <Link
                href="#demo"
                onClick={closeMobileMenu}
                className="py-2 hover:text-white transition-colors"
              >
                Live Demo
              </Link>
              <Link
                href="#analytics"
                onClick={closeMobileMenu}
                className="py-2 hover:text-white transition-colors"
              >
                Analytics
              </Link>
            </nav>

            <div className="pt-2">
              <a href={mailtoFreePilot} onClick={closeMobileMenu} className="block w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/20 py-2.5">
                  Get a Free Pilot
                </Button>
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ========================================================= */}
        {/* 3. HERO SECTION                                          */}
        {/* ========================================================= */}
        <section className="pt-28 pb-16 md:pt-40 md:pb-24 px-6 relative overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none" />
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                INTERACTIVE SECOND-SCREEN EXPERIENCES FOR YOUTUBE
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight leading-[1.1] text-white">
                Turn Every YouTube Video into an{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Interactive Experience
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Let viewers scan a QR code to explore quizzes, sources, maps, 3D models and bonus content on their phones — while your video continues playing on TV.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a href={mailtoFreePilot} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-white text-neutral-950 hover:bg-neutral-200 font-semibold shadow-xl shadow-white/10 transition-all duration-200">
                    Get a Free Pilot <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 hover:text-white transition-all text-neutral-200">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-neutral-400 pt-1 font-medium">
                No app required. No coding. We can build your first experience for you.
              </p>
            </div>

            {/* Hero Visual Mockup: TV + QR Code + Smartphone + Neon Line */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-6 lg:pt-0">
              <div className="relative w-full max-w-lg">
                
                {/* TV Mockup Frame */}
                <div className="relative rounded-2xl bg-neutral-900 border border-white/15 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                  {/* TV Top Bar with status indicator */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] font-medium text-neutral-300">Smart TV • YouTube Playback</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Video Playing
                    </span>
                  </div>

                  {/* TV Screen Container */}
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/5 group">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-85"
                      src="/videos/film%20q-aris%20poziom%20napisy.mp4"
                    />

                    {/* QR Code in bottom-right corner of TV */}
                    <div className="absolute bottom-3 right-3 bg-neutral-950/90 border-2 border-blue-500/80 rounded-xl p-1.5 shadow-[0_0_20px_rgba(59,130,246,0.6)] backdrop-blur-md flex flex-col items-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg p-1 flex items-center justify-center">
                        <img 
                          src="/qr-demo.png" 
                          alt="On-screen QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-blue-400 mt-1 uppercase tracking-wider">
                        Scan with Phone
                      </span>
                    </div>
                  </div>

                  {/* TV Stand Base */}
                  <div className="w-32 h-2.5 bg-neutral-800 border-t border-white/10 mx-auto rounded-b-md mt-2 shadow-md"></div>
                </div>

                {/* Animated Visual Pulsing Connection Line */}
                <div 
                  className="absolute bottom-16 right-20 sm:right-28 w-24 sm:w-32 h-24 sm:h-28 border-b-2 border-r-2 border-dashed border-blue-400/80 rounded-br-3xl pointer-events-none -z-0 shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-pulse"
                  style={{ transform: "translate(30%, 30%)" }}
                  aria-hidden="true"
                />

                {/* Smartphone Second-Screen Mockup (Floating & Overlapping) */}
                <div className="absolute -bottom-8 -left-4 sm:-left-6 w-44 sm:w-52 rounded-3xl bg-neutral-950 border-[3px] border-neutral-700 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-2 backdrop-blur-xl z-20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  {/* Phone Speaker / Dynamic Island */}
                  <div className="w-16 h-3 bg-neutral-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-neutral-950 rounded-full"></div>
                  </div>

                  {/* Phone Screen Mockup Content */}
                  <div className="rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-black p-3 border border-white/10 space-y-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Second Screen
                      </span>
                      <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-mono">
                        Live
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-white leading-tight">Voyager 1 Interactive Dossier</h4>
                      <p className="text-[9px] text-neutral-400 line-clamp-2">Explorable 3D telemetry, flight trajectory & sound archives.</p>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-[9px] text-blue-200 flex items-center justify-between">
                      <span className="font-semibold">⚡ Quiz: Test Your Knowledge</span>
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. BENEFIT BAR                                            */}
        {/* ========================================================= */}
        <section className="border-y border-white/5 bg-neutral-900/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            
            {/* Item 1 */}
            <div className="flex flex-col gap-1.5 pt-4 sm:pt-0 sm:px-4 first:pl-0">
              <span className="text-sm font-extrabold tracking-wider text-white uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                NO APP REQUIRED
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Works directly in the mobile browser
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-1.5 pt-4 sm:pt-0 sm:px-4">
              <span className="text-sm font-extrabold tracking-wider text-white uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                ONE QR CODE
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect any video with interactive content
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-1.5 pt-4 sm:pt-0 sm:px-4">
              <span className="text-sm font-extrabold tracking-wider text-white uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                CREATOR-FRIENDLY
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We can build the first experience for you
              </p>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col gap-1.5 pt-4 sm:pt-0 sm:px-4 last:pr-0">
              <span className="text-sm font-extrabold tracking-wider text-white uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                MEASURABLE
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Track scans, sessions and engagement
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. PROBLEM SECTION                                        */}
        {/* ========================================================= */}
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                A SECOND SCREEN FOR YOUR CONTENT
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Your Video Does Not Have to End at the Screen
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                Viewers often want to explore a source, answer a question, see a map or learn more about something mentioned in a video. Q-ARIS gives them a simple way to continue the experience on their phones without interrupting the video playing on TV.
              </p>
            </div>

            {/* Contrasting Boxes */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              
              {/* Box 1: Standard Link */}
              <div className="p-8 rounded-2xl bg-neutral-900/50 border border-white/10 space-y-3 flex flex-col justify-center">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Traditional Approach
                </div>
                <h3 className="text-xl font-bold text-neutral-200">
                  A standard link
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  The viewer has to stop watching, open the description and search for the right link.
                </p>
              </div>

              {/* Box 2: Q-ARIS Experience (Highlighted Gradient) */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.15)] space-y-3 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Second-Screen Innovation
                </div>
                <h3 className="text-xl font-bold text-white">
                  A Q-ARIS experience
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  The viewer scans the code and instantly opens content designed specifically for that moment in the video.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. HOW IT WORKS                                           */}
        {/* ========================================================= */}
        <section id="how-it-works" className="py-24 md:py-32 px-6 bg-neutral-900/30 border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                HOW IT WORKS
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                From Video to Interaction in Three Steps
              </h2>
            </div>

            {/* 3 Numbered Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-4 hover:border-blue-500/40 transition-all duration-300 flex flex-col relative group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  Add a QR Code
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Place a Q-ARIS code on screen during the relevant part of your video.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all duration-300 flex flex-col relative group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Viewers Scan It
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  They scan the code with their phone camera. Nothing needs to be downloaded.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-4 hover:border-purple-500/40 transition-all duration-300 flex flex-col relative group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-lg font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  The Story Continues
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  The phone opens a quiz, map, gallery, source list, 3D model or another interactive experience.
                </p>
              </div>

            </div>

            {/* CTA Button Under Cards */}
            <div className="text-center pt-4">
              <a href={mailtoFreePilot}>
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all">
                  Get Your First Experience Built for Free
                </Button>
              </a>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. USE CASES                                              */}
        {/* ========================================================= */}
        <section id="use-cases" className="py-24 md:py-32 px-6 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                USE CASES
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                More Than a Link in the Description
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                Create a second layer of content that viewers can actively explore.
              </p>
            </div>

            {/* 6 Clean Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Card 1 */}
              <div className="p-7 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-blue-500/40 transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Bonus Content</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Give viewers access to additional images, videos, facts and behind-the-scenes materials.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-7 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Sources and Further Reading</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Organize references and supporting materials in a clear, mobile-friendly experience.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-7 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-purple-500/40 transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Quizzes and Polls</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Let viewers test their knowledge, answer questions and compare results.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-7 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Maps and Locations</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Turn travel, history and documentary videos into explorable routes and locations.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-7 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-amber-500/40 transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Box className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">3D and WebAR</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Allow viewers to inspect objects and models directly in their mobile browser.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-7 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-pink-500/40 transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Sponsor Activations</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Create measurable, interactive brand experiences instead of displaying only a logo or link.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. LIVE DEMO                                              */}
        {/* ========================================================= */}
        <section id="demo" className="py-24 md:py-32 bg-black border-t border-white/5 relative overflow-hidden">
          {/* Ambient light glow */}
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 space-y-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                LIVE DEMO
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Scan It. Experience It Yourself.
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                Play the video and scan the QR code with your phone camera to see how a Q-ARIS experience works. The interactive content opens directly in your browser.
              </p>
            </div>

            {/* Video + QR Grid (Mobile: Video above QR; Desktop: Video Left, QR Right) */}
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
              
              {/* Promo Video Player */}
              <div className="lg:col-span-8 w-full">
                <div className="relative rounded-2xl bg-neutral-900/80 border border-white/10 p-3.5 shadow-2xl overflow-hidden backdrop-blur-sm">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2.5 text-xs text-neutral-400 font-medium">
                    <span className="flex items-center gap-2 text-blue-400 font-semibold">
                      <Film className="w-4 h-4" /> Q-ARIS Video Demonstration
                    </span>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                      Demo Video
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/5">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover rounded-xl"
                      src="/videos/film%20q-aris%20poziom%20napisy.mp4"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>

              {/* QR Code Stand */}
              <div className="lg:col-span-4 flex items-center justify-center h-full">
                <div className="w-full max-w-[320px] bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-full aspect-square bg-white rounded-xl p-4 flex items-center justify-center overflow-hidden shadow-inner">
                    <img
                      src="/qr-demo.png"
                      alt="Q-ARIS Live Demo QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-400" /> Scan with your phone camera
                    </p>
                    <p className="text-xs text-neutral-400 font-medium">
                      No installation required
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. ANALYTICS                                              */}
        {/* ========================================================= */}
        <section id="analytics" className="py-24 md:py-32 px-6 border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                AUDIENCE ANALYTICS
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                See What Happens After the Scan
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                Q-ARIS shows how viewers interact with your experience, helping you understand which content captures attention and which paths they choose.
              </p>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
              
              {/* Left: Image */}
              <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl group">
                <img
                  src="/analytics.png"
                  alt="Q-ARIS Audience Analytics Dashboard"
                  className="w-full h-auto object-cover opacity-90 group-hover:scale-[1.01] transition-transform duration-500"
                />
              </div>

              {/* Right: 4 Bullet Points */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-4">
                  {[
                    "Unique visitor sessions",
                    "Page and stage views",
                    "Average session duration",
                    "Most popular interaction paths"
                  ].map((point, index) => (
                    <div key={index} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-900/50 border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-200">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-neutral-400 leading-relaxed pt-2 border-t border-white/10">
                  Use real engagement data to improve future videos and provide measurable results to sponsors.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 10. SPONSOR SECTION                                       */}
        {/* ========================================================= */}
        <section className="py-24 md:py-32 px-6 bg-neutral-900/30 border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                FOR CREATOR PARTNERSHIPS
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Give Sponsors More Than Screen Time
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                Q-ARIS can turn a standard sponsor mention into an interactive experience. Viewers can explore a product, answer a question, view additional materials or continue to a clear call to action.
              </p>
            </div>

            {/* 3 Elements Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              
              {/* Element 1 */}
              <div className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Interactive</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  The audience actively explores the sponsor content.
                </p>
              </div>

              {/* Element 2 */}
              <div className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Measurable</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  The creator can report scans, sessions and engagement.
                </p>
              </div>

              {/* Element 3 */}
              <div className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Customizable</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Each activation can match the video, creator and campaign.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 11. FREE PILOT CTA (HIGHLIGHTED)                         */}
        {/* ========================================================= */}
        <section className="py-20 md:py-28 px-6 relative">
          <div className="max-w-4xl mx-auto">
            
            {/* Box with strong gradient border */}
            <div className="relative rounded-3xl p-8 sm:p-12 md:p-14 bg-gradient-to-b from-blue-950/40 via-neutral-900/90 to-neutral-950 border-2 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.2)] text-center space-y-8 overflow-hidden">
              
              {/* Background ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  FREE CREATOR PILOT
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Choose One Video. We Will Build the Experience.
                </h2>
                <p className="text-neutral-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Send us one published or upcoming YouTube video. We will propose an interactive concept and prepare the first Q-ARIS experience for you free of charge.
                </p>
              </div>

              {/* 3 Short Points */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-sm text-neutral-300 font-medium relative z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>No technical setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>No app development</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>No commitment</span>
                </div>
              </div>

              {/* Main Button */}
              <div className="pt-2 relative z-10 space-y-3">
                <a href={mailtoFreePilotWithBody}>
                  <Button size="lg" className="h-13 px-9 text-base bg-white text-neutral-950 hover:bg-neutral-200 font-bold shadow-2xl transition-all cursor-pointer">
                    Request a Free Pilot <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <p className="text-xs text-neutral-400">
                  We only need a link to your channel or video to get started.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 12. FAQ                                                   */}
        {/* ========================================================= */}
        <section className="py-24 md:py-32 px-6 border-t border-white/5 relative">
          <div className="max-w-3xl mx-auto space-y-12">
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Frequently Asked Questions
              </h2>
            </div>

            {/* Accordion with exactly 5 items */}
            <Accordion type="single" collapsible className="w-full space-y-4">
              
              {/* Question 1 */}
              <AccordionItem value="item-1" className="rounded-xl border border-white/10 bg-neutral-900/50 px-6 py-1 data-[state=open]:border-blue-500/40 transition-colors">
                <AccordionTrigger className="text-left font-bold text-base text-white hover:no-underline py-4">
                  Does the viewer need to install an app?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-neutral-400 leading-relaxed pb-4">
                  No. The experience opens directly in the phone’s web browser after scanning the QR code.
                </AccordionContent>
              </AccordionItem>

              {/* Question 2 */}
              <AccordionItem value="item-2" className="rounded-xl border border-white/10 bg-neutral-900/50 px-6 py-1 data-[state=open]:border-blue-500/40 transition-colors">
                <AccordionTrigger className="text-left font-bold text-base text-white hover:no-underline py-4">
                  Do I need to build the experience myself?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-neutral-400 leading-relaxed pb-4">
                  No. For the free pilot, we will propose the concept and build the first experience for you.
                </AccordionContent>
              </AccordionItem>

              {/* Question 3 */}
              <AccordionItem value="item-3" className="rounded-xl border border-white/10 bg-neutral-900/50 px-6 py-1 data-[state=open]:border-blue-500/40 transition-colors">
                <AccordionTrigger className="text-left font-bold text-base text-white hover:no-underline py-4">
                  Can I use Q-ARIS in an existing video?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-neutral-400 leading-relaxed pb-4">
                  A clickable link can be added to the description, but an on-screen QR code needs to be included during editing or added to a future version of the video.
                </AccordionContent>
              </AccordionItem>

              {/* Question 4 */}
              <AccordionItem value="item-4" className="rounded-xl border border-white/10 bg-neutral-900/50 px-6 py-1 data-[state=open]:border-blue-500/40 transition-colors">
                <AccordionTrigger className="text-left font-bold text-base text-white hover:no-underline py-4">
                  What type of content can I add?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-neutral-400 leading-relaxed pb-4">
                  You can use text, images, video, audio, quizzes, galleries, maps, links, 3D models and WebAR elements.
                </AccordionContent>
              </AccordionItem>

              {/* Question 5 */}
              <AccordionItem value="item-5" className="rounded-xl border border-white/10 bg-neutral-900/50 px-6 py-1 data-[state=open]:border-blue-500/40 transition-colors">
                <AccordionTrigger className="text-left font-bold text-base text-white hover:no-underline py-4">
                  Can it be used for sponsored content?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-neutral-400 leading-relaxed pb-4">
                  Yes. Q-ARIS can create an interactive and measurable extension of a sponsored segment or brand integration.
                </AccordionContent>
              </AccordionItem>

            </Accordion>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 13. FINAL CTA                                             */}
        {/* ========================================================= */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-neutral-950 via-neutral-900/40 to-neutral-950 border-t border-white/5 relative text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Ready to Make Your Next Video Interactive?
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                Let us build the first experience and show you what Q-ARIS can add to your content.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a href={mailtoFreePilotWithBody} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all">
                  Get a Free Pilot <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Link href="/" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto h-12 px-6 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                  Explore the Main Q-ARIS Platform <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* 14. FOOTER                                                */}
      {/* ========================================================= */}
      <footer className="border-t border-white/5 bg-neutral-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/creators" aria-label="Q-ARIS Creators Home">
              <Logo />
            </Link>
            <span className="hidden sm:block text-neutral-700">|</span>
            <p className="text-xs text-neutral-500">
              Interactive storytelling for creators, venues and brands.
            </p>
          </div>

          {/* Footer Navigation Links */}
          <div className="flex items-center gap-6 text-xs text-neutral-400 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Main Platform
            </Link>
            <Link href="#demo" className="hover:text-white transition-colors">
              Creator Demo
            </Link>
            <a href="mailto:wojciech.kwoczak@mymetaskill.com" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/5 text-center text-[11px] text-neutral-600">
          © 2026 Q-ARIS Platform. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
