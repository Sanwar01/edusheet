-- Restrict end-user subscription mutations.
-- Billing state must only be updated by trusted server flows (service role + webhooks).

drop policy if exists "subscriptions_update_own" on public.subscriptions;
drop policy if exists "subscriptions_insert_own" on public.subscriptions;
drop policy if exists "subscriptions_delete_own" on public.subscriptions;
