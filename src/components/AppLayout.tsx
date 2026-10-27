'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { ToastProvider } from '@/components/Toast';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#090d16] text-slate-100">
      <Navigation />
      <main className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {children}
      </main>
    </div>
  );
}
