create table if not exists public.career_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 profile_text text not null default '',
 source_url text,
 updated_at timestamptz not null default now(),
 constraint career_profile_text_limit check (char_length(profile_text) <= 30000)
);
alter table public.career_profiles enable row level security;
create policy "read own career profile" on public.career_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own career profile" on public.career_profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own career profile" on public.career_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
