import { signOutAction } from '@/features/auth/actions';
import { Crown, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { requireUser } from '@/features/auth/guards';
import Link from 'next/link';
import { isProPlan } from '@/features/billing/limits';

export const DashboardNavbar = async () => {
  const { user, supabase } = await requireUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan,status')
    .eq('user_id', user.id)
    .maybeSingle();
  const isPro = isProPlan(subscription?.plan, subscription?.status);
  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            EduSheet AI
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {!isPro && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              asChild
            >
              <Link href="/dashboard/billing">
                <Crown className="h-3.5 w-3.5 text-warning" /> Upgrade to Pro
              </Link>
            </Button>
          )}
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};
