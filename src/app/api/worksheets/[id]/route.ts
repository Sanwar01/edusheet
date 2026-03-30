import { createSupabaseServerClient } from '@/lib/supabase/server';
import { UpdateWorksheetSchema } from '@/lib/validators/worksheet';
import { snapshotWorksheetVersion } from '@/features/worksheets/versioning';
import { apiJsonError, handleUnknownError, withApiErrorHandling } from '@/lib/api/errors';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling('GET /api/worksheets/[id]', async () => {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiJsonError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('worksheets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return apiJsonError('Worksheet not found', 404);
    return Response.json({ data });
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling('PATCH /api/worksheets/[id]', async () => {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiJsonError('Unauthorized', 401);

    const body = await req.json();
    const parsed = UpdateWorksheetSchema.safeParse(body);
    if (!parsed.success) {
      return apiJsonError('Validation failed', 400, parsed.error.flatten());
    }

    const { data, error } = await supabase
      .from('worksheets')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) return apiJsonError(error.message, 500);

    if (parsed.data.content_json && parsed.data.layout_json && parsed.data.theme_json) {
      try {
        await snapshotWorksheetVersion({
          worksheetId: id,
          userId: user.id,
          content_json: parsed.data.content_json,
          layout_json: parsed.data.layout_json,
          theme_json: parsed.data.theme_json,
          version_label: 'major-update',
        });
      } catch (e) {
        return handleUnknownError('PATCH /api/worksheets/[id] snapshot', e);
      }
    }

    return Response.json({ data });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling('DELETE /api/worksheets/[id]', async () => {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiJsonError('Unauthorized', 401);

    const { error } = await supabase.from('worksheets').delete().eq('id', id).eq('user_id', user.id);
    if (error) return apiJsonError(error.message, 500);
    return Response.json({ ok: true });
  });
}
