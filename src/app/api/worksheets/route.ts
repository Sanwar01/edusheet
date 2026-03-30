import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateWorksheetSchema } from '@/lib/validators/worksheet';
import { apiJsonError, withApiErrorHandling } from '@/lib/api/errors';

export async function GET() {
  return withApiErrorHandling('GET /api/worksheets', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('worksheets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) return apiJsonError(error.message, 500);
    return Response.json({ data });
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling('POST /api/worksheets', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    const body = await req.json();
    const parsed = CreateWorksheetSchema.safeParse(body);
    if (!parsed.success) {
      return apiJsonError('Validation failed', 400, parsed.error.flatten());
    }

    const { data, error } = await supabase
      .from('worksheets')
      .insert({ user_id: user.id, ...parsed.data })
      .select('*')
      .single();

    if (error) return apiJsonError(error.message, 500);
    return Response.json({ data }, { status: 201 });
  });
}
