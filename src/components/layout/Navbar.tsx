'use client';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const navItems: { label: string; href: string }[] = [
  { label: 'Product', href: '/product' },
  { label: 'Templates', href: '/templates' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Schools', href: '/schools' },
];

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-white">
            E
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              EduSheet AI
            </div>
            <div className="text-lg font-semibold tracking-tight text-slate-950">
              Worksheet creator for educators
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/sign-in">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
