alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.worksheets enable row level security;
alter table public.worksheet_versions enable row level security;
alter table public.ai_generations enable row level security;
alter table public.exports enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "workspaces_select_member" on public.workspaces
for select using (
  owner_id = auth.uid()
  or exists (select 1 from public.workspace_members wm where wm.workspace_id = workspaces.id and wm.user_id = auth.uid())
);
create policy "workspaces_insert_owner" on public.workspaces for insert with check (owner_id = auth.uid());
create policy "workspaces_update_owner" on public.workspaces for update using (owner_id = auth.uid());

create policy "workspace_members_select_member" on public.workspace_members
for select using (user_id = auth.uid());

create policy "subscriptions_select_own" on public.subscriptions for select using (user_id = auth.uid());
create policy "subscriptions_update_own" on public.subscriptions for update using (user_id = auth.uid());

create policy "worksheets_select_own" on public.worksheets for select using (user_id = auth.uid());
create policy "worksheets_insert_own" on public.worksheets for insert with check (user_id = auth.uid());
create policy "worksheets_update_own" on public.worksheets for update using (user_id = auth.uid());
create policy "worksheets_delete_own" on public.worksheets for delete using (user_id = auth.uid());

create policy "worksheet_versions_select_own" on public.worksheet_versions for select using (user_id = auth.uid());
create policy "worksheet_versions_insert_own" on public.worksheet_versions for insert with check (user_id = auth.uid());

create policy "ai_generations_select_own" on public.ai_generations for select using (user_id = auth.uid());
create policy "ai_generations_insert_own" on public.ai_generations for insert with check (user_id = auth.uid());

create policy "exports_select_own" on public.exports for select using (user_id = auth.uid());
create policy "exports_insert_own" on public.exports for insert with check (user_id = auth.uid());
