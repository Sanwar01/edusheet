type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
};

type ServerEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRO_PRICE_ID?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  WORKSHEET_AI_PROVIDER: string;
  NODE_ENV: string;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function optionalEnv(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export const publicEnv: PublicEnv = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return requireEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return requireEnv(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
  get NEXT_PUBLIC_APP_URL() {
    return requireEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL);
  },
};

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must only be used on the server');
  }

  return {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.trim(),
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID?.trim(),
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
    OPENAI_MODEL: optionalEnv(process.env.OPENAI_MODEL, 'gpt-4.1-mini'),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim(),
    GEMINI_MODEL: optionalEnv(process.env.GEMINI_MODEL, 'gemini-2.0-flash'),
    WORKSHEET_AI_PROVIDER: optionalEnv(
      process.env.WORKSHEET_AI_PROVIDER,
      'openai',
    ).toLowerCase(),
    NODE_ENV: optionalEnv(process.env.NODE_ENV, 'development'),
  };
}

export function requireServerEnv(
  name: keyof Pick<
    ServerEnv,
    | 'STRIPE_SECRET_KEY'
    | 'STRIPE_PRO_PRICE_ID'
    | 'STRIPE_WEBHOOK_SECRET'
    | 'SUPABASE_SERVICE_ROLE_KEY'
    | 'OPENAI_API_KEY'
    | 'GEMINI_API_KEY'
  >,
): string {
  return requireEnv(name, getServerEnv()[name]);
}
