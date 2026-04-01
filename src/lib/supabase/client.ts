'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { publicEnv } from '@/lib/env';

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
