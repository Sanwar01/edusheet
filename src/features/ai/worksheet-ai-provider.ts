import 'server-only';

import { getServerEnv } from '@/lib/env';

/**
 * Which backend generates worksheet JSON.
 * Set WORKSHEET_AI_PROVIDER=gemini | openai, or omit and we infer from API keys.
 */
export type WorksheetAiProvider = 'openai' | 'gemini';

export function getWorksheetAiProvider(): WorksheetAiProvider {
  const { WORKSHEET_AI_PROVIDER, GEMINI_API_KEY, OPENAI_API_KEY } = getServerEnv();
  const explicit = WORKSHEET_AI_PROVIDER.toLowerCase();
  if (explicit === 'gemini' || explicit === 'openai') {
    return explicit;
  }
  const hasGemini = Boolean(GEMINI_API_KEY?.trim());
  const hasOpenAI = Boolean(OPENAI_API_KEY?.trim());
  if (hasGemini && !hasOpenAI) return 'gemini';
  return 'openai';
}
