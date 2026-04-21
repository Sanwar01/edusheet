'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Copy,
  Edit,
  FileText,
  MoreVertical,
  Plus,
  Printer,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { FREE_PLAN_LIMITS, isProPlan } from '@/features/billing/limits';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { useAuth } from '@/context/auth';

type DashboardProfile = {
  plan?: string | null;
  status?: string | null;
} | null;

export function DashboardPageContent({
  profile,
}: {
  profile: DashboardProfile;
}) {
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  } = useDashboardData();
  const isPro = isProPlan(profile?.plan, profile?.status);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const worksheets = data?.worksheets ?? [];
  const worksheetCount = data?.worksheetCount ?? 0;
  const generationUsage = data?.generationUsage ?? '0/5';
  const exportUsage = data?.exportUsage ?? '0/5';

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.user_metadata.full_name}. Here&apos;s
            what&apos;s happening with your worksheets.
          </p>
        </div>
        <Link
          href="/dashboard/worksheets/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Create New
        </Link>
      </div>

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
              <div className="text-3xl font-bold font-display">
                {worksheetCount}
              </div>
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
                <div className="text-3xl font-bold font-display">
                  {generationUsage}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPro
                    ? 'Unlimited'
                    : `of ${FREE_PLAN_LIMITS.generationsPerMonth} limit this month`}
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
                <div className="text-3xl font-bold font-display">
                  {exportUsage}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPro
                    ? 'Unlimited'
                    : `of ${FREE_PLAN_LIMITS.exportsPerMonth} limit this month`}
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
                  {profile?.plan ?? 'free'}
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

      <h2 className="text-xl font-bold font-display tracking-tight text-foreground mb-4">
        Recent Worksheets
      </h2>
      
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : worksheets.length > 0 ? (
          <>
            <div className="divide-y">
              {worksheets.map((ws) => (
                <div
                  key={ws.id}
                  className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/worksheets/${ws.id}/edit`}
                        className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                      >
                        {ws.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                        {ws.subject && (
                          <span className="bg-secondary px-2 py-0.5 rounded-md">
                            {ws.subject}
                          </span>
                        )}
                        {ws.grade_level && (
                          <span className="bg-secondary px-2 py-0.5 rounded-md">
                            {ws.grade_level}
                          </span>
                        )}
                        <span>{format(new Date(ws.updated_at), 'MMM d, yyyy')}</span>
                        <span
                          className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-md ${
                            ws.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ws.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/worksheets/${ws.id}/edit`}
                      className="hidden sm:inline-flex h-9 px-4 items-center justify-center rounded-lg border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Edit
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/worksheets/${ws.id}/edit`}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit Worksheet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 cursor-pointer"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to delete this worksheet?',
                              )
                            ) {
                              // TODO: wire up delete action.
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No worksheets yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t created any worksheets. Generate your first one
              with AI in seconds.
            </p>
            <Link
              href="/dashboard/worksheets/new"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md"
            >
              Create First Worksheet
            </Link>
          </div>
        )}
      </Card>
    </>
  );
}
