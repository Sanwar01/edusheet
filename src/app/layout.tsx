import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { AppThemeProvider } from '@/components/theme/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground"
      >
        <AppThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <Sonner />
          </AuthProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
