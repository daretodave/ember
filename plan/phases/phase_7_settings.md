# Phase 7 — Settings

## Outcome

`/settings` lets authenticated users set their display name, timezone, and
optional public username. Changes persist to a `profiles` table in Supabase.

## Why

Timezone is load-bearing for `/today`: until a user sets their timezone the
date stamp shows UTC, which is wrong for users far from UTC. Display name and
username unlock phase 8 (public profile). All three fields belong in a single
Settings form — simple, one page, no wizards.

## Scope

### Pages
- `/settings` — auth-required server component (loads current profile);
  delegates interactive form to `SettingsForm` client component

### API
- `POST /api/settings` — upsert profile row for authenticated user

### Lib
- `src/lib/profile.ts` — `getProfile(supabase, userId)`,
  `ProfileRow` type

### DB
- `supabase/migrations/20260502000000_create_profiles.sql` — `profiles` table
  with RLS; one row per auth user

### Components
- `src/app/settings/SettingsForm.tsx` — client component (display name input,
  timezone select, username input, save button, save-state feedback)

## Design reference

No `Ember · Settings.html` exists in the design folder at phase-7 ship time.
Decision: implement following the full visual law in `design/CLAUDE.md` and
the established patterns from `/today` and `/log`. Same header/nav, same token
set, same form primitives (textarea → text input / select). No new visual
elements invented. If a future design pass commissions a Settings HTML, the
port cost is minimal because this implementation is token-faithful throughout.

## Data model

```sql
create table public.profiles (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  username     text unique,
  timezone     text        not null default 'UTC',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
```

RLS: users can select/insert/update their own row only.

Username constraints: lowercase alphanumeric + hyphens only, 3–30 chars,
must start with a letter. Validated server-side; client shows an inline error.

## Page composition

```
<header>            lockup + nav ("settings" marked current)
<main>
  <h1>              "settings" — Source Serif 4 32px
  <form>
    <fieldset>      display name
      <label>       Inter 12px uppercase muted
      <input>       Source Serif 4 17px, same border-bottom style as /today
    <fieldset>      timezone
      <label>       Inter 12px uppercase muted
      <select>      Inter 14px, full IANA list via Intl.supportedValuesOf()
    <fieldset>      public username
      <label>       Inter 12px uppercase muted
      <p class=hint> "your public profile lives at ember.app/u/username"
      <input>       Source Serif 4 17px; prefix "@" shown inline
    <div>           save button (right-aligned) + status (left-aligned)
```

## Empty / error states

- **No profile yet:** form loads with empty fields + timezone defaulting to the
  browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` (detected
  client-side; falls back to 'UTC' if unavailable).
- **Username taken:** `POST /api/settings` returns `{ error: 'username taken' }`
  → inline error beneath the username field.
- **Username invalid format:** same — server validates, returns 400.
- **Save success:** "saved." appears in Inter 14px muted left of the button.
  Fades to nothing after 3 s via CSS transition on opacity.
- **Save error:** "something went wrong. try again." in `--color-signal-error`.

## Decisions (pre-decided — DO NOT ASK)

1. **Client-side timezone detect:** `SettingsForm` reads
   `Intl.DateTimeFormat().resolvedOptions().timeZone` on mount if `timezone`
   prop is 'UTC' and no explicit save has been made (detected via a `virgin`
   flag in the profile response). Does NOT auto-save — populates the select,
   user saves manually.
2. **`virgin` flag:** not a DB column. The API returns `{ virgin: true }` when
   the row was just created (no prior explicit save). The form uses this to
   decide whether to suggest the browser timezone. A row without a prior save
   is recognizable because `created_at == updated_at`.
3. **Timezone select population:** `Intl.supportedValuesOf('timeZone')` renders
   100–400 options depending on browser. That is acceptable for v1 — no custom
   component needed.
4. **Username format:** `/^[a-z][a-z0-9-]{2,29}$/` — starts with letter,
   lowercase alphanumeric + hyphens, 3–30 chars total. Server-side only.
5. **Empty username:** allowed. An empty username means no public profile.
   Saving an empty username sets the column to NULL (not an empty string).
6. **Display name empty:** allowed. Falls back to email on public profile (phase 8).
7. **No debounced save / auto-save:** save button only, same as `/today`.
8. **`/today` timezone retrofit:** not in this phase. The `/today` date stamp
   continues to show UTC. A follow-up commit (or phase 9 polish) retrofits it.
   This keeps phase 7 focused on the settings surface itself.
9. **No sign-out button on /settings:** sign-out is already in the nav of other
   pages. Adding it to settings would duplicate it. Settings is a form page, not
   a session-management hub.
10. **Form method:** client-side `fetch` to `POST /api/settings` — mirrors the
    `/today` entry save pattern.

## Tests

### Unit (Vitest)
- `src/lib/__tests__/profile.test.ts`
  - `getProfile` returns null on missing row
  - `getProfile` returns profile on present row
  - `getProfile` returns null on Supabase error

### API unit (Vitest)
- `src/app/api/settings/__tests__/route.test.ts`
  - rejects unauthenticated request with 401
  - rejects invalid username with 400
  - upserts valid payload; returns profile

### E2E (Playwright)
- `apps/e2e/tests/settings.spec.ts`
  - `/settings` redirects unauthenticated user to `/signin`
  - No horizontal overflow at 375px on `/signin` redirect

## Cross-link retrofits

Nav links to `/settings` are already present in `/today` and `/log` headers
(the `<a href="/settings">settings</a>` node). No retrofit needed.

## Verify gate

```bash
pnpm verify   # typecheck + test:run + build + e2e
```

## Commit body template

```
feat: settings page — phase 7

- Adds /settings (auth-required) with display name, timezone, username form
- Adds profiles table + migration + RLS policy
- Adds POST /api/settings (upsert profile, username uniqueness check)
- Adds src/lib/profile.ts with getProfile helper
- Client detects browser timezone on virgin profile and pre-fills select
- Unit tests for getProfile + API route; E2E redirect + overflow checks

Decisions:
- No Settings HTML in design folder; implemented token-faithful following
  design/CLAUDE.md visual law and /today //log patterns (see brief)
- virgin flag derived from created_at == updated_at, not a DB column
- Timezone detect is suggestion-only; user saves manually (no auto-save)
```

## DoD

- [ ] `pnpm verify` exits 0
- [ ] `/settings` redirects unauthenticated → `/signin`
- [ ] Authenticated user sees form pre-populated from DB (or empty on first visit)
- [ ] Saving valid payload persists to `profiles` table
- [ ] Invalid username returns inline error
- [ ] No horizontal overflow at 375px

## Follow-ups (out of scope)

- Retrofit `/today` date stamp to use saved timezone
- Sign-out action on settings page (if user research shows demand)
- Email preferences section (v1 is pull-based; nothing to configure yet)
