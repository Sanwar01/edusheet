'use client';

import { Button } from '@/components/ui/button';

export default function WorksheetEditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-rose-700">
          Could not load worksheet editor
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {error.message || 'Please try opening the worksheet again.'}
        </p>
        <Button className="mt-4" onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
