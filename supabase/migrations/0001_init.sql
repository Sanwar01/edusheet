create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'teacher' check (role in ('teacher', 'tutor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text not null default 'inactive' check (status in ('active','trialing','canceled','past_due','inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worksheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  title text not null default 'Untitled Worksheet',
  subject text not null,
  grade_level text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  content_json jsonb not null default '{}'::jsonb,
  layout_json jsonb not null default '{}'::jsonb,
  theme_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worksheet_versions (
  id uuid primary key default gen_random_uuid(),
  worksheet_id uuid not null references public.worksheets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version_label text,
  content_json jsonb not null,
  layout_json jsonb not null,
  theme_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  worksheet_id uuid references public.worksheets(id) on delete set null,
  prompt text not null,
  parsed_result jsonb not null,
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  created_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  worksheet_id uuid not null references public.worksheets(id) on delete cascade,
  format text not null check (format in ('pdf')),
  file_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_worksheets_user_id on public.worksheets(user_id);
create index if not exists idx_worksheets_updated_at on public.worksheets(updated_at desc);
create index if not exists idx_versions_worksheet_id on public.worksheet_versions(worksheet_id);
create index if not exists idx_ai_generations_user_created on public.ai_generations(user_id, created_at desc);
create index if not exists idx_exports_user_created on public.exports(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'teacher')
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
create trigger set_updated_at_subscriptions
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_worksheets on public.worksheets;
create trigger set_updated_at_worksheets
before update on public.worksheets
for each row execute function public.set_updated_at();
