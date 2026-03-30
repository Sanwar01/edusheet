import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: worksheet, error } = await supabase
    .from('worksheets')
    .select('title,subject,grade_level,content_json,layout_json,theme_json')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 });

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

  if (copyError) return NextResponse.json({ error: copyError.message }, { status: 500 });
  return NextResponse.json({ id: copy.id }, { status: 201 });
}
