'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';

export default function BillingPage() {
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function goToCheckout() {
    if (loadingCheckout) return;
    setLoadingCheckout(true);
    try {
      const json = await fetchJson<{ url?: string }>(
        '/api/stripe/checkout',
        { method: 'POST' },
        'Could not start checkout.',
      );
      if (json.url) window.location.href = json.url;
      else throw new Error('Checkout URL is missing.');
    } catch (error) {
      toast.error('Checkout failed', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function goToPortal() {
    if (loadingPortal) return;
    setLoadingPortal(true);
    try {
      const json = await fetchJson<{ url?: string }>(
        '/api/stripe/portal',
        { method: 'POST' },
        'Could not open billing portal.',
      );
      if (json.url) window.location.href = json.url;
      else throw new Error('Billing portal URL is missing.');
    } catch (error) {
      toast.error('Billing portal failed', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <main className='mx-auto max-w-2xl space-y-4 p-6'>
      <h1 className='text-2xl font-semibold'>Billing</h1>
      <p className='text-slate-600'>Upgrade to Pro for unlimited generations and exports.</p>
      <div className='flex gap-3'>
        <Button onClick={goToCheckout}>{loadingCheckout ? 'Loading...' : 'Upgrade to Pro'}</Button>
        <Button variant='outline' onClick={goToPortal}>{loadingPortal ? 'Loading...' : 'Manage billing'}</Button>
      </div>
    </main>
  );
}
