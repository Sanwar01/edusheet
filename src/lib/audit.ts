import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function insertAuditLog(params: {
  userId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const admin = getSupabaseAdminClient();
  await admin.from('audit_logs').insert({
    user_id: params.userId ?? null,
    action: params.action,
    resource_type: params.resourceType ?? null,
    resource_id: params.resourceId ?? null,
    metadata: params.metadata ?? {},
  });
}
