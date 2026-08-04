'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { LayoutDashboard, Users, Key, Library, Settings, Menu } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function MuseumLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/museum', icon: LayoutDashboard },
    { name: 'Curators', href: '/museum/curators', icon: Users },
    { name: 'License', href: '/museum/license', icon: Key },
    { name: 'Stories', href: '/museum/stories', icon: Library },
    { name: 'Settings', href: '/museum/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-neutral-950/50">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Logo />
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for overview, prefix match for others
            const isActive = item.href === '/museum' 
                ? pathname === '/museum'
                : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-medium' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/5">
           {/* Placeholder for user profile snippet if needed, for now just subtle text */}
           <div className="px-3 py-2 text-xs text-neutral-500">
             Museum Account
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between md:justify-end px-6 border-b border-white/5 bg-neutral-950/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center md:hidden">
            {/* Mobile menu button placeholder */}
            <button className="text-neutral-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="ml-4 scale-75 origin-left">
              <Logo />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
