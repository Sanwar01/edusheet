'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container py-12">
      <div className="mx-auto max-w-lg rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-rose-700">
          Could not load dashboard
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'Please try again in a moment.'}
        </p>
        <Button className="mt-4" onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
