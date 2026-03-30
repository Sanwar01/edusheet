import Link from 'next/link';
import { requireUser } from '@/features/auth/guards';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { UpgradeBanner } from '@/components/dashboard/upgrade-banner';
import { Button } from '@/components/ui/button';
import { getMonthStartIso, isProPlan } from '@/features/billing/limits';

export default async function DashboardPage() {
  const { user, supabase } = await requireUser();
  const monthStart = getMonthStartIso();

  const [worksheetsCount, aiMonthCount, exportsMonthCount, subRes] = await Promise.all([
    supabase.from('worksheets').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
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
    supabase.from('subscriptions').select('plan,status').eq('user_id', user.id).maybeSingle(),
  ]);

  const plan = subRes.data?.plan ?? 'free';
  const pro = isProPlan(subRes.data?.plan, subRes.data?.status);

  return (
    <main className='space-y-6 p-6'>
      <h1 className='text-2xl font-semibold'>Dashboard</h1>
      {!pro && <UpgradeBanner />}
      <OverviewCards
        worksheets={worksheetsCount.count ?? 0}
        generationsThisMonth={aiMonthCount.count ?? 0}
        exportsThisMonth={exportsMonthCount.count ?? 0}
        plan={plan}
        isPro={pro}
      />
      <div className='flex flex-wrap gap-3'>
        <Button asChild>
          <Link href='/dashboard/worksheets/new'>Create worksheet</Link>
        </Button>
        <Button asChild variant='outline'>
          <Link href='/dashboard/worksheets'>View worksheets</Link>
        </Button>
        <Button asChild variant='outline'>
          <Link href='/dashboard/billing'>Billing</Link>
        </Button>
      </div>
    </main>
  );
}
