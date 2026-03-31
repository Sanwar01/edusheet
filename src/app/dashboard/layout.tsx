import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Crown, LogOut } from 'lucide-react';
import { requireUser } from '@/features/auth/guards';
import { signOutAction } from '@/features/auth/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  const isPro = profile?.plan === 'pro';

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-semibold">
              EduSheet AI
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Crown className="h-3.5 w-3.5 text-warning" /> Upgrade to Pro
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
      {children}
    </div>
  );
}
