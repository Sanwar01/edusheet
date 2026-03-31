import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';
import { apiJsonError, handleUnknownError, withApiErrorHandling } from '@/lib/api/errors';

const TRIAL_DAYS = 7;

export async function POST(req: Request) {
  return withApiErrorHandling('POST /api/stripe/checkout', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return apiJsonError('Unauthorized', 401);

    if (!process.env.STRIPE_PRO_PRICE_ID?.trim()) {
      return apiJsonError('Billing is not configured (missing STRIPE_PRO_PRICE_ID).', 503);
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id,stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let wantsTrial = false;
    try {
      const body = (await req.json()) as { trial?: boolean };
      wantsTrial = Boolean(body?.trial);
    } catch {
      wantsTrial = false;
    }

    if (wantsTrial && sub?.stripe_subscription_id) {
      return apiJsonError('Free trial is only available for first-time upgrades.', 409);
    }

    let stripe;
    try {
      stripe = getStripeClient();
    } catch (e) {
      return handleUnknownError('POST /api/stripe/checkout (Stripe init)', e);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: sub?.stripe_customer_id ?? undefined,
        customer_email: sub?.stripe_customer_id ? undefined : user.email,
        line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=1`,
        metadata: { user_id: user.id, flow: wantsTrial ? 'trial' : 'upgrade' },
        subscription_data: wantsTrial ? { trial_period_days: TRIAL_DAYS } : undefined,
      });

      if (!session.url) {
        return apiJsonError('Checkout session did not return a URL.', 502);
      }

      return Response.json({ url: session.url });
    } catch (e) {
      return handleUnknownError('POST /api/stripe/checkout', e);
    }
  });
}
