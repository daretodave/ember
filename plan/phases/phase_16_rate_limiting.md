# Phase 16 — Rate limiting

## Why

`bearings.md` specifies two anti-abuse limits that have not been enforced:

- Magic-link send: 3 per email per 24 h (rolling window)
- Entry write: 10 per user per UTC calendar day (soft ceiling)

Without these, a scripted caller could spam magic-link emails or write-flood the entries table.

## Outcome

Server-side enforcement in `/api/auth/signin` and `/api/entries`.
Returns HTTP 429 with `{ error: "rate limit exceeded" }` (matching the
error-state standing decision in `bearings.md`). No new URL family.

## Storage decision

A `rate_limit_events` table in Postgres + a `check_rate_limit` SECURITY
DEFINER function. The function atomically counts events in the window and
records the current attempt; it bypasses RLS so neither the signin (anon)
nor the entry (authenticated) route needs elevated credentials. The table
has RLS enabled with no policies, making it inaccessible except through
the function.

Counting against `entries` rows was considered but rejected: entry upsert
creates/updates one row per day, so it can't track write *operations*.

## Implementation plan

1. **Migration** `supabase/migrations/20260521000000_rate_limits.sql`
   - `rate_limit_events` table (id, key, created_at)
   - `check_rate_limit(p_key, p_since, p_max)` SECURITY DEFINER function
   - RLS enabled on table, no policies (inaccessible except via function)
   - `GRANT EXECUTE ON FUNCTION check_rate_limit TO anon, authenticated`

2. **Lib** `src/lib/rate-limit.ts`
   - `checkRateLimit({ key, windowStart, max })` — calls the RPC, fails open on error
   - Colocated unit tests

3. **Wire `/api/auth/signin`**
   - Before `signInWithOtp`: check `signin:<email>`, 24 h window, max 3
   - Return 429 if blocked

4. **Wire `/api/entries`**
   - Before upsert: check `entry:<user_id>:<today-utc>`, window start = today UTC midnight, max 10
   - Return 429 if blocked

5. **Tests** (unit tests for lib + updated route tests covering 429 path)

## Notes

- Fail open: if the Postgres RPC errors, the request is allowed. Abuse
  prevention should not accidentally block real users on infra hiccups.
- The function owner is the migration executor (supabase_admin). SECURITY
  DEFINER ensures the anon role's calling context never touches the table
  directly.
- No e2e test: rate limiting is server-side logic with no UI surface. Unit
  coverage is the right level.
