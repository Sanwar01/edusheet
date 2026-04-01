import 'server-only';

import OpenAI from 'openai';
import { requireServerEnv } from '@/lib/env';

export function getOpenAIClient() {
  const apiKey = requireServerEnv('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey });
}
