# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [user-issue #6] [HIGH] [needs-user-call] entries table missing from Supabase — migrations not applied

- category: external-issue
- impact: 9
- ease: 6
- issue: #6
- investigated: 2026-05-16 — confirmed all 4 migrations in supabase/migrations/ were never applied to the connected project. Direct DB is IPv6-only (unreachable from CI runner); Management API requires a PAT that is not provisioned.
- shipped: scripts/migrate.mjs + pnpm db:migrate (Path B); full SQL posted to issue #6 comment (Path A — paste into Supabase SQL Editor, no tools needed).
- next: user must apply migrations via one of the two paths in issue #6. Once applied, add SUPABASE_ACCESS_TOKEN to GitHub Actions secrets so the cloud loop can push future migrations automatically.

## Done

### [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- resolution: added `VERCEL_PROJECT_PRODUCTION_URL` as fallback in `src/app/api/auth/signin/route.ts` so the route no longer falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is absent. Added two targeted tests covering the env-var fallback chain. Note: the Supabase Dashboard "Site URL" at Authentication → URL Configuration should also be set to the production Vercel URL — that is a user action in the Supabase console.
