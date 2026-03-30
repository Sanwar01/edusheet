/**
 * Which backend generates worksheet JSON.
 * Set WORKSHEET_AI_PROVIDER=gemini | openai, or omit and we infer from API keys.
 */
export type WorksheetAiProvider = 'openai' | 'gemini';

export function getWorksheetAiProvider(): WorksheetAiProvider {
  const explicit = process.env.WORKSHEET_AI_PROVIDER?.toLowerCase();
  if (explicit === 'gemini' || explicit === 'openai') {
    return explicit;
  }
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (hasGemini && !hasOpenAI) return 'gemini';
  return 'openai';
}
