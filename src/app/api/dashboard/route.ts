import { NextResponse } from 'next/server';
import { requireUser } from '@/features/auth/guards';
import { getDashboardData } from '@/features/dashboard/server/get-dashboard-data';

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireUser();
    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get('page') ?? 1);
    const pageSizeParam = Number(searchParams.get('pageSize') ?? 10);
    const page = Number.isFinite(pageParam) ? pageParam : 1;
    const pageSize = Number.isFinite(pageSizeParam) ? pageSizeParam : 10;

    const data = await getDashboardData({
      supabase,
      userId: user.id,
      page,
      pageSize,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch dashboard data', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 },
    );
  }
}
