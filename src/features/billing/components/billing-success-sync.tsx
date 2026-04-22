'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function BillingSuccessSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === '1';

  useEffect(() => {
    if (!success) return;

    // Re-fetch server data after redirecting back from Stripe checkout.
    router.refresh();
    // Clean query params so this only runs once per checkout return.
    router.replace('/dashboard/billing');
  }, [router, success]);

  return null;
}
