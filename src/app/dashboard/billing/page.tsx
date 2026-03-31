import { requireUser } from '@/features/auth/guards';
import {
  FREE_PLAN_LIMITS,
  getMonthStartIso,
  isProPlan,
} from '@/features/billing/limits';
import { BillingActions } from '@/components/dashboard/billing-actions';

export default async function BillingPage() {
  const { user, supabase } = await requireUser();
  const monthStart = getMonthStartIso();

  const [{ data: subscription }, aiCountRes, exportCountRes] = await Promise.all([
    supabase
      .from('subscriptions')
      .select(
        'plan,status,current_period_end,cancel_at_period_end,stripe_customer_id',
      )
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthStart),
    supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthStart),
  ]);

  const isPro = isProPlan(subscription?.plan, subscription?.status);
  const canOpenPortal = Boolean(subscription?.stripe_customer_id);
  const aiUsage = aiCountRes.count ?? 0;
  const exportUsage = exportCountRes.count ?? 0;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <section className="rounded-xl border bg-white p-5">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your plan, trial, and Stripe billing.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Current plan
            </p>
            <p className="mt-1 text-lg font-semibold">{isPro ? 'Pro' : 'Free'}</p>
            <p className="mt-1 text-sm text-slate-600">
              Status: {subscription?.status ?? 'free'}
            </p>
            {subscription?.cancel_at_period_end ? (
              <p className="mt-1 text-sm text-amber-700">
                Your plan will cancel at period end.
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Monthly usage
            </p>
            <p className="mt-1 text-sm text-slate-700">
              AI generations:{' '}
              <span className="font-medium">
                {isPro ? aiUsage : `${aiUsage}/${FREE_PLAN_LIMITS.generationsPerMonth}`}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-700">
              PDF exports:{' '}
              <span className="font-medium">
                {isPro ? exportUsage : `${exportUsage}/${FREE_PLAN_LIMITS.exportsPerMonth}`}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Plans</h2>
        <p className="mt-1 text-sm text-slate-600">
          Free includes capped usage. Pro unlocks unlimited generations and
          exports.
        </p>
        <BillingActions isPro={isPro} canOpenPortal={canOpenPortal} />
      </section>
    </main>
  );
}
