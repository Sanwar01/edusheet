import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppNotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
