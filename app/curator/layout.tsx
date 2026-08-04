'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { LayoutDashboard, Library, Image as ImageIcon, QrCode, Settings, Menu, Plus } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { CreateStoryDialog } from '@/components/admin/CreateStoryDialog';

export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/curator', icon: LayoutDashboard },
    { name: 'Stories', href: '/curator/stories', icon: Library },
    { name: 'Media Library', href: '/curator/media', icon: ImageIcon },
    { name: 'Settings', href: '/curator/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-neutral-950/50">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Logo />
        </div>
        
        <div className="p-4 mt-2">
            <CreateStoryDialog customTrigger={
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 font-medium py-2.5 px-4 rounded-lg transition-all active:scale-[0.98]">
                    <Plus className="w-4 h-4" />
                    <span>Create Story</span>
                </button>
            }/>
        </div>

        <div className="flex-1 py-2 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/curator' 
                ? pathname === '/curator'
                : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-purple-500/10 text-purple-400 font-medium' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-neutral-900/20">
           <div className="flex items-center gap-3 px-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
               C
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-medium text-white">Curator</span>
               <span className="text-xs text-neutral-500">Workspace</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between md:justify-end px-6 border-b border-white/5 bg-neutral-950/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center md:hidden">
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
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
