import { notFound } from 'next/navigation';
import { requireUser } from '@/features/auth/guards';
import { EditorShell } from '@/components/worksheets/editor-shell';
import { buildLayout } from '@/features/worksheets/defaults';
import {
  LayoutSchema,
  ThemeSchema,
  WorksheetContentSchema,
} from '@/lib/validators/worksheet';

export default async function WorksheetEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, supabase } = await requireUser();

  const { data: worksheet, error } = await supabase
    .from('worksheets')
    .select('id,title,content_json,theme_json,layout_json')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return notFound();
  const parsedContent = WorksheetContentSchema.safeParse(worksheet.content_json);
  const parsedTheme = ThemeSchema.safeParse(worksheet.theme_json);
  const parsedLayout = LayoutSchema.safeParse(worksheet.layout_json);
  if (!parsedContent.success || !parsedTheme.success) return notFound();
  const initialLayout = parsedLayout.success
    ? parsedLayout.data
    : buildLayout(parsedContent.data);

  return (
    <EditorShell
      worksheetId={worksheet.id}
      initialContent={parsedContent.data}
      initialTheme={parsedTheme.data}
      initialLayout={initialLayout}
    />
  );
}
