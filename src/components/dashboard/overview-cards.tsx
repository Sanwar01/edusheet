import { Card } from '@/components/ui/card';
import { FREE_PLAN_LIMITS } from '@/features/billing/limits';

export function OverviewCards({
  worksheets,
  generationsThisMonth,
  exportsThisMonth,
  plan,
  isPro,
}: {
  worksheets: number;
  generationsThisMonth: number;
  exportsThisMonth: number;
  plan: string;
  isPro: boolean;
}) {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <p className='text-sm text-slate-500'>Worksheets created</p>
        <p className='text-2xl font-bold'>{worksheets}</p>
      </Card>
      <Card>
        <p className='text-sm text-slate-500'>AI generations (this month)</p>
        <p className='text-2xl font-bold'>
          {generationsThisMonth}
          {!isPro && (
            <span className='text-base font-normal text-slate-500'>
              {' '}
              / {FREE_PLAN_LIMITS.generationsPerMonth}
            </span>
          )}
        </p>
      </Card>
      <Card>
        <p className='text-sm text-slate-500'>Current plan</p>
        <p className='text-2xl font-bold capitalize'>{plan}</p>
        {!isPro && (
          <p className='mt-1 text-xs text-slate-500'>
            Exports this month: {exportsThisMonth} / {FREE_PLAN_LIMITS.exportsPerMonth}
          </p>
        )}
      </Card>
    </div>
  );
}
