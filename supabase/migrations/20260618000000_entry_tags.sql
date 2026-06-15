-- Entry tags: stored as text[] with GIN index for containment queries
alter table public.entries
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists entries_tags_gin
  on public.entries using gin (tags);
