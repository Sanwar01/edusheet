'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function goToCheckout() {
    setLoadingCheckout(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const json = await res.json();
    setLoadingCheckout(false);
    if (json.url) window.location.href = json.url;
  }

  async function goToPortal() {
    setLoadingPortal(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const json = await res.json();
    setLoadingPortal(false);
    if (json.url) window.location.href = json.url;
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
