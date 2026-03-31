'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';

export function BillingActions({
  isPro,
  canOpenPortal,
}: {
  isPro: boolean;
  canOpenPortal: boolean;
}) {
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingTrial, setLoadingTrial] = useState(false);
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
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function startFreeTrial() {
    if (loadingTrial) return;
    setLoadingTrial(true);
    try {
      const json = await fetchJson<{ url?: string }>(
        '/api/stripe/checkout',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trial: true }),
        },
        'Could not start free trial.',
      );
      if (json.url) window.location.href = json.url;
      else throw new Error('Checkout URL is missing.');
    } catch (error) {
      toast.error('Free trial failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoadingTrial(false);
    }
  }

  async function goToPortal() {
    if (loadingPortal || !canOpenPortal) return;
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
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {!isPro ? (
        <>
          <Button onClick={goToCheckout} disabled={loadingCheckout}>
            {loadingCheckout ? 'Loading...' : 'Upgrade to Pro'}
          </Button>
          <Button
            variant="secondary"
            onClick={startFreeTrial}
            disabled={loadingTrial}
          >
            {loadingTrial ? 'Loading...' : 'Start Free Trial'}
          </Button>
        </>
      ) : (
        <p className="text-sm text-emerald-700">
          You are on Pro. Manage billing in the portal.
        </p>
      )}
      <Button
        variant="outline"
        onClick={goToPortal}
        disabled={!canOpenPortal || loadingPortal}
      >
        {loadingPortal ? 'Loading...' : 'Manage billing'}
      </Button>
    </div>
  );
}
