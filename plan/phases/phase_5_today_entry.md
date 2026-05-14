# Phase 5 — Today + entry write

## Outcome

`/today` renders the day's prompt and task. Authenticated users can write
a response, mark the task done, and save. Entries persist to Supabase
Postgres. A 7-day strip at the bottom shows the user's recent tile states
as a preview of the `/log` mosaic.

## Why

This is the core loop of the product: open the page, read the prompt,
write something. Without this phase the product has no writeable surface —
auth works but there's nowhere to go after signing in.

## Scope

### Pages
- `/today` — auth-required server component

### API
- `POST /api/entries` — upsert entry for authenticated user + date

### Lib
- `src/lib/entries.ts` — `getTodayEntry`, `getRecentEntries`

### DB
- `supabase/migrations/20260101000000_create_entries.sql` — `entries` table
  with `(user_id, date)` unique constraint + RLS

### Components
- `src/app/today/TodayEntry.tsx` — client component (textarea, task checkbox,
  save button, publish toggle, last-saved stamp)
- `src/app/today/DayStrip.tsx` — server component (7-day tile strip)

## Design reference

`design/Ember · Today.html` — the authoritative spec. Port exactly.

Key elements:
- **Header:** lockup (glyph + wordmark) + nav (today | log | settings)
  with "today" marked `is-current` via a 1px accent underline
- **Date stamp:** JetBrains Mono, 12px, uppercase, ink-muted
- **Prompt:** Source Serif 4, 32px, leading 1.25, max-width 600px
- **Task row:** checkbox button + task body; checkbox toggles `is-done` state
  (filled accent background + paper checkmark)
- **Entry textarea:** Source Serif 4, 17px, leading-prose, transparent bg,
  1px border-bottom (accent on focus), min-height 220px, `resize: vertical`
- **Entry meta:** last-saved stamp (mono 12px left) + publish toggle + save
  button (right)
- **7-day strip:** 32px tiles in a row, dates in mono below each tile,
  today tile has accent ring
- "today" nav item has 1px accent line below via `::after`

## Entry model

```sql
create table public.entries (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  date        date        not null,
  response    text        not null default '',
  task_done   boolean     not null default false,
  is_published boolean    not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, date)
);
```

RLS: users can select/insert/update their own rows only.

## Decisions

- **Timezone:** UTC for v1. `/settings` (phase 7) adds timezone preference.
  The date shown on `/today` is the UTC calendar date for the current moment.
  Documented in commit body so phase 7 knows what to retrofit.
- **Auto-save vs manual save:** manual save button per the design spec. No
  debounced auto-save in v1 — keep the interaction model explicit.
- **Upsert key:** `(user_id, date)` — one entry per user per UTC day.
  Re-opening `/today` on the same day shows the saved draft.
- **Publish default:** false. Users explicitly toggle per-entry.

## Tests

### Unit (Vitest)
- `src/lib/__tests__/entries.test.ts` — helper functions with mocked Supabase
- `src/app/api/entries/__tests__/route.test.ts` — POST route unit tests

### E2E (Playwright)
- `apps/e2e/tests/today.spec.ts`
  - `/today` redirects unauthenticated users to `/signin`
  - `/today` page loads with status 200 when mocked as authenticated (redirect
    check — no session injection needed in e2e since middleware guards it)
  - No horizontal overflow at 375px on `/signin` redirect page

## Cross-link retrofits

None required in this phase. `/today` is a new leaf; it receives incoming
links from the nav (already wired in the header component) but doesn't
need to retro-fit links into already-shipped pages beyond what the nav
already provides.
