# Phase 24 — Account deletion

## Outcome

`DELETE /api/account` deletes the authenticated user's account (entries and profile
cascade via existing FK constraints). A "delete my account and all my entries" flow
on `/settings` — explicit two-step inline confirmation, visually separated from save
and sign-out controls. GDPR right-to-erasure closure.

## Why

Users who wish to leave have no self-service erasure path. This closes the GDPR
right-to-erasure expectation and is the natural companion to Phase 23's data export.

## Routes / API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| DELETE | `/api/account` | required | Delete account: cascades entries + profile, returns 200 |

Locked from bearings. No new page URL family.

## Content / data reads

| Helper | Call | Use |
|---|---|---|
| `createClient` (server) | `supabase.auth.getUser()` | Auth guard |
| `createAdminClient` (new) | `adminClient.auth.admin.deleteUser(uid)` | Permanent deletion via service role |

## Components / handlers

New:
- `src/lib/supabase/admin.ts` — `createAdminClient()`: creates a Supabase client with
  `SUPABASE_SERVICE_ROLE_KEY`; used only server-side (never imported in client bundles)
- `src/app/api/account/route.ts` — DELETE handler
- `src/app/api/account/__tests__/route.test.ts` — unit tests
- `src/app/settings/DeleteAccountSection.tsx` — client component: two-step inline
  confirmation UI

Modified:
- `src/app/settings/page.tsx` — add `<DeleteAccountSection />` below export link
- `src/app/settings/page.module.css` — `.deleteSection`, `.deleteBtn`, `.deleteConfirm`,
  `.deleteCancelBtn`, `.deleteConfirmBtn` styles

## Deletion semantics

1. Both `entries` and `profiles` already carry `ON DELETE CASCADE` on their
   `auth.users(id)` FK (migrations `20260101000000` and `20260502000000`). No new
   migration is required.
2. `rate_limit_events` rows keyed to this user (`entry:{uid}:…`) are left as orphaned
   text-keyed rows — no user PII, no FK, negligible volume.
3. After `auth.admin.deleteUser(uid)` the user's JWT is invalidated in Supabase.
   The client navigates to `/` on success; the middleware's `getUser()` returns null
   on any subsequent protected-route access and redirects to `/signin`.

## Admin client

```ts
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
```

`SUPABASE_SERVICE_ROLE_KEY` is already provisioned in Vercel and locally (bootstrap step).

## Confirmation UI

Two-step inline flow — no modal, consistent with no-shadows design rule:

1. Default: a low-key "delete my account and all my entries" link/button in destructive
   register (uses `var(--color-signal-error)` text, no background, no border).
2. On click: expands an inline confirmation panel directly below it:
   - Copy: "permanently delete your account and all entries. there is no undo."
   - Two buttons: "cancel" (muted, resets to step 1) + "delete account" (error-colored
     filled button, distinct from save button which is ink-colored)
3. On DELETE success: `router.push('/')`.
4. On error: brief error message in place, panel stays open.

Panel is controlled by `useState` — no new URL, no server round-trip before final delete.

## Cross-links

**In (verified):**
- `/settings` — the only surface hosting the delete flow

**Out (ships):**
- `<DeleteAccountSection />` added to `/settings/page.tsx` below `exportLink`

**Retro-fit:**
- None needed (delete is an endpoint + settings UI only; no link from other pages)

## Error states

- 401 Unauthorized → `{"error":"unauthorized"}` 401
- 500 on admin client error → `{"error":"<message>"}` 500
- If `SUPABASE_SERVICE_ROLE_KEY` is missing: admin client initialization fails →
  route returns 500 with `{"error":"service unavailable"}`

## Decisions made upfront — DO NOT ASK

1. **No migration needed.** Both FKs already carry `ON DELETE CASCADE`; confirmed in
   `20260101000000_create_entries.sql` (entries) and `20260502000000_create_profiles.sql`
   (profiles).
2. **Admin client, not user client.** Deleting from `auth.users` requires service role;
   the anon-key client cannot call `auth.admin.deleteUser()`.
3. **Two-step inline confirmation, not modal.** No shadows, no overlays — consistent
   with the design system (no shadows, no gradients, no illustrations).
4. **Client navigates to `/` after success.** The deleted JWT becomes invalid; the
   middleware handles the redirect to `/signin` on the next protected-route access.
5. **No explicit sign-out call.** Deleting the user invalidates their sessions in
   Supabase; an explicit `signOut()` call would fail (no user to sign out). The
   session cookie expires naturally or is cleared on next auth check.
6. **Error register.** Delete button uses `var(--color-signal-error)` text — already
   present in the token set, used by field errors. Filled version for the "confirm"
   button, text-only for the initial trigger.
7. **`rate_limit_events` orphans are acceptable.** They carry only a string key
   (no user PII beyond the UUID embedded in the key), volume is tiny, and a periodic
   cleanup is outside scope.
8. **No confirmation email / cooldown.** Not required by GDPR for immediate erasure;
   the inline two-step is sufficient confirmation. User has already exported data
   (Phase 23) if they want it.
9. **Placement on settings page.** Below export link, above the sign-out footer —
   destructive controls stay near the bottom, away from the settings form.
10. **`createAdminClient` exported only from server module.** Never re-exported via a
    `'use client'` path; Next.js tree-shaking ensures the service role key never leaks
    to client bundles.

## Mobile reflow

`DeleteAccountSection` follows the same max-width: 480px column as the form. The
inline confirmation panel is full-width within that column — no overflow.

## Pages × tests matrix

| File | Tests |
|---|---|
| `src/app/api/account/__tests__/route.test.ts` | 401 unauth, 200 on delete, 500 on admin failure |
| `apps/e2e/tests/settings.spec.ts` | Retro-fit: `DELETE /api/account` returns 401 unauthenticated |

## Verify gate

`pnpm verify` — typecheck → test:run → build → e2e. All hard.

## Commit body template

```
feat: account deletion — phase 24

- DELETE /api/account deletes the auth user; entries + profile cascade via existing FKs
- admin Supabase client (service role) added at src/lib/supabase/admin.ts
- two-step inline confirmation UI on /settings — explicit, separated from save + sign-out
- client navigates to / on success; invalid JWT triggers middleware redirect to /signin
- unit tests: 401, 200 delete, 500 admin failure
- e2e: settings retro-fit confirms 401 on unauthenticated DELETE

Decisions:
- no migration needed — ON DELETE CASCADE already on entries + profiles FKs
- admin client required — anon key cannot call auth.admin.deleteUser()
- inline confirmation over modal — no shadows, consistent with design system
```

## DoD

- [ ] `DELETE /api/account` returns 401 when unauthenticated
- [ ] `DELETE /api/account` deletes user and returns 200 when authenticated
- [ ] `src/lib/supabase/admin.ts` exists and is server-only
- [ ] `/settings` shows "delete my account and all my entries" control
- [ ] Confirmation panel shows "permanently delete" copy + cancel + confirm buttons
- [ ] Client navigates to `/` after successful deletion
- [ ] Unit tests pass
- [ ] E2E retro-fit passes
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- Deletion confirmation email (not required; inline two-step suffices)
- Cooldown / grace period (out of scope for v1)
- Bulk user deletion admin tooling
