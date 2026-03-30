import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { GenerateWorksheetInputSchema } from '@/lib/validators/ai';
import { WorksheetContentSchema } from '@/lib/validators/worksheet';
import { buildWorksheetPrompt } from '@/features/ai/prompt-builder';
import { getOpenAIClient } from '@/lib/openai/client';
import { buildLayout, defaultTheme } from '@/features/worksheets/defaults';
import { FREE_PLAN_LIMITS, getMonthStartIso, isProPlan } from '@/features/billing/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { insertAuditLog } from '@/lib/audit';

const AI_GEN_PER_MINUTE = 8;

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(`ai-gen:${user.id}`, AI_GEN_PER_MINUTE, 60_000)) {
    return NextResponse.json({ error: 'Too many generation requests. Try again shortly.' }, { status: 429 });
  }

  const body = await req.json();
  const parsedInput = GenerateWorksheetInputSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json({ error: parsedInput.error.flatten() }, { status: 400 });
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
      return NextResponse.json({ error: 'Free plan generation limit reached.' }, { status: 402 });
    }
  }

  const prompt = buildWorksheetPrompt(parsedInput.data);
  const openai = getOpenAIClient();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const completion = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.2,
    });

    const output = completion.output_text?.trim();
    if (!output) continue;

    try {
      const json = JSON.parse(output);
      const valid = WorksheetContentSchema.safeParse(json);

      if (!valid.success) continue;

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

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from('ai_generations').insert({
        user_id: user.id,
        worksheet_id: worksheet.id,
        prompt,
        parsed_result: content,
        model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
        prompt_tokens: completion.usage?.input_tokens ?? null,
        completion_tokens: completion.usage?.output_tokens ?? null,
        total_tokens: completion.usage?.total_tokens ?? null,
      });

      await insertAuditLog({
        userId: user.id,
        action: 'worksheet.ai_generate',
        resourceType: 'worksheet',
        resourceId: worksheet.id,
        metadata: { model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini' },
      });

      return NextResponse.json({ worksheetId: worksheet.id }, { status: 201 });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: 'Could not produce valid worksheet JSON' }, { status: 422 });
}
