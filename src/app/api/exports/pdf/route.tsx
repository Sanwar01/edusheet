import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FREE_PLAN_LIMITS, getMonthStartIso, isProPlan } from '@/features/billing/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { insertAuditLog } from '@/lib/audit';
import { apiJsonError, handleUnknownError, logApiError, withApiErrorHandling } from '@/lib/api/errors';

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
  return withApiErrorHandling('POST /api/exports/pdf', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    if (!checkRateLimit(`export-pdf:${user.id}`, EXPORT_PER_MINUTE, 60_000)) {
      return apiJsonError('Too many export requests. Try again shortly.', 429);
    }

    const payload = (await req.json()) as { worksheetId?: string };
    const worksheetId = payload.worksheetId;
    if (!worksheetId) return apiJsonError('worksheetId required', 400);

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
        return apiJsonError('Free plan export limit reached.', 402);
      }
    }

    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .select('id, content_json')
      .eq('id', worksheetId)
      .eq('user_id', user.id)
      .single();

    if (error || !worksheet) return apiJsonError('Worksheet not found', 404);

    const content = worksheet.content_json as Content;

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(<WorksheetPdf content={content} />);
    } catch (e) {
      return handleUnknownError('POST /api/exports/pdf (render)', e);
    }

    const { error: insertExportError } = await supabase.from('exports').insert({
      user_id: user.id,
      worksheet_id: worksheetId,
      format: 'pdf',
    });

    if (insertExportError) {
      return apiJsonError(insertExportError.message, 500);
    }

    try {
      await insertAuditLog({
        userId: user.id,
        action: 'worksheet.export_pdf',
        resourceType: 'worksheet',
        resourceId: worksheetId,
        metadata: { format: 'pdf' },
      });
    } catch (e) {
      logApiError('POST /api/exports/pdf (audit)', e);
    }

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${worksheetId}.pdf"`,
      },
    });
  });
}
