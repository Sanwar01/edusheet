import { requireUser } from '@/features/auth/guards';
import {
  FREE_PLAN_LIMITS,
  getMonthStartIso,
  isProPlan,
} from '@/features/billing/limits';
import { BillingActions } from '@/components/dashboard/billing-actions';
import { syncStripeSubscriptionForUser } from '@/features/billing/server/sync-stripe-subscription';
import { BillingSuccessSync } from '@/features/billing/components/billing-success-sync';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; canceled?: string }>;
}) {
  const { user, supabase } = await requireUser();
  const params = await searchParams;
  const monthStart = getMonthStartIso();
  const checkoutSuccess = params?.success === '1';
  const checkoutCanceled = params?.canceled === '1';

  const [{ data: initialSubscription }, aiCountRes, exportCountRes] =
    await Promise.all([
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

  if (checkoutSuccess) {
    try {
      await syncStripeSubscriptionForUser({
        userId: user.id,
        userEmail: user.email ?? '',
        existingCustomerId: initialSubscription?.stripe_customer_id,
      });
    } catch {
      // Billing page still renders; webhook may update moments later.
    }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(
      'plan,status,current_period_end,cancel_at_period_end,stripe_customer_id',
    )
    .eq('user_id', user.id)
    .maybeSingle();

  const isPro = isProPlan(subscription?.plan, subscription?.status);
  const canOpenPortal = Boolean(subscription?.stripe_customer_id);
  const aiUsage = aiCountRes.count ?? 0;
  const exportUsage = exportCountRes.count ?? 0;

  return (
    <>
      <BillingSuccessSync />
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
          Billing & Plan
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      {checkoutSuccess ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Payment successful. Your subscription has been updated.
        </div>
      ) : null}
      {checkoutCanceled ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Checkout was canceled. You can try again anytime.
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
        {/* Current Plan Card */}
        <Card
          className={`border-2 ${isPro ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Current Plan:{' '}
              <span className="capitalize text-primary">
                {subscription?.plan || 'Free'}
              </span>
            </CardTitle>
            <CardDescription>
              {isPro
                ? 'You are on the Pro Educator plan.'
                : 'You are currently on the Free plan.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro && subscription?.current_period_end && (
              <div className="bg-secondary p-4 rounded-xl">
                <p className="text-sm font-medium">Next billing date</p>
                <p className="text-lg font-bold">
                  {format(
                    new Date(subscription.current_period_end),
                    'MMMM d, yyyy',
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status:{' '}
                  <span className="capitalize">{subscription.status}</span>
                </p>
              </div>
            )}
            {!isPro ? (
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-sm font-medium">This month usage</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI generations: {aiUsage}/
                  {FREE_PLAN_LIMITS.generationsPerMonth}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF exports: {exportUsage}/{FREE_PLAN_LIMITS.exportsPerMonth}
                </p>
              </div>
            ) : null}

            <ul className="space-y-3 mt-6">
              {isPro ? (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited
                    AI Generations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited
                    PDF Exports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Premium
                    Templates
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />{' '}
                    {FREE_PLAN_LIMITS.generationsPerMonth} AI Generations /
                    month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    {FREE_PLAN_LIMITS.exportsPerMonth} PDF Exports / month
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 opacity-50" /> Standard
                    features
                  </li>
                </>
              )}
            </ul>
          </CardContent>
          <CardFooter>
            <BillingActions isPro={isPro} canOpenPortal={canOpenPortal} />
          </CardFooter>
        </Card>

        {/* Upgrade Teaser for Free users */}
        {!isPro && (
          <Card className="bg-linear-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Pro
                </span>
                Unlock Everything
              </CardTitle>
              <CardDescription className="text-white/80">
                Take your teaching to the next level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-display mb-6">
                £10<span className="text-lg font-normal opacity-80">/mo</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Never
                  hit generation limits
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Export
                  unlimited PDFs
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Access
                  premium design themes
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Priority
                  email support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <BillingActions
                isPro={false}
                canOpenPortal={canOpenPortal}
                mode="upgradeOnly"
              />
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
