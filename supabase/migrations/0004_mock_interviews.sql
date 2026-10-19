-- PRO access is granted only by a trusted administrator or future billing webhook.
create table if not exists public.user_entitlements (
 user_id uuid primary key references auth.users(id) on delete cascade,
 plan text not null default 'free' check (plan in ('free','pro')),
 updated_at timestamptz not null default now()
);
alter table public.user_entitlements enable row level security;
create policy "read own entitlement" on public.user_entitlements for select to authenticated using (user_id=(select auth.uid()));
-- No client INSERT/UPDATE/DELETE policies: users cannot self-upgrade.

create table if not exists public.mock_interview_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 interview_id uuid not null references public.interviews(id) on delete cascade,
 started_at timestamptz not null default now(),
 ended_at timestamptz,
 status text not null default 'active' check (status in ('active','completed')),
 turns jsonb not null default '[]'::jsonb,
 assessment jsonb,
 constraint mock_interview_turns_array check (jsonb_typeof(turns)='array')
);
create index if not exists mock_interview_sessions_user_idx on public.mock_interview_sessions(user_id,interview_id,started_at desc);
alter table public.mock_interview_sessions enable row level security;
create policy "read own mock sessions" on public.mock_interview_sessions for select to authenticated
 using (user_id=(select auth.uid()) and exists (select 1 from public.interviews i where i.id=interview_id and i.user_id=(select auth.uid())));
-- Writes are handled by server with trusted service role after auth and PRO verification.
