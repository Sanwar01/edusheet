import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { insertAuditLog } from '@/lib/audit';
import { apiJsonError, handleUnknownError, logApiError, withApiErrorHandling } from '@/lib/api/errors';

export async function POST(req: Request) {
  return withApiErrorHandling('POST /api/stripe/webhook', async () => {
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdminClient();
    } catch (e) {
      return handleUnknownError('POST /api/stripe/webhook (Supabase admin)', e);
    }

    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');
    if (!signature) return apiJsonError('Missing signature', 400);

    if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
      return apiJsonError('Webhook secret is not configured.', 503);
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripeClient();
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return apiJsonError('Invalid webhook signature', 400);
    }

    const { error: insertError } = await supabaseAdmin.from('stripe_processed_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });

    const isDuplicate =
      insertError?.code === '23505' ||
      insertError?.message?.toLowerCase().includes('duplicate') ||
      insertError?.message?.toLowerCase().includes('unique');

    if (isDuplicate) {
      return Response.json({ received: true, duplicate: true });
    }

    if (insertError) {
      return apiJsonError(insertError.message, 500);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (userId) {
          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_customer_id: String(session.customer),
              stripe_subscription_id: String(session.subscription),
              plan: 'pro',
              status: 'active',
            },
            { onConflict: 'user_id' },
          );

          try {
            await insertAuditLog({
              userId,
              action: 'stripe.checkout.session.completed',
              resourceType: 'subscription',
              resourceId: String(session.subscription),
              metadata: { stripe_customer_id: String(session.customer) },
            });
          } catch (e) {
            logApiError('POST /api/stripe/webhook (audit checkout)', e);
          }
        }
      }

      if (
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted'
      ) {
        const sub = event.data.object as Stripe.Subscription;
        const periodStart = sub.items.data[0]?.current_period_start
          ? new Date(sub.items.data[0].current_period_start * 1000).toISOString()
          : null;
        const periodEnd = sub.items.data[0]?.current_period_end
          ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
          : null;

        const { data } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', String(sub.customer))
          .maybeSingle();

        if (data?.user_id) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_subscription_id: sub.id,
              plan: sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free',
              status: sub.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: sub.cancel_at_period_end,
            })
            .eq('user_id', data.user_id);

          try {
            await insertAuditLog({
              userId: data.user_id,
              action: `stripe.subscription.${event.type}`,
              resourceType: 'subscription',
              resourceId: sub.id,
              metadata: { status: sub.status },
            });
          } catch (e) {
            logApiError('POST /api/stripe/webhook (audit subscription)', e);
          }
        }
      }
    } catch (err) {
      await supabaseAdmin.from('stripe_processed_events').delete().eq('stripe_event_id', event.id);
      return handleUnknownError('POST /api/stripe/webhook (handler)', err);
    }

    return Response.json({ received: true });
  });
}
