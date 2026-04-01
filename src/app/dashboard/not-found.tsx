import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Dashboard page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        That dashboard resource is unavailable. You can return to your main
        dashboard.
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
