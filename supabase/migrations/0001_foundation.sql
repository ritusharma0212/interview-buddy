create extension if not exists pgcrypto;
create table public.companies (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 created_at timestamptz not null default now()
);
create table public.company_interview_profiles (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id) on delete cascade,
 role_family text not null default 'product_management',
 seniority text not null default 'unspecified',
 profile jsonb not null default '{}'::jsonb,
 confidence text not null default 'unverified' check (confidence in ('verified','reported','inferred','unverified')),
 last_verified_at timestamptz,
 refresh_after timestamptz,
 unique(company_id,role_family,seniority)
);
create table public.research_sources (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.company_interview_profiles(id) on delete cascade,
 url text not null,
 title text,
 source_type text not null,
 observed_at timestamptz not null default now()
);
create table public.interview_round_templates (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.company_interview_profiles(id) on delete cascade,
 round_name text not null,
 sequence_number integer not null,
 competencies jsonb not null default '[]'::jsonb,
 rubric jsonb not null default '{}'::jsonb,
 confidence text not null default 'inferred'
);
create table public.interviews (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 company_name text not null,
 role_title text not null,
 interview_stage text not null,
 job_description text not null,
 recruiter_instructions text not null default '',
 interview_at timestamptz,
 timezone text not null default 'UTC',
 company_profile_id uuid references public.company_interview_profiles(id),
 created_at timestamptz not null default now()
);
create index interviews_user_idx on public.interviews(user_id,created_at desc);
create table public.mock_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 interview_id uuid not null references public.interviews(id) on delete cascade,
 status text not null default 'in_progress' check(status in ('in_progress','completed')),
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
create table public.mock_turns (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null references public.mock_sessions(id) on delete cascade,
 turn_index integer not null,
 question text not null,
 answer text,
 score integer check(score between 1 and 10),
 feedback jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(session_id,turn_index)
);
create table public.prep_events (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 interview_id uuid not null references public.interviews(id) on delete cascade,
 provider text not null,
 provider_event_id text,
 title text not null,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 created_at timestamptz not null default now()
);
alter table public.companies enable row level security;
alter table public.company_interview_profiles enable row level security;
alter table public.research_sources enable row level security;
alter table public.interview_round_templates enable row level security;
alter table public.interviews enable row level security;
alter table public.mock_sessions enable row level security;
alter table public.mock_turns enable row level security;
alter table public.prep_events enable row level security;
create policy "company read" on public.companies for select to authenticated using(true);
create policy "profile read" on public.company_interview_profiles for select to authenticated using(true);
create policy "sources read" on public.research_sources for select to authenticated using(true);
create policy "rounds read" on public.interview_round_templates for select to authenticated using(true);
create policy "interviews own" on public.interviews for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "sessions own" on public.mock_sessions for all to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.interviews i where i.id=interview_id and i.user_id=(select auth.uid()))) with check(user_id=(select auth.uid()) and exists(select 1 from public.interviews i where i.id=interview_id and i.user_id=(select auth.uid())));
create policy "turns own" on public.mock_turns for all to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.mock_sessions s where s.id=session_id and s.user_id=(select auth.uid()))) with check(user_id=(select auth.uid()) and exists(select 1 from public.mock_sessions s where s.id=session_id and s.user_id=(select auth.uid())));
create policy "events own" on public.prep_events for all to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.interviews i where i.id=interview_id and i.user_id=(select auth.uid()))) with check(user_id=(select auth.uid()) and exists(select 1 from public.interviews i where i.id=interview_id and i.user_id=(select auth.uid())));
