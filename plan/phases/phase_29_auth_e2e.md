# Phase 29 — E2e authenticated flow coverage

## Outcome

Three Playwright specs run against a real authenticated session — the write
flow on `/today`, entry visibility on `/log`, and the edit flow on
`/log/[date]`. Every prior phase's core behaviour (write, persist, appear in
mosaic, edit) now has at least one end-to-end assertion. Test-only addition;
no app code changes.

## Why

28 phases shipped without a single authenticated Playwright assertion. The
verify gate's e2e leg would pass even if the write flow, the mosaic, or the
edit surface were broken for authenticated users. This phase closes that gap.
The mock-cookie path (`scripts/mint-cookie.mjs`) is already used by `/critique`;
this phase reuses the same mechanism to give the test suite a real session.

## Scope

### Global setup

`apps/e2e/globalSetup.ts` — runs once before any spec:

1. Checks for `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. If
   missing, writes an empty storage state and logs a warning (anonymous-only
   CI degrades gracefully).
2. Calls `node scripts/mint-cookie.mjs` (subprocess) to mint or reuse a
   cached session for `ember-critique-bot@example.com`.
3. Reads `.cache/e2e-cookie.json`, maps cookie records to Playwright's cookie
   shape (`domain: 'localhost'`, `secure: false`, capitalised `sameSite`),
   and writes `.auth/user.json` in Playwright's `storageState` format.

### Playwright config changes

`apps/e2e/playwright.config.ts`:

- Add `globalSetup: './globalSetup.ts'`.
- Add an `authenticated` project with `storageState: '.auth/user.json'` and
  `testMatch: '**/auth-flow.spec.ts'` so auth tests are isolated to this
  project.
- Exclude `auth-flow.spec.ts` from the default `chromium` project
  (`testIgnore`) so anonymous specs are not double-run.

### New test file

`apps/e2e/tests/auth-flow.spec.ts` — three tests in a `describe.serial` block
so they share server-side state in order:

| # | Name | Asserts |
|---|---|---|
| 1 | `/today` write flow | Fill textarea, save, reload, confirm persistence |
| 2 | `/log` mosaic visible | Page stays on `/log`, mosaic renders, entry list shows |
| 3 | `/log/[date]` edit flow | Click edit, change text, save, assert updated text |

Each test checks for `sb-` cookies at the start and skips via `test.skip()`
if no session is present (graceful degradation when secrets are absent).

## Decisions (pre-made)

- **`mint-cookie.mjs` subprocess over direct ESM import.** The mint script is
  a pure-ESM module with top-level `await`. Calling it as a subprocess from
  a CommonJS-compatible `globalSetup.ts` avoids the TS/ESM interop complexity,
  and the script already runs in isolation in the `/critique` path.
- **`storageState` over per-test cookie injection.** Playwright's project-level
  `storageState` is the idiomatic pattern; it loads once and applies to every
  test in the authenticated project without boilerplate.
- **`describe.serial` for auth tests.** Test 1 writes an entry; test 2 and 3
  depend on that entry existing. Serial ordering is necessary to avoid
  race conditions on the bot user's state.
- **Bot user (`ember-critique-bot@example.com`) as the test identity.** Same
  account used by `/critique`; already provisioned in the Supabase project.
  Using a shared identity avoids a separate seed step. Each run upserts the
  same user's entry, which is idempotent.
- **Fixed content string for persistence check.** The write test fills the
  textarea with a sentinel string (`'e2e write test — today'`) rather than a
  timestamp, so the reload assertion is a stable value check rather than
  dynamic. Subsequent runs overwrite the same string — no entry accumulation.
- **Skip gracefully when no auth.** Failing the gate when Supabase secrets
  are absent (e.g. a fork's PR) would break the verify loop. Tests skip with
  a clear message instead; anonymous coverage still runs.

## Components / handlers

None — test-only phase.

## Tests matrix

| File | Tests |
|---|---|
| `apps/e2e/tests/auth-flow.spec.ts` | 3 tests (write, log, edit) |
| `apps/e2e/globalSetup.ts` | setup (not a spec) |

No unit tests — no logic to unit-test.

## Verify gate

```bash
pnpm verify
# typecheck → test:run → build → e2e (auth-flow.spec.ts runs in the e2e leg)
```

The authenticated project runs automatically as part of `pnpm --filter
@ember/e2e test`. No extra script needed.

## DoD

- [ ] `apps/e2e/globalSetup.ts` mints session and writes `.auth/user.json`
- [ ] `apps/e2e/playwright.config.ts` adds globalSetup + authenticated project
- [ ] `apps/e2e/tests/auth-flow.spec.ts` with 3 auth tests
- [ ] All 3 tests pass when Supabase secrets are present
- [ ] Tests skip gracefully when secrets are absent
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- Axe authenticated scans (deferred from Phase 15 to here — can follow as a
  patch after this phase)
- Offline draft path (phase 19) with network-intercept stub
- Auth tests for `/settings` and `/u/[username]` public profile
