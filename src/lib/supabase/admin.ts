import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { publicEnv, requireServerEnv } from '@/lib/env';

export function getSupabaseAdminClient() {
  const SUPABASE_SERVICE_ROLE_KEY = requireServerEnv('SUPABASE_SERVICE_ROLE_KEY');
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin environment variables are not configured');
  }

  return createClient(url, key);
}
