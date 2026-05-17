# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [6.3] stale useCallback closure in SettingsForm silently ignores personalizedVal on save

- category: bug
- impact: 7
- ease: 9
- observation: `src/app/settings/SettingsForm.tsx` `handleSave` useCallback lists `[nameVal, usernameVal, tzVal]` as deps but reads `personalizedVal` inside the body. If a user changes only the "prompt variety" radio and clicks save, the stale closure sends the old value; the toggle appears to save but the preference is silently ignored.
- evidence: `handleSave` line 55 in SettingsForm.tsx — `personalizedVal` used at line 67 but absent from dep array `[nameVal, usernameVal, tzVal]` (line 82).
- suggested fix: add `personalizedVal` to the `useCallback` dependency array. One token change.
- next: fix inline — one-token change, no schema impact
- issue: #9

### [user-issue #6] [HIGH] [needs-user-call] entries table missing from Supabase — migrations not applied

- category: external-issue
- impact: 9
- ease: 6
- issue: #6
- investigated: 2026-05-16 — confirmed all 4 migrations in supabase/migrations/ were never applied to the connected project. Direct DB is IPv6-only (unreachable from CI runner); Management API requires a PAT that is not provisioned.
- shipped: scripts/migrate.mjs + pnpm db:migrate (Path B); full SQL posted to issue #6 comment (Path A — paste into Supabase SQL Editor, no tools needed).
- next: user must apply migrations via one of the two paths in issue #6. Once applied, add SUPABASE_ACCESS_TOKEN to GitHub Actions secrets so the cloud loop can push future migrations automatically.

### [x] [5.4] robots.txt and sitemap.xml absent — site is not crawlable

- category: seo
- impact: 6
- ease: 9
- issue: #7
- observation: no robots.txt and no sitemap.xml. Search engines crawl protected routes (/today, /log, /settings) and receive redirects; no index hint for the public landing page.
- evidence: `find src/app -name 'robots*' -o -name 'sitemap*'` returns nothing. No public/ directory.
- suggested fix: add `src/app/robots.ts` (allow /, disallow private routes) and `src/app/sitemap.ts` (list static public URLs) using Next.js 15 App Router file conventions.
- next: implement via main agent — two small files, no schema changes

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
- observation: `src/app/auth/callback/route.ts` handles magic-link code exchange but has no collocated unit test. All other API routes have test coverage.
- evidence: `find src/app/api -name '*.test.ts'` shows entries and settings covered; callback route is at `src/app/auth/callback/` (not under api/) and has no sibling `__tests__/`.
- suggested fix: add `src/app/auth/callback/__tests__/route.test.ts` with tests for: missing code → redirect to /signin?error=auth; Supabase error → redirect to /signin?error=auth; success → redirect to /today.
- resolution: added `src/app/auth/callback/__tests__/route.test.ts` with 3 tests covering all three branches. Shipped at bef2c0e.

## Done

### [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- resolution: added `VERCEL_PROJECT_PRODUCTION_URL` as fallback in `src/app/api/auth/signin/route.ts` so the route no longer falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is absent. Added two targeted tests covering the env-var fallback chain. Note: the Supabase Dashboard "Site URL" at Authentication → URL Configuration should also be set to the production Vercel URL — that is a user action in the Supabase console.
