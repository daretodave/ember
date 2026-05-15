-- profiles: one row per auth user (display name, timezone, public username)
create table if not exists public.profiles (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  username     text unique,
  timezone     text        not null default 'UTC',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- users can only read and write their own profile
create policy "users own their profile"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- keep updated_at current on every write
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
