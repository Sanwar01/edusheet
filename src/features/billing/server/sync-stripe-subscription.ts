import 'server-only';

import { getStripeClient } from '@/lib/stripe/client';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type SyncStripeSubscriptionArgs = {
  userId: string;
  userEmail: string;
  existingCustomerId?: string | null;
};

export async function syncStripeSubscriptionForUser({
  userId,
  userEmail,
  existingCustomerId,
}: SyncStripeSubscriptionArgs) {
  const stripe = getStripeClient();
  const supabaseAdmin = getSupabaseAdminClient();

  let customerId = existingCustomerId ?? null;
  if (!customerId) {
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });
    customerId = customers.data[0]?.id ?? null;
  }

  if (!customerId) {
    return { synced: false, reason: 'no_customer' as const };
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1,
  });

  const latest = subscriptions.data[0] ?? null;
  if (!latest) {
    return { synced: false, reason: 'no_subscription' as const };
  }

  const periodStart = latest.items.data[0]?.current_period_start
    ? new Date(latest.items.data[0].current_period_start * 1000).toISOString()
    : null;
  const periodEnd = latest.items.data[0]?.current_period_end
    ? new Date(latest.items.data[0].current_period_end * 1000).toISOString()
    : null;
  const plan =
    latest.status === 'active' || latest.status === 'trialing' ? 'pro' : 'free';

  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: latest.id,
      plan,
      status: latest.status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: latest.cancel_at_period_end,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { synced: true, reason: 'updated' as const };
}
