import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  FREE_PLAN_LIMITS,
  getMonthStartIso,
  isProPlan,
} from '@/features/billing/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { insertAuditLog } from '@/lib/audit';
import {
  apiJsonError,
  handleUnknownError,
  logApiError,
  withApiErrorHandling,
} from '@/lib/api/errors';
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

function sanitizeFilename(name: string) {
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : 'worksheet';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function spacingPx(spacingPreset: WorksheetTheme['spacingPreset']) {
  if (spacingPreset === 'compact') return 8;
  if (spacingPreset === 'spacious') return 24;
  return 16;
}

function htmlFontFamily(fontFamily: WorksheetTheme['fontFamily']) {
  if (fontFamily === 'lora') return 'Lora, serif';
  if (fontFamily === 'nunito') return 'Nunito, sans-serif';
  return 'Inter, sans-serif';
}

function buildPrintableHtml({
  content,
  theme,
  worksheetId,
  includeAnswerKey,
}: {
  content: Content;
  theme: WorksheetTheme;
  worksheetId: string;
  includeAnswerKey: boolean;
}) {
  const spacing = spacingPx(theme.spacingPreset);
  const safeTitle = escapeHtml(content.title || worksheetId);
  const safeInstructions = escapeHtml(content.instructions || '');

  const sectionsHtml = (content.sections ?? [])
    .map((section, sectionIndex) => {
      const safeHeading = escapeHtml(section.heading || '');
      const sectionPoints = (section.questions ?? []).reduce(
        (sum, q) => sum + (q.points ?? 0),
        0,
      );
      const questionsHtml = (section.questions ?? [])
        .map((q, index) => {
          const safePrompt = escapeHtml(q.prompt || '');
          const optionsHtml = (q.options ?? [])
            .map(
              (option, optionIndex) =>
                `<div class="option">${String.fromCharCode(65 + optionIndex)}) ${escapeHtml(option)}</div>`,
            )
            .join('');

          const trueFalseBlock =
            q.question_type === 'true_false'
              ? '<div class="options"><div class="option">○ True</div><div class="option">○ False</div></div>'
              : '';
          const fillBlankBlock =
            q.question_type === 'fill_in_blank'
              ? '<div class="line-answer"></div>'
              : '';
          const textAnswerBlock =
            q.question_type === 'short_answer' || q.question_type === 'essay'
              ? `<div class="boxed-answer ${q.question_type === 'essay' ? 'essay' : 'short'}"></div>`
              : '';
          const answerKeyBlock =
            includeAnswerKey && q.answer
              ? `<div class="answer-key">Answer: ${escapeHtml(q.answer)}</div>`
              : '';

          return `
            <div class="question">
              <div><strong>${index + 1}.</strong> ${safePrompt}</div>
              ${optionsHtml ? `<div class="options">${optionsHtml}</div>` : ''}
              ${trueFalseBlock}
              ${fillBlankBlock}
              ${textAnswerBlock}
              ${answerKeyBlock}
            </div>
          `;
        })
        .join('');

      return `
        <h2>Section ${sectionIndex + 1}: ${safeHeading || 'Untitled section'} <span class="section-points">(${sectionPoints} pts)</span></h2>
        ${questionsHtml}
      `;
    })
    .join('');
  const totalPoints = (content.sections ?? []).reduce(
    (sum, section) =>
      sum + (section.questions ?? []).reduce((inner, q) => inner + (q.points ?? 0), 0),
    0,
  );

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      body { font-family: ${htmlFontFamily(theme.fontFamily)}; color: ${theme.textColor}; max-width: 800px; margin: 0 auto; padding: 40px; }
      h1 { font-size: ${theme.headingFontSize}px; color: ${theme.primaryColor}; margin-bottom: 8px; }
      h2 { font-size: ${Math.max(theme.headingFontSize - 4, 16)}px; margin-top: ${spacing}px; border-bottom: 2px solid ${theme.primaryColor}; padding-bottom: 4px; }
      .instructions { font-style: italic; color: #666; margin-bottom: ${spacing}px; white-space: pre-wrap; }
      .meta { display: flex; justify-content: space-between; gap: 12px; margin-bottom: ${spacing}px; font-size: 12px; color: #4b5563; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; background: #f8fafc; }
      .question { margin: ${spacing}px 0; font-size: ${theme.bodyFontSize}px; }
      .options { margin-left: 20px; margin-top: 4px; }
      .option { margin: 4px 0; }
      .section-points { font-size: 12px; color: #6b7280; font-weight: 500; }
      .answer-key { margin-top: 6px; font-size: 12px; color: #374151; background: #f1f5f9; border-radius: 4px; padding: 4px 8px; }
      .line-answer { border-bottom: 1px solid #999; width: 200px; height: 20px; margin-top: 4px; }
      .boxed-answer { border: 1px solid #ddd; margin-top: 4px; border-radius: 4px; }
      .boxed-answer.short { height: 30px; }
      .boxed-answer.essay { height: 80px; }
      @media print { body { padding: 20px; } }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    ${safeInstructions ? `<p class="instructions">${safeInstructions}</p>` : ''}
    <div class="meta">
      <span>Total points: <strong>${totalPoints}</strong></span>
      <span>Answer key: <strong>${includeAnswerKey ? 'Included' : 'Hidden'}</strong></span>
    </div>
    ${sectionsHtml}
  </body>
</html>`;
}

async function buildPdfResponse({
  requestName,
  worksheetId,
  includeAnswerKey,
}: {
  requestName: string;
  worksheetId?: string;
  includeAnswerKey: boolean;
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

  let printableHtml: string;
  try {
    printableHtml = buildPrintableHtml({
      content,
      theme: { ...theme, spacingPreset: layout.spacingPreset ?? theme.spacingPreset },
      worksheetId,
      includeAnswerKey,
    });
  } catch (e) {
    return handleUnknownError(`${requestName} /api/exports/pdf (render html)`, e);
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

  return Response.json({
    html: printableHtml,
    filename: `${sanitizeFilename(content.title || worksheetId)}.pdf`,
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling('POST /api/exports/pdf', async () => {
    const payload = (await req.json()) as {
      worksheetId?: string;
      includeAnswerKey?: boolean;
    };
    return buildPdfResponse({
      requestName: 'POST',
      worksheetId: payload.worksheetId,
      includeAnswerKey: Boolean(payload.includeAnswerKey),
    });
  });
}

export async function GET(req: Request) {
  return withApiErrorHandling('GET /api/exports/pdf', async () => {
    const { searchParams } = new URL(req.url);
    const worksheetId = searchParams.get('worksheetId') ?? undefined;
    const includeAnswerKey = searchParams.get('includeAnswerKey') === '1';
    return buildPdfResponse({ requestName: 'GET', worksheetId, includeAnswerKey });
  });
}
