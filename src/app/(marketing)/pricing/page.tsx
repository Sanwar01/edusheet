import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PricingPage() {
  return (
    <main className='mx-auto max-w-5xl px-6 py-16'>
      <h1 className='text-4xl font-bold'>Pricing</h1>
      <div className='mt-8 grid gap-4 md:grid-cols-2'>
        <Card>
          <h2 className='text-xl font-semibold'>Free</h2>
          <p className='mt-2 text-slate-600'>10 AI generations/month, 5 exports/month</p>
          <Button asChild className='mt-4'>
            <Link href='/sign-up'>Get started</Link>
          </Button>
        </Card>
        <Card>
          <h2 className='text-xl font-semibold'>Pro</h2>
          <p className='mt-2 text-slate-600'>Unlimited generations and exports</p>
          <Button asChild variant='outline' className='mt-4'>
            <Link href='/sign-up'>Start trial</Link>
          </Button>
        </Card>
      </div>
    </main>
  );
}
