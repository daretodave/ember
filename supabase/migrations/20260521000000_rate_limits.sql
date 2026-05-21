-- rate_limit_events: one row per API call subject to rate limiting
-- accessed only via the check_rate_limit() function below
create table if not exists public.rate_limit_events (
  id         bigint      generated always as identity primary key,
  key        text        not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_key_ts
  on public.rate_limit_events(key, created_at desc);

-- RLS on, no policies: table is inaccessible except via the SECURITY DEFINER function
alter table public.rate_limit_events enable row level security;

-- Atomically: count events in [p_since, now()), record this attempt if allowed.
-- Returns true (allowed) or false (blocked).
-- SECURITY DEFINER so anon/authenticated callers never touch the table directly.
create or replace function public.check_rate_limit(
  p_key  text,
  p_since timestamptz,
  p_max  int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  select count(*) into v_count
  from public.rate_limit_events
  where key = p_key and created_at >= p_since;

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limit_events (key) values (p_key);
  return true;
end;
$$;

grant execute on function public.check_rate_limit(text, timestamptz, int)
  to anon, authenticated;
