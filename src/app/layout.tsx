import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Calorie Compass — AI Nutrition & Activity Intelligence',
  description:
    'Calorie Compass: AI Vision-based meal recognition, Mifflin-St Jeor TDEE calculations, exercise MET ledger, and generative culinary recipe engine.',
  keywords: ['calorie calculator', 'AI food logger', 'Mifflin-St Jeor', 'MET exercise tracker', 'macro counter'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
