# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

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
