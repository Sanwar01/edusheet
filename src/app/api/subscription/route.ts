import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isProPlan } from '@/features/billing/limits';
import { apiJsonError, withApiErrorHandling } from '@/lib/api/errors';

export async function GET() {
  return withApiErrorHandling('GET /api/subscription', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan,status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return apiJsonError(error.message, 500);

    return Response.json({
      plan: data?.plan ?? 'free',
      status: data?.status ?? null,
      isPro: isProPlan(data?.plan, data?.status),
    });
  });
}
