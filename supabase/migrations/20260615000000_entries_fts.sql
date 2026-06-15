-- Performance optimisation for entry full-text search (phase 31).
-- Adds a generated tsvector column + GIN index so /api/search?q= queries
-- avoid seq-scans at scale. The search route uses textSearch() which works
-- on the raw text column too — this migration is optional for correctness,
-- required for production performance.
alter table public.entries
  add column if not exists search_vec tsvector
    generated always as (to_tsvector('english', coalesce(response, ''))) stored;

create index if not exists entries_search_vec_gin
  on public.entries using gin(search_vec);
