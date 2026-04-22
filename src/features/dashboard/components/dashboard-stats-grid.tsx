'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Printer, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardStatsGridProps = {
  loading: boolean;
  isPro: boolean;
  plan?: string | null;
  generationLimit: number | null;
  exportLimit: number | null;
  worksheetCount: number;
  generationUsage: string;
  exportUsage: string;
};

export function DashboardStatsGrid({
  loading,
  isPro,
  plan,
  generationLimit,
  exportLimit,
  worksheetCount,
  generationUsage,
  exportUsage,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Worksheets
          </CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-bold font-display">{worksheetCount}</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            AI Generations
          </CardTitle>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-3xl font-bold font-display">{generationUsage}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPro
                  ? 'Unlimited'
                  : `of ${generationLimit ?? 0} limit this month`}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            PDF Exports
          </CardTitle>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Printer className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-3xl font-bold font-display">{exportUsage}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPro
                  ? 'Unlimited'
                  : `of ${exportLimit ?? 0} limit this month`}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card
        className={`border-border/50 shadow-sm ${!isPro ? 'bg-linear-to-br from-primary/5 to-accent/5' : 'bg-linear-to-br from-indigo-500 to-purple-600 text-white'}`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle
            className={`text-sm font-medium ${isPro ? 'text-white/80' : 'text-muted-foreground'}`}
          >
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-3xl font-bold font-display capitalize">
                {plan ?? 'free'}
              </div>
              {!isPro && (
                <Link
                  href="/dashboard/billing"
                  className="text-xs font-semibold text-primary mt-2 inline-flex items-center hover:underline"
                >
                  Upgrade to Pro <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
