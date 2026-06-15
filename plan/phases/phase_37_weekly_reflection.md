# Phase 37 — Weekly reflection

## Outcome

Users who opt in see a brief Claude-generated reflection on their
week's writing, surfaced on `/log`. The reflection is cached per
ISO week and never regenerates once written. It is observational,
lower-case, and carries no praise, prescriptions, or scoring.

## Why

A week's entries often reveal threads — recurring themes,
emotional textures, shifts in energy — that are hard to notice
entry by entry. A single quiet paragraph, written by Claude from
the week's own words, gives the reader a mirror without telling
them what to think.

---

## Decisions (made upfront — do not ask)

| Question | Decision | Reason |
|---|---|---|
| Week definition | ISO 8601 (Mon–Sun), UTC | Consistent with existing UTC-first convention |
| Minimum entries | 3 | Below 3 there is not enough material for a meaningful synthesis |
| Cache key | `(user_id, iso_week)` — immutable once written | Avoids regenerating on every /log load; keeps the reflection stable |
| Model | `claude-sonnet-4-6` | bearings.md Anthropic pin |
| Voice | observational, lower-case, no praise, no prescriptions, no scoring | Matches ember's tone throughout |
| Provenance label | "written by ember from your week" | Attribution without over-claiming |
| Surface location | `/log` page, above the mosaic heading | Most natural home; users arrive here to review their writing |
| API design | `GET /api/weekly-reflection` — returns cached, or generates + caches | Simple; no separate POST needed |
| iso_week format | `YYYY-Www` e.g. `"2026-W24"` | ISO 8601 compact form; readable as a table key |
| Tone gate | If reflection_text is null/empty after API call, show nothing | Graceful fallback; never surface an error state on /log |
| Max tokens | 300 | One short paragraph; force brevity |

---

## Routes / API

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/weekly-reflection` | GET | required | Return cached reflection for current ISO week, or generate + cache it |

Query params (none required): implicit — current user from session, current ISO week computed server-side.

Returns:
```json
{ "reflection": "..." }       // cached or freshly generated
{ "reflection": null }        // < 3 entries or no API key
```

---

## Database changes

### Migration `20260619000000_weekly_reflection.sql`

```sql
-- add opt-in flag to profiles
alter table public.profiles
  add column if not exists weekly_reflection_opt_in boolean not null default false;

-- weekly reflection cache
create table if not exists public.weekly_reflections (
  user_id uuid not null references auth.users(id) on delete cascade,
  iso_week text not null,           -- "2026-W24"
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
```

---

## New lib: `src/lib/weeklyReflection.ts`

Functions:
- `currentIsoWeek(): string` — returns `"YYYY-Www"` for today UTC
- `getWeekDateRange(isoWeek: string): { start: string; end: string }` — returns YYYY-MM-DD bounds
- `getWeeklyReflection(supabase, userId): Promise<string | null>` — check cache → if missing, query entries for the week → if <3, return null → call Anthropic → upsert + return

System prompt voice:
> "you are ember. write one short paragraph (3–5 sentences) observing what appeared in this person's writing this week. lower-case throughout. no praise, no prescriptions, no scoring. notice concrete details, recurring words, shifts in tone. do not refer to yourself or the person directly — describe the writing itself."

---

## Settings

- `ProfileRow` gains `weekly_reflection_opt_in: boolean`
- `SettingsForm` gains a "weekly reflection" radio group (off / on) after "daily reminder"
- `POST /api/settings` accepts `weekly_reflection_opt_in: boolean`
- Settings page passes `weeklyReflectionOptIn` prop to `SettingsForm`

---

## Log page changes

In `src/app/log/page.tsx`:
1. Fetch profile to read `weekly_reflection_opt_in`
2. If opt-in is true: call `GET /api/weekly-reflection` as a server-side fetch (or inline the lib function directly — prefer the direct call to avoid HTTP overhead in RSC)
3. If reflection is non-null: render a `<p className={styles.weeklyReflection}>` above the mosaic heading, followed by `<p className={styles.weeklyReflectionLabel}>written by ember from your week</p>`

No new page; no new URL. All additions inline.

---

## Components / handlers

None new — all changes are inline in existing files + new lib + migration.

---

## Empty / loading / error states

| Condition | Behavior |
|---|---|
| `weekly_reflection_opt_in` is false | Show nothing |
| Opt-in true, < 3 entries this week | Show nothing |
| `ANTHROPIC_API_KEY` not set | `getWeeklyReflection` returns null → show nothing |
| Anthropic API error | Catch → return null → show nothing |
| Cached reflection exists | Show it immediately (RSC, no loading state needed) |

No loading spinner. No error message. Silence is the correct fallback.

---

## Mobile reflow

The reflection paragraph inherits body copy styles — max-width already constrained by the page layout. No extra mobile work needed.

---

## Pages × tests matrix

| What | Test type | File |
|---|---|---|
| `currentIsoWeek` and `getWeekDateRange` | Unit | `src/lib/__tests__/weeklyReflection.test.ts` |
| `getWeeklyReflection` cache hit | Unit (mock supabase) | same |
| `getWeeklyReflection` < 3 entries → null | Unit | same |
| Settings toggle saves + reads | E2E | `e2e/settings.spec.ts` (extend existing) |
| `/log` with reflection | E2E | `e2e/log.spec.ts` (extend existing) |

---

## Verify gate

```bash
pnpm verify
```

---

## Commit body template

```
feat: weekly reflection — phase 37

- add weekly_reflection_opt_in to profiles via migration 20260619000000
- new weekly_reflections cache table (user_id, iso_week, primary key)
- src/lib/weeklyReflection.ts: ISO week helpers + getWeeklyReflection
- GET /api/weekly-reflection: serve cached or generate on first view
- settings: weekly reflection opt-in toggle (off / on)
- /log: surface reflection above mosaic when opted in and ≥ 3 entries
- voice: observational, lower-case, no praise, no prescriptions
- tests: unit (weeklyReflection.ts), e2e (settings + log)

Decisions:
- min 3 entries: below that the paragraph would be too thin to be useful
- GET only: cache-then-generate removes any need for a separate POST
- inline lib call from RSC: avoids HTTP round-trip on /log server render
- max 300 tokens: forces one paragraph; longer would dilute the tone

Closes #<PHASE_ISSUE>
```

---

## Definition of Done

- [ ] Migration `20260619000000` applied (local Supabase)
- [ ] `weekly_reflection_opt_in` in `ProfileRow` type + settings route + settings form
- [ ] `getWeeklyReflection` returns null gracefully when entry count < 3 or key missing
- [ ] Reflection visible on `/log` when opt-in = true and ≥ 3 entries in current ISO week
- [ ] Provenance label "written by ember from your week" rendered below reflection
- [ ] Unit tests green
- [ ] E2E tests green
- [ ] `pnpm verify` passes
- [ ] Committed + pushed with Cloud-Run trailer

---

## Follow-ups (out of scope for this phase)

- Delete/regenerate button (current week only) — users may want a refresh if they add more entries
- Past-week reflections: browsable history on `/log` with a week picker
- Notification: "your reflection is ready" email hook when a week closes
