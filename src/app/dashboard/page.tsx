import Link from 'next/link';
import { BookOpen, FileDown, Plus, Sparkles } from 'lucide-react';
import { requireUser } from '@/features/auth/guards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorksheetCard } from '@/components/worksheets/worksheet-card';
import { DashboardNavbar } from '@/components/dashboard/dashboard-navbar';
import { getDashboardData } from '@/features/dashboard/server/get-dashboard-data';

export default async function DashboardPage() {
  const { profile, user, supabase } = await requireUser();
  const { worksheets, worksheetCount, generationUsage, exportUsage } =
    await getDashboardData({
      supabase,
      userId: user.id,
    });

  return (
    <>
      <DashboardNavbar />
      <main className="container py-8">
        {/* Greeting */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your worksheets
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/worksheets/new">
              <Plus className="h-4 w-4" /> New Worksheet
            </Link>
          </Button>
        </div>
        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Worksheets
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {worksheetCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Generations
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{generationUsage}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exports
              </CardTitle>
              <FileDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {exportUsage}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Worksheet List */}
        <h2 className="mt-8 font-display text-lg font-semibold text-foreground">
          Your Worksheets
        </h2>
        {worksheets.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed bg-secondary/30 p-12 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No worksheets yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first AI-powered worksheet to get started.
            </p>
            <Button className="mt-4 gap-2" asChild>
              <Link href="/dashboard/worksheets/new">
                <Plus className="h-4 w-4" /> Create Worksheet
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {worksheets.map((ws) => (
              <WorksheetCard key={ws.id} worksheet={ws} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
