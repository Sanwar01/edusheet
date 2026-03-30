import React from 'react';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FREE_PLAN_LIMITS, getMonthStartIso, isProPlan } from '@/features/billing/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { insertAuditLog } from '@/lib/audit';

const EXPORT_PER_MINUTE = 12;

type Content = {
  title: string;
  instructions: string;
  sections: Array<{ heading: string; questions: Array<{ prompt: string }> }>;
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12 },
  title: { fontSize: 20, marginBottom: 10 },
  heading: { fontSize: 14, marginTop: 12, marginBottom: 6 },
  question: { marginBottom: 6 },
});

function WorksheetPdf({ content }: { content: Content }) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text style={styles.title}>{content.title}</Text>
        <Text>{content.instructions}</Text>
        {content.sections.map((section, sectionIndex) => (
          <View key={`sec-${sectionIndex}`}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.questions.map((q, i) => (
              <Text key={`q-${sectionIndex}-${i}`} style={styles.question}>
                {i + 1}. {q.prompt}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(`export-pdf:${user.id}`, EXPORT_PER_MINUTE, 60_000)) {
    return NextResponse.json({ error: 'Too many export requests. Try again shortly.' }, { status: 429 });
  }

  const { worksheetId } = (await req.json()) as { worksheetId: string };
  if (!worksheetId) return NextResponse.json({ error: 'worksheetId required' }, { status: 400 });

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan,status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!isProPlan(sub?.plan, sub?.status)) {
    const { count } = await supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', getMonthStartIso());

    if ((count ?? 0) >= FREE_PLAN_LIMITS.exportsPerMonth) {
      return NextResponse.json({ error: 'Free plan export limit reached.' }, { status: 402 });
    }
  }

  const { data: worksheet, error } = await supabase
    .from('worksheets')
    .select('id, content_json')
    .eq('id', worksheetId)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 });

  const content = worksheet.content_json as Content;
  const pdfBuffer = await renderToBuffer(<WorksheetPdf content={content} />);

  await supabase.from('exports').insert({
    user_id: user.id,
    worksheet_id: worksheetId,
    format: 'pdf',
  });

  await insertAuditLog({
    userId: user.id,
    action: 'worksheet.export_pdf',
    resourceType: 'worksheet',
    resourceId: worksheetId,
    metadata: { format: 'pdf' },
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${worksheetId}.pdf"`,
    },
  });
}
