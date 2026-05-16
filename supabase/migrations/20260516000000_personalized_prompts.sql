-- Phase 12: personalized prompt opt-in
-- adds use_personalized_prompts preference to profiles
-- creates per-user-per-day cache table for Anthropic-generated prompts

alter table public.profiles
  add column if not exists use_personalized_prompts boolean not null default false;

create table if not exists public.personalized_prompts (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  date       date        not null,
  prompt     text        not null,
  task       text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.personalized_prompts enable row level security;

create policy "users own their personalized prompts"
  on public.personalized_prompts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
