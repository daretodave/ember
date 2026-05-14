-- entries: one row per user per UTC calendar day
create table if not exists public.entries (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  date         date        not null,
  response     text        not null default '',
  task_done    boolean     not null default false,
  is_published boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.entries enable row level security;

-- users can only see and write their own entries
create policy "users own their entries"
  on public.entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- keep updated_at current on every write
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();
