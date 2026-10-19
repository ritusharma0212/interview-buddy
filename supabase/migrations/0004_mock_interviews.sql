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
-- Writes are handled by server with trusted service role after authentication and ownership verification.
