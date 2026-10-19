create table if not exists public.interview_practice_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 interview_id uuid not null references public.interviews(id) on delete cascade,
 question_set_id uuid not null references public.interview_question_sets(id) on delete cascade,
 question_index integer not null check (question_index >= 0 and question_index < 10),
 answer_text text not null check (char_length(answer_text) between 20 and 12000),
 feedback jsonb not null,
 model text not null,
 created_at timestamptz not null default now()
);
create index if not exists interview_practice_attempts_lookup on public.interview_practice_attempts(user_id,interview_id,question_set_id,created_at desc);
alter table public.interview_practice_attempts enable row level security;
create policy "practice attempts own" on public.interview_practice_attempts for all to authenticated
 using (user_id = (select auth.uid()) and exists (
  select 1 from public.interviews i where i.id = interview_id and i.user_id = (select auth.uid())
 ))
 with check (user_id = (select auth.uid()) and exists (
  select 1 from public.interviews i where i.id = interview_id and i.user_id = (select auth.uid())
 ) and exists (
  select 1 from public.interview_question_sets s where s.id = question_set_id and s.interview_id = interview_id and s.user_id = (select auth.uid())
 ));
