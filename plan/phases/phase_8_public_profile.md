# Phase 8 — Public Profile

## Outcome

`/u/[username]` renders a read-only public profile: identity, 60-day
mosaic (published tiles only), privacy note, and most-recent published
entry with prev/next navigation among published entries.

`/u/[username]/[date]` renders a single published entry with the same
prev/next navigation.

Both routes are anonymously accessible. No authentication required to
view.

## Why

Settings (phase 7) lets users opt in to a public username. Phase 8
delivers on that promise. A published entry with `is_published = true`
leaks nothing about unpublished days — the mosaic on the public profile
shows only published tiles.

## Scope

### Pages

- `/u/[username]` — public, anonymous-accessible Server Component:
  - looks up profile by username → 404 if not found or username not set
  - builds 60-day mosaic from published entries only
  - shows most recent published entry inline with prev/next nav
  - empty state if user has no published entries
- `/u/[username]/[date]` — public, anonymous-accessible Server Component:
  - validates date format → 404
  - fetches published entry for that date → 404 if absent or private
  - prev/next nav among all published entries for this user

### DB migration

`supabase/migrations/20260515000000_public_read_policies.sql`

Two new permissive SELECT policies (OR'd with existing user-owned policies):

```sql
-- anyone can read a profile row where username is set (public profile opt-in)
create policy "public profiles are readable by username"
  on public.profiles for select
  using (username is not null);

-- anyone can read published entries
create policy "published entries are publicly readable"
  on public.entries for select
  using (is_published = true);
```

### Lib

`src/lib/profile.ts` — add `getProfileByUsername(supabase, username)`

`src/lib/entries.ts` — add:
- `getPublishedEntriesForUser(supabase, userId)` — last 60 days, published
- `getPublishedEntryByDate(supabase, userId, date)` — single published entry
- `getAdjacentPublishedDates(supabase, userId, date)` — prev/next dates

### Components

`src/app/u/[username]/ProfileMosaic.tsx` — client component; published tiles
link to `/u/[username]/[date]`, empty tiles have no interaction.

### CSS

- `src/app/u/[username]/page.module.css`
- `src/app/u/[username]/[date]/page.module.css`

## Design reference

`design/Ember · Profile.html` is the production target. Port to React +
CSS Modules. Key layout:

```
<header>           lockup + "sign in" link (if anonymous) or "your log" (if authed)
<section.identity> h1 (display_name or username), p.handle (@username in mono)
                   [no bio — profiles table has no bio field; omit the element]
<section.mosaic>   "published in the last sixty days" meta + mosaic
                   only tile--published tiles; all others render as empty
<p.privacy-note>   "empty days are private…" — exact copy from design
<div.divider>
<article.entry>    date header (with pub-mark square) + prompt + task + response
<nav.entry-nav>    ← earlier / later → among published entries
```

## Data model

No schema changes beyond the two RLS policies above.

`getPublishedEntriesForUser` queries the last 60 days filtered by
`is_published = true`. The mosaic tile state is:

- `published` if `is_published === true` in the 60-day window
- `empty` for all other tiles (private or unwritten — intentionally
  indistinguishable)

No `today` state on the public profile. No `filled` state.

## Decisions (pre-decided — DO NOT ASK)

1. **No bio field.** The `profiles` table has no bio column. The
   `identity-bio` element from the design HTML is omitted. A future
   phase may add it; this phase does not.
2. **Fallback display name.** If `display_name` is null, show
   `@username` as the h1 instead. Never show the email address.
3. **Header auth-aware.** RSC checks for a session. If authenticated:
   show "your log" link pointing to `/log`. If anonymous: show "sign in"
   link pointing to `/signin`. This mirrors the design's intent without
   hard-coding the anonymous state.
4. **Empty mosaic:** all 60 tiles are rendered as empty. The privacy
   note explains why. No special empty-state mosaic message.
5. **Published entries chronological (oldest→newest in mosaic,
   chronological prev/next in nav).** Mosaic tiles are ordered
   oldest-left to newest-right (row 0 = 59 days ago). Nav: "← earlier"
   goes to an older published date, "later →" goes to a newer one.
6. **Nav prompt title.** The entry-nav shows the display date of the
   adjacent entry. No prompt excerpt (avoids a second round of
   `getPromptForDate` lookups for nav items on the profile page).
   The `/u/[username]/[date]` page shows the full entry; a date label
   in the nav is sufficient.
7. **Empty published state:** if no published entries exist, show the
   mosaic (all empty) + privacy note + "no published entries." in
   Source Serif 4 italic muted. No other empty-state copy.
8. **No `createPublicClient`.** `createClient()` from server.ts uses
   the anon key. The new RLS policies work for both authenticated and
   unauthenticated requests. No new Supabase client variant needed.
9. **`getAdjacentPublishedDates` fetches all published dates.** No
   limit — even users with many published entries will have at most a
   few hundred rows. Acceptable for v1.
10. **404 on private entry.** `/u/[username]/[date]` calls `notFound()`
    if the entry is not published, even if it exists. The public profile
    must not leak whether an entry exists.

## Page composition — `/u/[username]`

```
<header>            lockup + sign-in / your-log link
<section.identity>
  <h1>              display_name ?? "@{username}" — Source Serif 4 32px
  <p.handle>        @{username} — JetBrains Mono 14px muted
<section.mosaicWrap>
  <p.mosaicMeta>    "published in the last sixty days"
  <ProfileMosaic>   client component
<p.privacyNote>     exact copy from design
<div.divider>
{published entries exist ?
  <article.entryView>
    <header.entryDate>  pub-mark + displayDate + " · published"
    <h1.entryPrompt>    prompt text
    <p.entryTask>       task text
    <div.entryResponse> paragraphs
  <nav.entryNav>
    prev link ("← earlier") | next link ("later →")
  :
  <p.emptyState>    "no published entries."
}
```

## Page composition — `/u/[username]/[date]`

```
<header>            lockup + sign-in / your-log link
<main>
  <a.backLink>      "back to {username}'s profile"
  <header.entryDate> pub-mark + displayDate + " · published"
  <h1.entryPrompt>  prompt text
  <p.entryTask>     task text
  <div.entryResponse> paragraphs
<nav.entryNav>      ← earlier | later →
```

## Empty / error states

- **Username not found:** `notFound()` → 404
- **Date invalid format / future:** `notFound()` → 404
- **Entry not published / doesn't exist:** `notFound()` → 404
- **No published entries on profile:** empty mosaic + privacy note +
  "no published entries." italic muted

## Tests

### Unit (Vitest)

`src/lib/__tests__/profile.test.ts` — add `getProfileByUsername`:
- returns null when username not found
- returns profile row when found
- returns null on error

`src/lib/__tests__/entries.test.ts` — add:
- `getPublishedEntriesForUser`: empty map on error; map keyed by date
- `getPublishedEntryByDate`: null on miss; returns entry when found
- `getAdjacentPublishedDates`: returns { prev, next } for known date;
  null edges when at first/last

### E2E (Playwright)

`apps/e2e/tests/profile.spec.ts`:
- `/u/doesnotexist` → 404 (page returns non-200 or shows not-found text)
- `/u/doesnotexist/2026-05-15` → 404
- No horizontal overflow at 375px on a 404-returning profile URL

## Cross-link retrofits

No retrofits needed in this phase. The authenticated nav already lacks a
link to public profiles (user identity is private by default). Phase 9
(polish) can add a "view your public profile" link to `/settings` once
a username is set.

## Verify gate

```bash
pnpm verify   # typecheck + test:run + build + e2e
```

## Commit body template

```
feat: public profile — phase 8

- Adds /u/[username] public profile: identity + mosaic (published only) + entry
- Adds /u/[username]/[date] single published entry with prev/next nav
- Adds RLS policies allowing anon SELECT on published entries + profiles
- Adds getProfileByUsername, getPublishedEntriesForUser, getPublishedEntryByDate,
  getAdjacentPublishedDates to lib/profile.ts and lib/entries.ts
- ProfileMosaic client component: published tiles link to entry, others inert
- Unit tests for all new lib functions; E2E 404 smoke test

Decisions:
- No bio field (profiles table has no bio column); identity-bio element omitted
- Header shows "sign in" if anonymous, "your log" if authenticated
- Empty tiles on public mosaic are indistinguishable (private or unwritten)
- No createPublicClient needed; new RLS policies work for all auth states
```

## DoD

- [ ] `pnpm verify` exits 0
- [ ] `/u/nonexistent` returns 404
- [ ] `/u/[username]` with a valid username renders the profile
- [ ] Published tiles in mosaic link to `/u/[username]/[date]`
- [ ] Privacy note appears verbatim
- [ ] `/u/[username]/[date]` for a published entry renders correctly
- [ ] `/u/[username]/[date]` for an unpublished entry returns 404
- [ ] No horizontal overflow at 375px

## Follow-ups (out of scope)

- "View your public profile" link on `/settings` when username is set
- Retrofit `/log/[date]` with a publish toggle (phase 9 or standalone)
- Open Graph metadata for public profile / entry pages
