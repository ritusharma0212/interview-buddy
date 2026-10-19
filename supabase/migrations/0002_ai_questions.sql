create table if not exists public.interview_question_sets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 interview_id uuid not null references public.interviews(id) on delete cascade,
 questions jsonb not null,
 model text not null,
 created_at timestamptz not null default now()
);
create index if not exists interview_question_sets_lookup on public.interview_question_sets(user_id,interview_id,created_at desc);
alter table public.interview_question_sets enable row level security;
create policy "question sets own" on public.interview_question_sets for all to authenticated
 using (user_id = (select auth.uid()) and exists (
   select 1 from public.interviews i where i.id = interview_id and i.user_id = (select auth.uid())
 ))
 with check (user_id = (select auth.uid()) and exists (
   select 1 from public.interviews i where i.id = interview_id and i.user_id = (select auth.uid())
 ));