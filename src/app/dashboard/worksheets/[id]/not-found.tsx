import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WorksheetNotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Worksheet not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        This worksheet may have been deleted or you may not have access to it.
      </p>
      <div className="mt-5 flex gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/worksheets">All worksheets</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
