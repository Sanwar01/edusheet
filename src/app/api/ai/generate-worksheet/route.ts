import { createSupabaseServerClient } from '@/lib/supabase/server';
import { GenerateWorksheetInputSchema } from '@/lib/validators/ai';
import { WorksheetContentSchema } from '@/lib/validators/worksheet';
import { buildWorksheetPrompt } from '@/features/ai/prompt-builder';
import { getWorksheetAiProvider } from '@/features/ai/worksheet-ai-provider';
import { getOpenAIClient } from '@/lib/openai/client';
import {
  generateWorksheetTextWithGemini,
  getGeminiRetryDelaySeconds,
  isGeminiRateLimitError,
  isGeminiTemporaryUnavailable,
} from '@/lib/gemini/generate-worksheet';
import { parseModelJsonOutput } from '@/lib/ai/parse-model-json';
import { buildLayout, defaultTheme } from '@/features/worksheets/defaults';
import {
  FREE_PLAN_LIMITS,
  getMonthStartIso,
  isProPlan,
} from '@/features/billing/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { insertAuditLog } from '@/lib/audit';
import {
  apiJsonError,
  logApiError,
  withApiErrorHandling,
} from '@/lib/api/errors';
import { getServerEnv } from '@/lib/env';

const AI_GEN_PER_MINUTE = 3;
const MODEL_OUTPUT_PREVIEW_LENGTH = 1200;

type TokenUsage = {
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toShortId(prefix: 'sec' | 'q', value: unknown, fallbackIndex: number): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (raw.length > 0) return raw;
  return `${prefix}_${fallbackIndex + 1}`;
}

function normalizeWorksheetJson(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const root = input as Record<string, unknown>;
  const sections = Array.isArray(root.sections) ? root.sections : [];

  const normalizedSections = sections
    .map((section, sectionIndex) => {
      if (!section || typeof section !== 'object') return null;
      const sectionObj = section as Record<string, unknown>;
      const questions = Array.isArray(sectionObj.questions) ? sectionObj.questions : [];

      const normalizedQuestions = questions
        .map((question, questionIndex) => {
          if (!question || typeof question !== 'object') return null;
          const questionObj = question as Record<string, unknown>;
          return {
            ...questionObj,
            id: toShortId('q', questionObj.id, questionIndex),
            prompt:
              typeof questionObj.prompt === 'string'
                ? questionObj.prompt
                : String(questionObj.prompt ?? ''),
            options: Array.isArray(questionObj.options)
              ? questionObj.options.map((o) => String(o))
              : [],
          };
        })
        .filter(Boolean);

      return {
        ...sectionObj,
        id: toShortId('sec', sectionObj.id, sectionIndex),
        type: 'section',
        heading:
          typeof sectionObj.heading === 'string'
            ? sectionObj.heading
            : String(sectionObj.heading ?? `Section ${sectionIndex + 1}`),
        questions: normalizedQuestions,
      };
    })
    .filter(Boolean);

  return {
    ...root,
    title: typeof root.title === 'string' ? root.title : String(root.title ?? 'Generated Worksheet'),
    instructions:
      typeof root.instructions === 'string'
        ? root.instructions
        : String(root.instructions ?? 'Answer all questions.'),
    sections: normalizedSections,
  };
}

async function generateOnce(
  provider: ReturnType<typeof getWorksheetAiProvider>,
  prompt: string,
): Promise<{ rawText: string } & TokenUsage> {
  if (provider === 'gemini') {
    const r = await generateWorksheetTextWithGemini(prompt);
    return {
      rawText: r.text,
      model: r.model,
      promptTokens: r.promptTokens,
      completionTokens: r.completionTokens,
      totalTokens: r.totalTokens,
    };
  }

  const openai = getOpenAIClient();
  const { OPENAI_MODEL } = getServerEnv();
  const modelName = OPENAI_MODEL;
  const completion = await openai.responses.create({
    model: modelName,
    input: prompt,
    temperature: 0.2,
  });

  const rawText = completion.output_text?.trim() ?? '';
  return {
    rawText,
    model: modelName,
    promptTokens: completion.usage?.input_tokens ?? null,
    completionTokens: completion.usage?.output_tokens ?? null,
    totalTokens: completion.usage?.total_tokens ?? null,
  };
}

export async function POST(req: Request) {
  return withApiErrorHandling('POST /api/ai/generate-worksheet', async () => {
    const { GEMINI_API_KEY, OPENAI_API_KEY } = getServerEnv();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiJsonError('Unauthorized', 401);

    if (!checkRateLimit(`ai-gen:${user.id}`, AI_GEN_PER_MINUTE, 60_000)) {
      return apiJsonError(
        'Too many generation requests. Try again shortly.',
        429,
      );
    }

    const provider = getWorksheetAiProvider();
    if (provider === 'gemini' && !GEMINI_API_KEY?.trim()) {
      return apiJsonError(
        'Worksheet AI is set to Gemini but GEMINI_API_KEY is missing.',
        503,
      );
    }
    if (provider === 'openai' && !OPENAI_API_KEY?.trim()) {
      return apiJsonError(
        'Worksheet AI is set to OpenAI but OPENAI_API_KEY is missing.',
        503,
      );
    }

    const body = await req.json();
    const parsedInput = GenerateWorksheetInputSchema.safeParse(body);
    if (!parsedInput.success) {
      return apiJsonError(
        'Validation failed',
        400,
        parsedInput.error.flatten(),
      );
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan,status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!isProPlan(sub?.plan, sub?.status)) {
      const { count } = await supabase
        .from('ai_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', getMonthStartIso());

      if ((count ?? 0) >= FREE_PLAN_LIMITS.generationsPerMonth) {
        return apiJsonError('Free plan generation limit reached.', 402);
      }
    }

    const prompt = buildWorksheetPrompt(parsedInput.data);

    let lastValidationDetails: unknown = null;
    let lastModelOutputPreview: string | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let gen: { rawText: string } & TokenUsage;
      try {
        gen = await generateOnce(provider, prompt);
      } catch (e) {
        if (provider === 'gemini' && isGeminiRateLimitError(e)) {
          const retryAfter = getGeminiRetryDelaySeconds(e) ?? 20;
          return Response.json(
            {
              error:
                'Gemini quota/rate limit reached. Please retry after the suggested delay or switch provider.',
              retryAfterSeconds: retryAfter,
            },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } },
          );
        }
        if (provider === 'gemini' && isGeminiTemporaryUnavailable(e)) {
          const retryAfter = 20;
          const isLastAttempt = attempt === 1;
          if (!isLastAttempt) {
            await sleep((attempt + 1) * 1500);
            continue;
          }
          return Response.json(
            {
              error:
                'Gemini is temporarily under high demand. Please retry in a moment.',
              retryAfterSeconds: retryAfter,
            },
            { status: 503, headers: { 'Retry-After': String(retryAfter) } },
          );
        }
        logApiError(
          `POST /api/ai/generate-worksheet (attempt ${attempt + 1})`,
          e,
        );
        if (attempt < 1) {
          await sleep((attempt + 1) * 1500);
        }
        continue;
      }

      if (!gen.rawText) continue;
      lastModelOutputPreview = gen.rawText.slice(0, MODEL_OUTPUT_PREVIEW_LENGTH);

      try {
        const parsedJson = parseModelJsonOutput(gen.rawText);
        const normalizedJson = normalizeWorksheetJson(parsedJson);
        const valid = WorksheetContentSchema.safeParse(normalizedJson);

        if (!valid.success) {
          lastValidationDetails = valid.error.flatten();
          continue;
        }

        const content = valid.data;
        const layout = buildLayout(content);

        const { data: worksheet, error } = await supabase
          .from('worksheets')
          .insert({
            user_id: user.id,
            title: content.title,
            subject: parsedInput.data.subject,
            grade_level: parsedInput.data.gradeLevel,
            status: 'draft',
            content_json: content,
            layout_json: layout,
            theme_json: defaultTheme,
          })
          .select('id')
          .single();

        if (error) return apiJsonError(error.message, 500);

        const { error: genInsertError } = await supabase
          .from('ai_generations')
          .insert({
            user_id: user.id,
            worksheet_id: worksheet.id,
            prompt,
            parsed_result: content,
            model: gen.model,
            prompt_tokens: gen.promptTokens,
            completion_tokens: gen.completionTokens,
            total_tokens: gen.totalTokens,
          });
        if (genInsertError) {
          // Do not fail the user flow after worksheet creation.
          // Logging/analytics failure should not block redirect to editor.
          logApiError('POST /api/ai/generate-worksheet (ai_generations)', genInsertError);
        }

        try {
          await insertAuditLog({
            userId: user.id,
            action: 'worksheet.ai_generate',
            resourceType: 'worksheet',
            resourceId: worksheet.id,
            metadata: { model: gen.model, provider },
          });
        } catch (auditErr) {
          logApiError('POST /api/ai/generate-worksheet (audit)', auditErr);
        }

        return Response.json({ worksheetId: worksheet.id }, { status: 201 });
      } catch (e) {
        logApiError(
          `POST /api/ai/generate-worksheet (parse attempt ${attempt + 1})`,
          e,
        );
        lastValidationDetails = {
          parserError: e instanceof Error ? e.message : String(e),
        };
        continue;
      }
    }

    return apiJsonError('Could not produce valid worksheet JSON', 422, {
      validation: lastValidationDetails,
      modelOutputPreview: lastModelOutputPreview,
    });
  });
}
