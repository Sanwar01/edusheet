import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FREE_PLAN_LIMITS, getMonthStartIso, isProPlan } from '@/features/billing/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { insertAuditLog } from '@/lib/audit';
import { apiJsonError, handleUnknownError, logApiError, withApiErrorHandling } from '@/lib/api/errors';
import type { QuestionType, WorksheetTheme } from '@/types/worksheet';

const EXPORT_PER_MINUTE = 12;

type Content = {
  title: string;
  instructions: string;
  sections: Array<{
    heading: string;
    questions: Array<{
      prompt: string;
      answer?: string;
      options?: string[];
      points?: number;
      question_type?: QuestionType;
    }>;
  }>;
};

type LayoutJson = { spacingPreset?: WorksheetTheme['spacingPreset'] };

const fontFamilyMap: Record<WorksheetTheme['fontFamily'], 'Helvetica' | 'Times-Roman'> = {
  inter: 'Helvetica',
  nunito: 'Helvetica',
  lora: 'Times-Roman',
};

const spacingMap: Record<WorksheetTheme['spacingPreset'], { sectionGap: number; questionGap: number }> = {
  compact: { sectionGap: 8, questionGap: 4 },
  comfortable: { sectionGap: 12, questionGap: 8 },
  spacious: { sectionGap: 18, questionGap: 12 },
};

function sanitizeFilename(name: string) {
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : 'worksheet';
}

async function buildPdfResponse({
  requestName,
  worksheetId,
}: {
  requestName: string;
  worksheetId?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiJsonError('Unauthorized', 401);

  if (!checkRateLimit(`export-pdf:${user.id}`, EXPORT_PER_MINUTE, 60_000)) {
    return apiJsonError('Too many export requests. Try again shortly.', 429);
  }

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
    .select('id, content_json, theme_json, layout_json')
    .eq('id', worksheetId)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return apiJsonError('Worksheet not found', 404);

  const content = worksheet.content_json as Content;
  const theme = (worksheet.theme_json as WorksheetTheme | null) ?? {
    headingFontSize: 20,
    bodyFontSize: 12,
    fontFamily: 'inter',
    primaryColor: '#0f172a',
    textColor: '#111827',
    spacingPreset: 'comfortable',
  };
  const layout = (worksheet.layout_json as LayoutJson | null) ?? {};

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      <WorksheetPdf content={content} theme={theme} layout={layout} />,
    );
  } catch (e) {
    return handleUnknownError(`${requestName} /api/exports/pdf (render)`, e);
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
    logApiError(`${requestName} /api/exports/pdf (audit)`, e);
  }

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${sanitizeFilename(content.title || worksheetId)}.pdf"`,
    },
  });
}

function createPdfStyles(theme: WorksheetTheme, layout: LayoutJson) {
  const spacingPreset = layout.spacingPreset ?? theme.spacingPreset;
  const spacing = spacingMap[spacingPreset];

  return StyleSheet.create({
    page: {
      padding: 32,
      fontSize: theme.bodyFontSize,
      fontFamily: fontFamilyMap[theme.fontFamily],
      color: theme.textColor,
    },
    title: {
      fontSize: theme.headingFontSize,
      marginBottom: 10,
      color: theme.primaryColor,
      fontFamily: fontFamilyMap[theme.fontFamily],
    },
    instructions: {
      marginBottom: spacing.sectionGap,
      color: theme.textColor,
    },
    section: {
      marginTop: spacing.sectionGap,
      marginBottom: 2,
    },
    heading: {
      fontSize: Math.max(theme.bodyFontSize + 2, 13),
      marginBottom: 6,
      color: theme.primaryColor,
      fontFamily: fontFamilyMap[theme.fontFamily],
    },
    questionBlock: {
      marginBottom: spacing.questionGap,
    },
    question: {
      marginBottom: 3,
      color: theme.textColor,
    },
    meta: {
      fontSize: Math.max(theme.bodyFontSize - 2, 9),
      color: '#64748b',
      marginBottom: 2,
    },
    option: {
      marginLeft: 12,
      marginBottom: 2,
      color: theme.textColor,
    },
    answerLabel: {
      fontSize: Math.max(theme.bodyFontSize - 2, 9),
      color: '#334155',
      marginTop: 2,
    },
  });
}

function WorksheetPdf({
  content,
  theme,
  layout,
}: {
  content: Content;
  theme: WorksheetTheme;
  layout: LayoutJson;
}) {
  const styles = createPdfStyles(theme, layout);
  let questionNumber = 1;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.instructions}>{content.instructions}</Text>
        {content.sections.map((section, sectionIndex) => (
          <View key={`sec-${sectionIndex}`} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.questions.map((q, i) => {
              const currentNumber = questionNumber++;
              return (
                <View key={`q-${sectionIndex}-${i}`} style={styles.questionBlock}>
                  <Text style={styles.question}>
                    {currentNumber}. {q.prompt}
                  </Text>
                  <Text style={styles.meta}>
                    Type: {(q.question_type ?? 'short_answer').replaceAll('_', ' ')} | Points: {q.points ?? 1}
                  </Text>
                  {(q.options ?? []).map((option, optionIndex) => (
                    <Text key={`opt-${sectionIndex}-${i}-${optionIndex}`} style={styles.option}>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </Text>
                  ))}
                  {q.answer ? (
                    <Text style={styles.answerLabel}>Answer: {q.answer}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function POST(req: Request) {
  return withApiErrorHandling('POST /api/exports/pdf', async () => {
    const payload = (await req.json()) as { worksheetId?: string };
    return buildPdfResponse({ requestName: 'POST', worksheetId: payload.worksheetId });
  });
}

export async function GET(req: Request) {
  return withApiErrorHandling('GET /api/exports/pdf', async () => {
    const { searchParams } = new URL(req.url);
    const worksheetId = searchParams.get('worksheetId') ?? undefined;
    return buildPdfResponse({ requestName: 'GET', worksheetId });
  });
}
