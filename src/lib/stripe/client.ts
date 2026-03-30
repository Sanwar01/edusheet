import Stripe from 'stripe';

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
  });
}
