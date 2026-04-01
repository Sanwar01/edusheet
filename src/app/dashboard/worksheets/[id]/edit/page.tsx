import { notFound } from 'next/navigation';
import { requireUser } from '@/features/auth/guards';
import { EditorShell } from '@/components/worksheets/editor-shell';
import { ThemeSchema, WorksheetContentSchema } from '@/lib/validators/worksheet';

export default async function WorksheetEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, supabase } = await requireUser();

  const { data: worksheet, error } = await supabase
    .from('worksheets')
    .select('id,title,content_json,theme_json')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return notFound();
  const parsedContent = WorksheetContentSchema.safeParse(worksheet.content_json);
  const parsedTheme = ThemeSchema.safeParse(worksheet.theme_json);
  if (!parsedContent.success || !parsedTheme.success) return notFound();

  return (
    <EditorShell
      worksheetId={worksheet.id}
      initialContent={parsedContent.data}
      initialTheme={parsedTheme.data}
    />
  );
}
