# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [user-issue #6] [HIGH] entries table missing from Supabase schema cache — POST /api/entries returns 400

- category: external-issue
- impact: 9
- ease: 6
- next: /iterate will investigate whether the `entries` table migration was applied to the connected Supabase project; if the table is absent, apply the migration and reload the PostgREST schema cache. Reference #6 in commit body.

## Done

### [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- resolution: added `VERCEL_PROJECT_PRODUCTION_URL` as fallback in `src/app/api/auth/signin/route.ts` so the route no longer falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is absent. Added two targeted tests covering the env-var fallback chain. Note: the Supabase Dashboard "Site URL" at Authentication → URL Configuration should also be set to the production Vercel URL — that is a user action in the Supabase console.
