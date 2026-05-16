# Phase 11 — Perf pass

## Outcome

Four targeted improvements land in one pass: RSC streaming skeletons
on all auth-gated routes, parallel fetch on the public profile page,
ISR revalidation hints on anonymously-readable routes, and security
response headers applied globally via next.config.ts.

## Why

Phases 1–10 built and polished the full feature surface. Performance
work applies now that the component tree is stable; restructuring
skeletons after future layout changes would be wasteful.

## Scope

### 1. RSC streaming skeletons (loading.tsx)

Four `loading.tsx` files for auth-gated routes. Each creates an
automatic Next.js Suspense boundary: the skeleton renders on the first
HTTP chunk while the page awaits Supabase calls.

Shared primitives:
- `src/components/loading/PageSkeleton.tsx` — header chrome + muted
  placeholder blocks
- `src/components/loading/page-skeleton.module.css` — styles

Per-route loading files (thin wrappers):
- `src/app/today/loading.tsx`
- `src/app/log/loading.tsx`
- `src/app/settings/loading.tsx`
- `src/app/log/[date]/loading.tsx`

Skeleton shows:
- Wordmark + nav chrome identical to the real page's header
- Three muted static placeholder blocks (no animation — ember's motion
  budget covers mosaic fade only; see design/CLAUDE.md)
- `<main id="main-content" aria-busy="true">` so the skip link target
  is present in the loading state

### 2. Parallel fetch in /u/[username]/page.tsx

Currently `getProfileByUsername` and `supabase.auth.getUser()` are
sequential. They have no interdependency; run them concurrently:

```typescript
const [profile, { data: { user } }] = await Promise.all([
  getProfileByUsername(supabase, username),
  supabase.auth.getUser(),
])
if (!profile || !profile.username) notFound()
```

`getPublishedEntriesForUser` still runs after (needs `profile.user_id`).

### 3. ISR revalidation on public routes

`/u/[username]` and `/u/[username]/[date]` are anonymously readable.
Add `export const revalidate = 60` to both — Vercel caches the
rendered HTML for 60 seconds, reducing cold Supabase round-trips for
repeated page views.

Auth-gated routes are excluded (they redirect unauthenticated users;
ISR doesn't apply).

### 4. Security response headers in next.config.ts

Add a `headers()` function covering all routes (`/(.*)`):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

No `Content-Security-Policy` this phase — a correct CSP requires
enumerating Supabase auth endpoints, Google Fonts CDN, and Vercel
edge infrastructure. Deferred to a dedicated security pass.

## Decisions (pre-decided — DO NOT ASK)

1. **No animation on loading skeletons.** ember's motion budget is the
   mosaic 200ms fade-in + 1px hover. Skeleton shimmer is out of budget.
   Static muted blocks only.

2. **`revalidate = 60` on public routes.** 60 seconds balances freshness
   vs. Supabase call volume. Auth-gated routes excluded.

3. **No Content-Security-Policy.** A correct CSP requires exhaustive
   endpoint enumeration; it belongs in a dedicated security pass.

4. **`X-Frame-Options: SAMEORIGIN` not `DENY`.** Safer default for
   potential future same-origin embed scenarios.

5. **Shared `PageSkeleton` component, not inline per-route.** All four
   auth-gated loading files show the same chrome; one component is DRY
   without introducing abstraction overhead.

6. **Skeleton nav uses `<a>` tags.** The loading state is brief but
   functional; real links allow keyboard navigation during load.

7. **`aria-busy="true"` on skeleton `<main>`.** Signals to AT that
   content is loading. Removed by the actual page render.

## Components / files changed

New:
- `src/components/loading/PageSkeleton.tsx`
- `src/components/loading/page-skeleton.module.css`
- `src/app/today/loading.tsx`
- `src/app/log/loading.tsx`
- `src/app/settings/loading.tsx`
- `src/app/log/[date]/loading.tsx`
- `apps/e2e/tests/perf.spec.ts`

Modified:
- `src/app/u/[username]/page.tsx` — parallel fetch + revalidate
- `src/app/u/[username]/[date]/page.tsx` — revalidate
- `next.config.ts` — security headers

## Pages × tests matrix

| Route | Test |
|---|---|
| `/` | `x-content-type-options: nosniff` header present |
| `/signin` | `x-content-type-options: nosniff` header present |

New file: `apps/e2e/tests/perf.spec.ts`

## Verify gate

```bash
pnpm verify
```

## DoD

- [ ] `pnpm verify` exits 0
- [ ] Four `loading.tsx` files created (today, log, settings, log/[date])
- [ ] `PageSkeleton` shared component exists with correct CSS
- [ ] `/u/[username]/page.tsx` runs profile + auth fetches in parallel
- [ ] `revalidate = 60` on both public profile routes
- [ ] Security headers in `next.config.ts`
- [ ] `apps/e2e/tests/perf.spec.ts` passes

## Follow-ups (out of scope for this phase)

- `Content-Security-Policy` header — requires CSP endpoint audit
- `@next/bundle-analyzer` — run locally on demand when bundle grows
- `generateStaticParams` for public profiles — needs known-username list
  from DB at build time; too fragile for v1
- Skeleton pulse/shimmer animation — out of motion budget; revisit if
  design/CLAUDE.md is updated
- `aria-live` region for async save-state messages (TodayEntry,
  SettingsForm) — carry-over from Phase 10 follow-ups
