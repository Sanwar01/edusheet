import 'server-only';

import Stripe from 'stripe';
import { requireServerEnv } from '@/lib/env';

export function getStripeClient() {
  const key = requireServerEnv('STRIPE_SECRET_KEY');
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
  });
}
