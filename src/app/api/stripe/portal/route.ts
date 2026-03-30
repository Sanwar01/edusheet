import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';
import { apiJsonError, handleUnknownError, withApiErrorHandling } from '@/lib/api/errors';

export async function POST() {
  return withApiErrorHandling('POST /api/stripe/portal', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return apiJsonError('No Stripe customer found.', 400);
    }

    let stripe;
    try {
      stripe = getStripeClient();
    } catch (e) {
      return handleUnknownError('POST /api/stripe/portal (Stripe init)', e);
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      });

      if (!session.url) {
        return apiJsonError('Billing portal did not return a URL.', 502);
      }

      return Response.json({ url: session.url });
    } catch (e) {
      return handleUnknownError('POST /api/stripe/portal', e);
    }
  });
}
