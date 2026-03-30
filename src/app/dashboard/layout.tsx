import Link from 'next/link';
import { signOutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen'>
      <header className='border-b bg-white'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard' className='font-semibold'>
              EduSheet AI
            </Link>
            <Link href='/dashboard/worksheets' className='text-sm text-slate-600'>
              Worksheets
            </Link>
            <Link href='/dashboard/billing' className='text-sm text-slate-600'>
              Billing
            </Link>
          </div>
          <form action={signOutAction}>
            <Button type='submit' variant='outline'>
              Sign out
            </Button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
