import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function snapshotWorksheetVersion(params: {
  worksheetId: string;
  userId: string;
  content_json: unknown;
  layout_json: unknown;
  theme_json: unknown;
  version_label?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('worksheet_versions').insert({
    worksheet_id: params.worksheetId,
    user_id: params.userId,
    version_label: params.version_label ?? 'manual-save',
    content_json: params.content_json,
    layout_json: params.layout_json,
    theme_json: params.theme_json,
  });

  if (error) {
    throw new Error(error.message);
  }
}
