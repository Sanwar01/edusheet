'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import {
  Sparkles,
  PlusCircle,
  LogOut,
  CreditCard,
  LayoutDashboard,
  FileText,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/context/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const isWorksheetEditorRoute =
    /^\/dashboard\/worksheets\/[^/]+(?:\/edit)?$/.test(pathname);
  const [planLabel, setPlanLabel] = useState<'Pro Plan' | 'Free Plan'>(
    user?.user_metadata.plan === 'pro' ? 'Pro Plan' : 'Free Plan',
  );

  useEffect(() => {
    let active = true;

    async function loadSubscriptionStatus() {
      try {
        const res = await fetch('/api/subscription', {
          method: 'GET',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = (await res.json()) as { isPro?: boolean };
        if (!active) return;
        setPlanLabel(json.isPro ? 'Pro Plan' : 'Free Plan');
      } catch {
        // Keep fallback label from auth metadata when request fails.
      }
    }

    loadSubscriptionStatus();
    return () => {
      active = false;
    };
  }, [pathname]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Worksheets', href: '/dashboard/worksheets', icon: FileText },
    { label: 'Billing & Plan', href: '/dashboard/billing', icon: CreditCard },
  ];

  const navLinks = (
    <div className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`}
            />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  if (isWorksheetEditorRoute) {
    return (
      <div className="min-h-screen w-full bg-background">
        <main className="w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background/50 backdrop-blur-xl h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            EduSheet AI
          </span>
        </div>

        <div className="px-4 mb-4">
          <Link
            href="/dashboard/worksheets/new"
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4" />
            New Worksheet
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">{navLinks}</div>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-background mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {user?.user_metadata.full_name?.charAt(0) ||
                user?.email?.charAt(0) ||
                'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.user_metadata.full_name || 'Teacher'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {planLabel}
              </p>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between rounded-xl bg-background px-3 py-2">
            <span className="text-sm text-muted-foreground">Appearance</span>
            <ThemeToggle className="h-8 w-8" />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg">EduSheet AI</span>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col">
              <div className="p-6 border-b">
                <span className="font-display font-bold text-xl">Menu</span>
              </div>
              <div className="p-4">
                <Link
                  href="/dashboard/worksheets/new"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium mb-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Worksheet
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto">{navLinks}</div>
              <div className="border-t p-4">
                <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    Appearance
                  </span>
                  <ThemeToggle className="h-8 w-8" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
          <div className="max-w-6xl mx-auto ">{children}</div>
        </main>
      </div>
    </div>
  );
}
