# Phase 15 — A11y regression gate

## Outcome

`@axe-core/playwright` integrated into the e2e suite. Axe scans run on `/`,
`/signin`, `/today`, `/log`, and `/settings` as part of `pnpm verify`. WCAG
2.1 AA violations fail the gate. No app code changes.

## Why

Phases 9–10 shipped 11+ a11y fixes (skip links, landmark regions, aria labels,
contrast tokens, focus styles). Phases 17 and 18 will land new UI. This gate
locks in every a11y fix from those passes so future UI phases cannot silently
regress them without a red verify run.

## Scope

### Package changes

- Add `@axe-core/playwright` to `apps/e2e/devDependencies`.
  The existing `@playwright/test` import is compatible; axe injects at page
  scope and co-operates with any Playwright fixture.

### New test file

`apps/e2e/tests/axe.spec.ts` — one test per route.

| Route | Auth required? | What axe sees |
|---|---|---|
| `/` | no | landing page |
| `/signin` | no | sign-in page |
| `/today` | yes → redirects to `/signin` | `/signin` (redirect destination) |
| `/log` | yes → redirects to `/signin` | `/signin` (redirect destination) |
| `/settings` | yes → redirects to `/signin` | `/signin` (redirect destination) |

Auth-protected routes redirect to `/signin` for unauthenticated requests.
Axe scans the redirect destination. This is intentional — it locks in the
a11y state of the page that users actually see. Authenticated axe scans are a
follow-up once hermetic auth fixtures land.

### Test shape

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const ROUTES = ['/', '/signin', '/today', '/log', '/settings']

for (const route of ROUTES) {
  test(`${route} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}
```

### Existing a11y.spec.ts

Kept as-is. It tests specific a11y properties (skip link, landmark presence)
with explicit selectors. The new axe.spec.ts complements it with an automated
rule sweep; both files stay in the suite.

## Decisions (pre-made)

- **axe-core, not Pa11y or Lighthouse.** `@axe-core/playwright` is the
  standard pairing — zero new playwright config, runs in-process, result is
  a typed object. Pa11y and Lighthouse add heavy headless-chrome overhead.
- **WCAG 2.1 AA tags only (`wcag2a`, `wcag2aa`).** Best-practice and
  experimental rules are noisier than useful for a gate. 2.1 AA is the
  stated spec target (Phase 10 brief).
- **Unauthenticated pass only.** Authenticated axe scans require real or
  hermetic session fixtures. Phase 15 is test-only, no app changes; adding
  auth fixtures here bloats scope. Deferred to a later phase.
- **One test per route, no shared fixture.** Each test is independent;
  if one route has a violation the other tests still run and surface their
  own issues.
- **No violation snapshots / `toMatchSnapshot`.** Snapshot testing for axe
  results locks in false positives. Asserting `violations.toEqual([])` is the
  correct pattern.

## Components / handlers

None — test-only phase.

## Tests matrix

| File | Tests |
|---|---|
| `apps/e2e/tests/axe.spec.ts` | 5 tests (one per route) |

No unit tests — no logic to unit-test.

## Verify gate

```bash
pnpm verify
# typecheck → test:run → build → e2e (axe.spec.ts runs in the e2e leg)
```

The axe leg runs inside `pnpm --filter @ember/e2e test`, which executes all
`tests/*.spec.ts` files. No extra script needed.

## Commit body template

```
feat: a11y regression gate (axe-core) — phase 15

- apps/e2e/tests/axe.spec.ts: axe WCAG 2.1 AA scan on 5 routes
- apps/e2e/package.json: @axe-core/playwright added to devDependencies
- scans /, /signin, /today, /log, /settings (auth routes scan redirect destination)
- failures at AA level block pnpm verify; no app code changes

Decisions:
- unauthenticated pass only; authenticated scans deferred (need hermetic fixtures)
- wcag2a + wcag2aa tags; best-practice rules excluded (noisy, not the gate target)
- violations.toEqual([]) over snapshot matchers (snapshots lock in false positives)

Closes #<ISSUE>
```

## DoD

- [ ] `@axe-core/playwright` in `apps/e2e/devDependencies`
- [ ] `apps/e2e/tests/axe.spec.ts` with 5 axe tests
- [ ] All 5 tests pass (no WCAG 2.1 AA violations on any scanned route)
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- Authenticated axe scans (today, log, settings as real pages)
- axe scans on `/u/[username]` (public profile)
- Best-practice / experimental axe rule audit
