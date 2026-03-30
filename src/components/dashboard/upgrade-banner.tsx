import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UpgradeBanner() {
  return (
    <div className='flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <p className='font-medium text-amber-950'>Unlock Pro</p>
        <p className='text-sm text-amber-900/80'>
          Unlimited AI worksheet generations and PDF exports. Upgrade when you are ready.
        </p>
      </div>
      <Button asChild>
        <Link href='/dashboard/billing'>View plans</Link>
      </Button>
    </div>
  );
}
