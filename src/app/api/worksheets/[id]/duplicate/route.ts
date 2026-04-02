import { createSupabaseServerClient } from '@/lib/supabase/server';
import { apiJsonError, withApiErrorHandling } from '@/lib/api/errors';
import { revalidatePath } from 'next/cache';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling('POST /api/worksheets/[id]/duplicate', async () => {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .select('title,subject,grade_level,content_json,layout_json,theme_json')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !worksheet) return apiJsonError('Worksheet not found', 404);

    const { data: copy, error: copyError } = await supabase
      .from('worksheets')
      .insert({
        user_id: user.id,
        title: `${worksheet.title} (Copy)`,
        subject: worksheet.subject,
        grade_level: worksheet.grade_level,
        content_json: worksheet.content_json,
        layout_json: worksheet.layout_json,
        theme_json: worksheet.theme_json,
        status: 'draft',
      })
      .select('id')
      .single();

    if (copyError) return apiJsonError(copyError.message, 500);

    // Ensure server-rendered dashboard lists reflect the new copy immediately.
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/worksheets');

    return Response.json({ id: copy.id }, { status: 201 });
  });
}
