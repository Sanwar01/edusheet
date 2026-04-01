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
import { buildWorksheetLayout, defaultSectionLayout } from '@/features/worksheets/layout';
import { defaultTheme } from '@/features/worksheets/defaults';
import { LayoutSchema, WorksheetContentSchema } from '@/lib/validators/worksheet';
import type { WorksheetContent, WorksheetLayout, WorksheetTheme } from '@/types/worksheet';

const EXPORT_PER_MINUTE = 12;

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

function promptWeightCss(weight: WorksheetTheme['promptFontWeight']) {
  if (weight === 'semibold') return 'font-weight: 600;';
  if (weight === 'medium') return 'font-weight: 500;';
  return 'font-weight: 400;';
}

function renderQuestionHtml(
  q: WorksheetContent['sections'][number]['questions'][number],
  qNum: number,
  theme: WorksheetTheme,
  includeAnswerKey: boolean,
) {
  const safePrompt = escapeHtml(q.prompt || '');
  const horizontal = theme.optionLayout === 'horizontal';
  const opts = q.options ?? [];
  const optColor = theme.answerTextColor;

  let mcHtml = '';
  if (q.question_type === 'multiple_choice' && opts.length > 0) {
    if (horizontal) {
      mcHtml = `<div class="options-row">`;
      for (let i = 0; i < opts.length; i += 1) {
        const letter = String.fromCharCode(65 + i);
        mcHtml += `
          <div class="opt-h">
            <div class="opt-letter" style="color:${theme.primaryColor}">${letter}</div>
            <div class="opt-text" style="color:${optColor}">${escapeHtml(opts[i])}</div>
          </div>`;
      }
      mcHtml += `</div>`;
    } else {
      mcHtml = `<div class="options">`;
      for (let i = 0; i < opts.length; i += 1) {
        const letter = String.fromCharCode(65 + i);
        mcHtml += `<div class="option"><span class="opt-letter-inline" style="color:${theme.primaryColor}">${letter}.</span> <span style="color:${optColor}">${escapeHtml(opts[i])}</span></div>`;
      }
      mcHtml += `</div>`;
    }
  }

  const tfHtml =
    q.question_type === 'true_false'
      ? horizontal
        ? `<div class="tf-row">
            <span class="tf-box" style="border-color:${optColor}"></span><span style="color:${optColor}">True</span>
            <span class="tf-box" style="border-color:${optColor}"></span><span style="color:${optColor}">False</span>
          </div>`
        : `<div class="options"><div class="option" style="color:${optColor}">○ True</div><div class="option" style="color:${optColor}">○ False</div></div>`
      : '';

  const fillBlankHtml =
    q.question_type === 'fill_in_blank'
      ? `<div class="line-answer" style="border-color:${optColor}"></div>`
      : '';

  let matchingHtml = '';
  if (q.question_type === 'matching' && opts.length > 0) {
    matchingHtml = '<ul class="match-list">';
    for (let i = 0; i < opts.length; i += 1) {
      matchingHtml += `<li style="color:${optColor}">${escapeHtml(opts[i])}</li>`;
    }
    matchingHtml += '</ul>';
  }

  const textAnswerHtml =
    q.question_type === 'short_answer' || q.question_type === 'essay'
      ? `<div class="boxed-answer ${q.question_type === 'essay' ? 'essay' : 'short'}" style="border-color:${optColor}"></div>`
      : '';

  const answerKeyHtml =
    includeAnswerKey && q.answer
      ? `<div class="answer-key">Answer: ${escapeHtml(q.answer)}</div>`
      : '';

  return `
    <div class="question">
      <div class="prompt" style="${promptWeightCss(theme.promptFontWeight)} color: ${theme.textColor};">
        <span style="color:${theme.primaryColor}">${qNum}.</span> ${safePrompt}
      </div>
      ${mcHtml}
      ${tfHtml}
      ${matchingHtml}
      ${fillBlankHtml}
      ${textAnswerHtml}
      ${answerKeyHtml}
    </div>
  `;
}

function buildPrintableHtml({
  content,
  theme,
  layout,
  worksheetId,
  includeAnswerKey,
}: {
  content: WorksheetContent;
  theme: WorksheetTheme;
  layout: WorksheetLayout;
  worksheetId: string;
  includeAnswerKey: boolean;
}) {
  const spacing = spacingPx(theme.spacingPreset);
  const safeTitle = escapeHtml(content.title || worksheetId);
  const safeInstructions = escapeHtml(content.instructions || '');

  const headerBlock =
    theme.headerStyle === 'lesson'
      ? `
    <div class="lesson-header">
      <h1 class="lesson-title">${safeTitle}</h1>
      ${
        theme.showNameLine
          ? `<div class="name-line" style="color:${theme.textColor}">Name: <span class="name-rule"></span></div>`
          : ''
      }
    </div>`
      : `<h1>${safeTitle}</h1>`;

  const sectionsHtml = (content.sections ?? [])
    .map((section, sectionIndex) => {
      const safeHeading = escapeHtml(section.heading || '');
      const sectionPoints = (section.questions ?? []).reduce(
        (sum, q) => sum + (q.points ?? 0),
        0,
      );
      const sectionLayout =
        layout.sectionLayouts[section.id] ?? defaultSectionLayout();
      const isGrid = sectionLayout.mode === 'grid';
      const gridCols = sectionLayout.gridColumns ?? 2;
      const gridColsClass =
        gridCols === 2
          ? 'grid-cols-2'
          : gridCols === 3
            ? 'grid-cols-3'
            : 'grid-cols-4';

      let globalQ = 0;
      for (let i = 0; i < sectionIndex; i += 1) {
        globalQ += content.sections[i].questions.length;
      }

      const questionsHtml = (section.questions ?? [])
        .map((q, qIndex) => {
          const qNum = globalQ + qIndex + 1;
          const inner = renderQuestionHtml(q, qNum, theme, includeAnswerKey);
          const cellClass =
            isGrid && sectionLayout.border === 'cells' ? 'question-cell' : '';
          return `<div class="${cellClass}">${inner}</div>`;
        })
        .join('');

      const gridWrapper =
        isGrid && sectionLayout.border === 'outer'
          ? `<div class="section-grid section-grid-outer ${gridColsClass}">${questionsHtml}</div>`
          : isGrid
            ? `<div class="section-grid ${gridColsClass}">${questionsHtml}</div>`
            : `<div class="section-stack">${questionsHtml}</div>`;

      return `
        <h2>Section ${sectionIndex + 1}: ${safeHeading || 'Untitled section'} <span class="section-points">(${sectionPoints} pts)</span></h2>
        ${gridWrapper}
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
      .lesson-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 8px; }
      .lesson-title { font-size: ${theme.headingFontSize}px; color: ${theme.primaryColor}; margin: 0; flex: 1; min-width: 200px; }
      .name-line { font-size: ${Math.max(theme.bodyFontSize - 1, 12)}px; white-space: nowrap; }
      .name-rule { display: inline-block; min-width: 180px; border-bottom: 1px solid #94a3b8; margin-left: 4px; }
      h2 { font-size: ${Math.max(theme.headingFontSize - 4, 16)}px; margin-top: ${spacing}px; border-bottom: 2px solid ${theme.primaryColor}; padding-bottom: 4px; }
      .instructions { font-style: italic; color: #666; margin-bottom: ${spacing}px; white-space: pre-wrap; }
      .meta { display: flex; justify-content: space-between; gap: 12px; margin-bottom: ${spacing}px; font-size: 12px; color: #4b5563; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; background: #f8fafc; }
      .question { margin: ${spacing}px 0; font-size: ${theme.bodyFontSize}px; }
      .section-stack .question { margin: ${spacing}px 0; }
      .section-grid { display: grid; gap: 12px; margin-top: 8px; }
      .section-grid.section-grid-outer { border: 2px solid #cbd5e1; border-radius: 8px; padding: 12px; }
      .section-grid.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .section-grid.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .section-grid.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .question-cell { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; }
      .options { margin-left: 20px; margin-top: 4px; }
      .option { margin: 4px 0; }
      .match-list { margin: 8px 0 0 20px; padding: 0; }
      .match-list li { margin: 4px 0; }
      .options-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 8px; }
      .opt-h { min-width: 72px; text-align: center; }
      .opt-letter { font-size: 12px; font-weight: 700; }
      .opt-text { font-size: 14px; }
      .tf-row { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; margin-top: 8px; }
      .tf-box { display: inline-block; width: 14px; height: 14px; border: 1px solid #64748b; border-radius: 2px; margin-right: 6px; vertical-align: middle; }
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
    ${headerBlock}
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

  const contentParsed = WorksheetContentSchema.safeParse(worksheet.content_json);
  const content = (
    contentParsed.success ? contentParsed.data : worksheet.content_json
  ) as WorksheetContent;

  const theme: WorksheetTheme = {
    ...defaultTheme,
    ...(worksheet.theme_json as Partial<WorksheetTheme>),
  };

  const parsedLayout = LayoutSchema.safeParse(worksheet.layout_json);
  const layout: WorksheetLayout = parsedLayout.success
    ? parsedLayout.data
    : buildWorksheetLayout(content, theme.spacingPreset, null);

  let printableHtml: string;
  try {
    printableHtml = buildPrintableHtml({
      content,
      theme,
      layout,
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
