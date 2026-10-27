'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  Compass,
  LayoutDashboard,
  Camera,
  Search,
  Activity,
  Sparkles,
  History,
  User,
  LogOut,
  Flame,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Vision Logger', href: '/food-logger', icon: Camera, badge: 'AI' },
  { name: 'Food Search', href: '/food-search', icon: Search },
  { name: 'Exercise Ledger', href: '/exercise', icon: Activity },
  { name: 'AI Recipe Engine', href: '/recipes', icon: Sparkles, badge: 'GenAI' },
  { name: 'History & Logs', href: '/history', icon: History },
  { name: 'Profile & Goals', href: '/profile', icon: User },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, isConfigured } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 bg-slate-950/80 border-r border-slate-800/80 backdrop-blur-xl p-5 z-30">
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Calorie Compass</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-medium">AI Nutrition & Activity</p>
          </div>
        </Link>

        {/* STATUS PILL */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mode: {isConfigured ? 'Live Supabase' : 'Local / Demo'}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
            Active
          </span>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      item.badge === 'GenAI'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE CARD */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 uppercase">
                  {profile?.full_name ? profile.full_name.charAt(0) : user?.email?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate max-w-[120px]">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Guest User'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                    {user?.email || 'Demo Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            {profile && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Target:
                </span>
                <span className="font-semibold text-slate-200">{profile.target_calories} kcal</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base text-white">Calorie Compass</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
          >
            <User className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-300 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-2 flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium ${
            pathname === '/dashboard' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/food-logger"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium ${
            pathname === '/food-logger' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <div className="w-9 h-9 -mt-4 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <span>Scan</span>
        </Link>
        <Link
          href="/food-search"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium ${
            pathname === '/food-search' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Foods</span>
        </Link>
        <Link
          href="/exercise"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium ${
            pathname === '/exercise' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span>Exercise</span>
        </Link>
        <Link
          href="/recipes"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium ${
            pathname === '/recipes' ? 'text-purple-400' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>AI Recipes</span>
        </Link>
        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium ${
            pathname === '/history' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </Link>
      </nav>
    </>
  );
}
