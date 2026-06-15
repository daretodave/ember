-- Weekly reflection: opt-in flag on profiles + cache table
alter table public.profiles
  add column if not exists weekly_reflection_opt_in boolean not null default false;

create table if not exists public.weekly_reflections (
  user_id uuid not null references auth.users(id) on delete cascade,
  iso_week text not null,
  reflection_text text not null,
  generated_at timestamptz not null default now(),
  primary key (user_id, iso_week)
);

alter table public.weekly_reflections enable row level security;

create policy "users can read own reflections"
  on public.weekly_reflections for select
  using (auth.uid() = user_id);

create policy "users can insert own reflections"
  on public.weekly_reflections for insert
  with check (auth.uid() = user_id);
