import { GoogleGenerativeAI } from '@google/generative-ai';

let cached: GoogleGenerativeAI | null = null;

/**
 * Lazily construct the official {@link GoogleGenerativeAI} client from `@google/generative-ai`.
 * Mirrors the pattern used for OpenAI in `lib/openai/client.ts`.
 */
export function getGoogleGenerativeAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!cached) {
    cached = new GoogleGenerativeAI(key);
  }
  return cached;
}
