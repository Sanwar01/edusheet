-- Stripe webhook idempotency: one row per delivered event id (prevents double-processing).
create table if not exists public.stripe_processed_events (
  stripe_event_id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_stripe_processed_events_created on public.stripe_processed_events(created_at desc);

-- Lightweight audit trail for server-side actions (inserts via service role only).
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user_created on public.audit_logs(user_id, created_at desc);

alter table public.stripe_processed_events enable row level security;
alter table public.audit_logs enable row level security;

-- No end-user access to webhook dedupe table.
create policy "stripe_processed_events_deny_all" on public.stripe_processed_events for all using (false);

-- Users can read their own audit rows (inserts are service-role only).
create policy "audit_logs_select_own" on public.audit_logs for select using (auth.uid() = user_id);
