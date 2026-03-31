import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'EduSheet AI',
  description: 'AI worksheet builder for teachers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900"
      >
        <AuthProvider>
          {children}
          <Toaster />
          <Sonner />
        </AuthProvider>
      </body>
    </html>
  );
}
