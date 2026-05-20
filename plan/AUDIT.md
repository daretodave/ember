# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [x] [3.6] test — settings route missing `use_personalized_prompts` test coverage

- category: tests
- impact: 4
- ease: 9
- observation: `POST /api/settings` handles `use_personalized_prompts` (added in phase 12) at lines 57–59 of `src/app/api/settings/route.ts`, but the test suite has no test that includes this field in the request body. If the field is silently dropped during a future refactor, no test catches it. Every other accepted field (display_name, username, timezone, conflict handling) has explicit coverage.
- evidence: `src/app/api/settings/route.ts` lines 57–59: `if (use_personalized_prompts !== undefined && typeof use_personalized_prompts === 'boolean')`. `src/app/api/settings/__tests__/route.test.ts`: 6 tests, none pass `use_personalized_prompts` in the body.
- suggested fix: add a test that sends `{ use_personalized_prompts: true }` and asserts `mockUpsert` was called with `expect.objectContaining({ use_personalized_prompts: true })`.
- issue: [mirror-failed: 2026-05-20T00:00:00Z]

### [ ] [2.7] perf — DayStrip "see all sixty" link is a raw `<a>` anchor

- category: perf
- impact: 3
- ease: 9
- observation: `src/app/today/DayStrip.tsx` renders `<a href="/log" className={styles.stripLink}>see all sixty</a>`, causing a full-page reload when clicked. The nav-link audit (finding [4.5]) fixed all nav anchors but missed this content link in DayStrip.
- evidence: `src/app/today/DayStrip.tsx` line ~46: raw `<a href="/log">`.
- suggested fix: import `Link` from `next/link` in DayStrip.tsx and replace `<a href="/log">` with `<Link href="/log">`.

### [ ] [2.7] a11y — DayStrip section has no accessible heading

- category: a11y
- impact: 3
- ease: 9
- observation: `<section className={styles.strip}>` in `DayStrip.tsx` uses a `<span>` for its visible label "your last seven days". Screen reader users navigating by headings skip straight from the page `<h1>` (today's prompt) to nothing inside DayStrip. Unlabeled sections are not exposed as named landmarks.
- evidence: `src/app/today/DayStrip.tsx` line ~41: `<span className={styles.stripLabel}>your last seven days</span>` — plain span, not a heading.
- suggested fix: change `<span className={styles.stripLabel}>` to `<h2 className={styles.stripLabel}>` to add the section to heading navigation.

### [x] [4.5] perf — site nav uses raw `<a>` tags; full-page reload on every authenticated navigation

- category: perf
- impact: 5
- ease: 9
- observation: all four authenticated page layouts (`today/`, `log/`, `log/[date]/`, `settings/`) render the site nav with raw `<a href="...">` anchors instead of Next.js `<Link>`. Raw anchors trigger full-page reloads; `<Link>` enables client-side transitions and prefetching. `Link` is already imported in all four files.
- evidence: `src/app/today/page.tsx` lines 63–65; `src/app/log/page.tsx` lines 73–76; `src/app/log/[date]/page.tsx` lines 62–65; `src/app/settings/page.tsx` lines 38–40 and line 54.
- suggested fix: replace `<a href="...">` with `<Link href="...">` in all four nav blocks and the settings profile link.
- issue: #23

### [x] [4.0] bug — entries API accepts future dates; UI rejects them

- category: bug
- impact: 5
- ease: 8
- observation: `POST /api/entries` validates date format (YYYY-MM-DD) but does not check whether the date is in the future. Authenticated users can submit entries for future dates. These rows are stored in the DB but are inaccessible via the UI — `log/[date]/page.tsx` already calls `notFound()` for any date > today. The inconsistency creates phantom rows that violate the product model (one entry per day, written on that day).
- evidence: `src/app/api/entries/route.ts` lines 31–33: validates format only, no temporal bound. `src/app/log/[date]/page.tsx` lines 26–29: rejects future dates with `notFound()`.
- suggested fix: derive UTC today as `new Date().toISOString().slice(0, 10)`, check `if (date > today)` and return 400. Add a test for this branch.
- issue: #22
- resolution: added today-date guard in `src/app/api/entries/route.ts` and a new test. Shipped at c5ffb03.

### [x] [5.4] a11y — SigninPage error message has no role="alert"

- category: a11y
- impact: 6
- ease: 9
- observation: `src/app/signin/page.tsx` renders `<p className={styles.errorMsg}>{errorMsg}</p>` when `state === 'error'`, but the paragraph carries no `role="alert"` and no `aria-live`. When sign-in fails (invalid email, Supabase rate-limit, network error) the error text appears visually but screen readers receive no announcement — identical to the pattern already fixed in TodayEntry and SettingsForm.
- evidence: `src/app/signin/page.tsx` line 86: `<p className={styles.errorMsg}>{errorMsg}</p>` — no role, no aria-live, dynamically rendered on error.
- suggested fix: add `role="alert"` to the error paragraph.
- issue: #19

### [x] [4.5] test — signout route has no unit tests

- category: tests
- impact: 5
- ease: 9
- observation: `src/app/auth/signout/route.ts` exports POST (calls `supabase.auth.signOut()` then redirects to `/`) and GET (returns 405). Neither branch has a test. Every other API route has colocated tests.
- evidence: `find src -path "*/signout*test*"` returns no results.
- suggested fix: add `src/app/auth/signout/__tests__/route.test.ts` with 2 tests: POST signs out and redirects to `/`; GET returns 405.
- issue: #20
- resolution: added `src/app/auth/signout/__tests__/route.test.ts` with POST and GET tests. Shipped at bbeb643.

### [x] [3.6] seo — log/[date] generateMetadata missing description

- category: seo
- impact: 4
- ease: 9
- observation: `src/app/log/[date]/page.tsx` `generateMetadata` returns only `{ title }` with no `description`. Search engines and social previews fall back to the root layout description ("ten minutes of intention before the day swallows you") for all date-specific log pages.
- evidence: `src/app/log/[date]/page.tsx` lines 15–20: `return { title: \`ember · log · ${date}\` }` — no description key.
- suggested fix: add `description: 'your entry for ${date}'` (or similar) to the return object.
- issue: #21
- resolution: added `description: \`your entry for ${date}\`` to generateMetadata return. Shipped at c0fcf1f.

### [x] [5.6] seo — public profile pages missing openGraph and twitter metadata

- category: seo
- impact: 8
- ease: 7
- observation: `/u/[username]/page.tsx` returned only `title` and `description` from `generateMetadata` — no `openGraph` or `twitter`. `/u/[username]/[date]/page.tsx` returned only `title`. Shared links fell back to the generic root layout card.
- evidence: `src/app/u/[username]/page.tsx` lines 17–23; `src/app/u/[username]/[date]/page.tsx` lines 18–23.
- suggested fix: add `openGraph` and `twitter` blocks to both routes' `generateMetadata`, using `NEXT_PUBLIC_SITE_URL` for canonical URLs.
- issue: #17
- resolution: added `description`, `openGraph`, and `twitter` to both routes. Shipped at 7532c5d.

### [x] [5.4] a11y — SettingsForm save feedback has no ARIA live regions

- category: a11y
- impact: 6
- ease: 9
- observation: `SettingsForm.tsx` updates the UI dynamically after save — a "saved." confirmation span and error messages — but neither uses ARIA live regions. The `saveStatus` span always renders "saved." in the DOM; only a CSS class toggles visibility (no content change), so screen readers do not announce the confirmation. The `saveError` span and `fieldError` paragraph are conditionally rendered on error but carry no `role="alert"`.
- evidence: `src/app/settings/SettingsForm.tsx` lines 189–194: `saveStatus` span no `aria-live`; `saveError` span no `role`; line 183–185: `fieldError` paragraph no `role`.
- suggested fix: add `aria-live="polite"` to `saveStatus` span and render conditional content; add `role="alert"` to `saveError` and `fieldError`.
- issue: #16

### [x] [4.8] a11y — LogMosaic tile aria-labels omit entry state

- category: a11y
- impact: 6
- ease: 8
- observation: `LogMosaic.tsx` renders 60 interactive link tiles each with `aria-label={tile.displayDate}`. Screen reader and keyboard users navigating the mosaic hear only the date ("Wed 13 May 2026") with no indication of tile state — whether the day has a written entry, a published entry, or no entry at all.
- evidence: `src/app/log/LogMosaic.tsx` line 82: `aria-label={tile.displayDate}` on every tile regardless of `tile.state` (`empty` | `filled` | `today` | `published`)
- suggested fix: append state description to aria-label: "no entry" / "written" / "today" / "published"
- issue: #15
- resolution: added `tileStateLabel()` helper in LogMosaic.tsx; aria-label now reads "Wed 13 May 2026 — written" etc. Shipped at c8770e7.

### [x] [4.8] a11y — save feedback in TodayEntry has no live region

- category: a11y
- impact: 6
- ease: 8
- observation: `TodayEntry.tsx` updates the `lastSaved` span text dynamically after a save, and conditionally renders an error paragraph on failure. Neither element uses ARIA live regions. Screen reader users won't know when their entry has saved successfully or if a save error has occurred — the only feedback is visual.
- evidence: `src/app/today/TodayEntry.tsx` line 80: `<span className={styles.lastSaved}>` text updates after save with no aria-live; line 103–105: error `<p>` conditionally rendered with no role="alert"
- suggested fix: add `aria-live="polite"` to the `lastSaved` span; add `role="alert"` to the error paragraph
- issue: #14
- resolution: added `aria-live="polite"` to the lastSaved span and `role="alert"` to the save error paragraph in TodayEntry.tsx. Shipped at 8b41e0a.

### [x] [5.4] a11y — task-done state not conveyed to screen readers on log views

- category: a11y
- impact: 6
- ease: 9
- observation: `log/[date]/page.tsx` renders `<span className={styles.entryTaskCheck} />` and `<span className={styles.entryTaskUnchecked} />` as purely visual indicators. `log/page.tsx` renders `<span className={recentEntry.task_done ? styles.entryTaskCheck : undefined} />`. All three spans are empty — no `aria-label`, no `role`, no text. Screen readers see only the task description with no indication of whether the task was completed.
- evidence: `src/app/log/[date]/page.tsx` lines 79–84; `src/app/log/page.tsx` line 104.
- suggested fix: add `role="img"` and `aria-label="task done"` / `aria-label="task not done"` to the task-state spans in both files.
- issue: #13
- resolution: added `role="img"` and `aria-label="task done"`/`"task not done"` to task-state spans in both log pages. Shipped at 22c5da5.

### [x] [6.3] a11y — TodayEntry textarea has no programmatic label

- category: a11y
- impact: 7
- ease: 9
- observation: `src/app/today/TodayEntry.tsx` renders a `<p className={styles.entryLabel}>your response</p>` above the textarea, but it is a plain paragraph, not a `<label>` element. The textarea has no `id`, no `htmlFor` association, and no `aria-label`. Screen readers will not announce "your response" when the user focuses the textarea — the core write surface of the app.
- evidence: `TodayEntry.tsx` lines ~45–52: `<p className={styles.entryLabel}>your response</p>` immediately above `<textarea ... />` with no id, no aria-label, no htmlFor link.
- suggested fix: change the `<p>` to `<label htmlFor="today-entry-response">`, add `id="today-entry-response"` to the textarea.
- issue: #12
- resolution: changed `<p>` to `<label htmlFor="today-entry-response">` and added `id="today-entry-response"` to the textarea. Shipped at 44613b0.

### [x] [5.6] bug — log mosaic counts wrong on today-tile edge case

- category: bug
- impact: 5
- ease: 9
- observation: `src/app/log/page.tsx` computed `written`, `quiet`, and `published` by filtering the `tiles` array on `state`. Two faults: (1) today's tile always has `state = 'today'` (set before the `is_published` check), so a published today-entry is never counted in `published`. (2) today's tile has `state = 'today'` even with no entry yet, inflating `written` by 1 for every new user before they've ever written.
- evidence: tile state machine in `log/page.tsx` sets `state = 'today'` before `is_published` check; `written = tiles.filter(t => t.state !== 'empty').length` always includes today.
- suggested fix: derive counts from the `entries` map directly (`entries.size`, `60 - entries.size`, `[...entries.values()].filter(e => e.is_published).length`).
- resolution: fixed in `src/app/log/page.tsx` — counts now derived from the `entries` map. Shipped this tick.

### [x] [4.2] test gap — auth middleware has no unit tests

- category: tests
- impact: 6
- ease: 7
- observation: `src/middleware.ts` had no unit tests despite being the sole auth guard for all protected routes (`/today`, `/log`, `/settings`). It also redirects authenticated users away from `/signin`.
- evidence: `find src -name "*.test.*" | xargs grep -l "middleware"` returned no results.
- suggested fix: add `src/__tests__/middleware.test.ts` covering unauthenticated redirects, authenticated pass-through, and /signin-to-/today redirect.
- issue: #11
- resolution: added 12 tests in `src/__tests__/middleware.test.ts` using `@vitest-environment node`. Shipped at f5990c2.

### [x] [4.2] content gap — only 20 prompts vs spec target of ~100; rotation repeats every 20 days

- category: content-gaps
- impact: 7
- ease: 6
- observation: `content/prompts.json` contains 20 entries. The deterministic rotation in `src/lib/prompts.ts` cycles `daysSinceEpoch % prompts.length`, so any user practicing daily sees the same prompt every 20 days. Phase 5 brief specified "a seed list of ~100 prompts."
- evidence: `cat content/prompts.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"` → 20
- suggested fix: expand content/prompts.json to ~100 entries in the established voice. Delegate to prompt-curator sub-agent; no schema or code changes required.
- next: spawn prompt-curator sub-agent to write ~80 additional prompts + tasks in the established voice
- issue: #10
- resolution: expanded content/prompts.json from 20 to 101 entries via prompt-curator sub-agent. Shipped at a6d0d49.

### [user-issue #6] [HIGH] [needs-user-call] entries table missing from Supabase — migrations not applied

- category: external-issue
- impact: 9
- ease: 6
- issue: #6
- investigated: 2026-05-16 — confirmed all 4 migrations in supabase/migrations/ were never applied to the connected project. Direct DB is IPv6-only (unreachable from CI runner); Management API requires a PAT that is not provisioned.
- shipped: scripts/migrate.mjs + pnpm db:migrate (Path B); full SQL posted to issue #6 comment (Path A — paste into Supabase SQL Editor, no tools needed).
- next: user must apply migrations via one of the two paths in issue #6. Once applied, add SUPABASE_ACCESS_TOKEN to GitHub Actions secrets so the cloud loop can push future migrations automatically.

## Done

### [x] [6.3] stale useCallback closure in SettingsForm silently ignores personalizedVal on save

- category: bug
- impact: 7
- ease: 9
- resolution: added `personalizedVal` to the `useCallback` dependency array. Shipped at 0419eb3.
- issue: #9

### [x] [5.4] robots.txt and sitemap.xml absent — site is not crawlable

- category: seo
- impact: 6
- ease: 9
- issue: #7
- resolution: added `src/app/robots.ts` and `src/app/sitemap.ts` using Next.js 15 App Router conventions. Shipped at 8e399c7.

### [x] [4.9] OG / social metadata absent on all pages

- category: seo
- impact: 7
- ease: 7
- resolution: added openGraph (type, siteName, title, description, url) and twitter card (summary) to root layout metadata. Text cards now surface on every social/messaging platform. No OG image for v1. Shipped at 2907586.

### [x] [4.0] auth/callback route has no unit test

- category: tests
- impact: 5
- ease: 8
- issue: #8
- resolution: added `src/app/auth/callback/__tests__/route.test.ts` with 3 tests covering all three branches. Shipped at bef2c0e.

### [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- resolution: added `VERCEL_PROJECT_PRODUCTION_URL` as fallback in `src/app/api/auth/signin/route.ts` so the route no longer falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is absent. Added two targeted tests covering the env-var fallback chain. Note: the Supabase Dashboard "Site URL" at Authentication → URL Configuration should also be set to the production Vercel URL — that is a user action in the Supabase console.
