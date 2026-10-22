create table if not exists public.user_feedback (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 category text not null check (category in ('Bug report','Feature request','General feedback')),
 message text not null default '' check (char_length(message) <= 4000),
 rating integer not null check (rating between 1 and 5),
 page text,
 created_at timestamptz not null default now()
);
create index if not exists user_feedback_user_created_idx on public.user_feedback(user_id,created_at desc);
alter table public.user_feedback enable row level security;
create policy "Users can submit their own feedback" on public.user_feedback for insert to authenticated with check ((select auth.uid()) = user_id);
-- No SELECT policy for app users. Review submissions in Supabase dashboard.

-- Also update databases where the earlier version of this migration was already run.
alter table public.user_feedback alter column message set default '';
alter table public.user_feedback drop constraint if exists user_feedback_message_check;
alter table public.user_feedback add constraint user_feedback_message_check check (char_length(message) <= 4000);
alter table public.user_feedback alter column rating set not null;
