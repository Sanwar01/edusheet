import type { GenerationConfig } from '@google/generative-ai';
import { getGoogleGenerativeAI } from '@/lib/gemini/client';
import { getServerEnv } from '@/lib/env';

export type GeminiGenerateResult = {
  text: string;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

type GeminiErrorWithMeta = Error & {
  status?: number;
  errorDetails?: Array<{ '@type'?: string; retryDelay?: string }>;
  message: string;
};

export function isGeminiRateLimitError(error: unknown): boolean {
  const e = error as GeminiErrorWithMeta;
  if (!e) return false;
  if (e.status === 429) return true;
  const message = (e.message ?? '').toLowerCase();
  return message.includes('429') || message.includes('quota exceeded') || message.includes('too many requests');
}

export function getGeminiRetryDelaySeconds(error: unknown): number | null {
  const e = error as GeminiErrorWithMeta;
  const retry = e?.errorDetails?.find((d) => d?.['@type']?.includes('RetryInfo'))?.retryDelay;
  if (retry) {
    const match = retry.match(/^(\d+)(?:\.\d+)?s$/);
    if (match) return Number(match[1]);
  }

  const message = e?.message ?? '';
  const messageMatch = message.match(/retry in\s+(\d+)(?:\.\d+)?s/i);
  if (messageMatch) return Number(messageMatch[1]);

  return null;
}

export function getDefaultGeminiModelName(): string {
  const { GEMINI_MODEL } = getServerEnv();
  return GEMINI_MODEL;
}

async function generateWithConfig(
  modelName: string,
  prompt: string,
  jsonMime: boolean,
): Promise<GeminiGenerateResult> {
  const genAI = getGoogleGenerativeAI();

  const generationConfig: GenerationConfig = {
    temperature: 0.2,
    ...(jsonMime ? { responseMimeType: 'application/json' as const } : {}),
  };

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig,
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const response = result.response;
  const text = response.text().trim();
  const usage = response.usageMetadata;

  return {
    text,
    model: modelName,
    promptTokens: usage?.promptTokenCount ?? null,
    completionTokens: usage?.candidatesTokenCount ?? null,
    totalTokens: usage?.totalTokenCount ?? null,
  };
}

/**
 * Generate worksheet JSON text via `@google/generative-ai`.
 * Tries JSON MIME type first; falls back if the model rejects it.
 */
export async function generateWorksheetTextWithGemini(prompt: string): Promise<GeminiGenerateResult> {
  const modelName = getDefaultGeminiModelName();

  try {
    return await generateWithConfig(modelName, prompt, true);
  } catch (error) {
    // Do not perform a second request when Gemini is rate-limiting or quota-blocking.
    if (isGeminiRateLimitError(error)) {
      throw error;
    }
    return await generateWithConfig(modelName, prompt, false);
  }
}
