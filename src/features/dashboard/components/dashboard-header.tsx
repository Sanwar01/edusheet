'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function DashboardHeader({ userName }: { userName?: string }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{userName ? `, ${userName}` : ''}. Here&apos;s what&apos;s
          happening with your worksheets.
        </p>
      </div>
      <Link
        href="/dashboard/worksheets/new"
        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
      >
        <Plus className="w-5 h-5 mr-2" /> Create New
      </Link>
    </div>
  );
}
