# Phase 22 — Voice coherence sweep

## Outcome

Ship the remaining stalled copy scope items from the voice coherence candidate
that are individually below the iterate threshold. Copy-only — no new routes,
no schema changes, no logic edits.

## Why

Phase 21 addressed task copy in `content/prompts.json`. Several UI-level copy
inconsistencies remain: the `/signin` H1 lacks its terminal period (design HTML
specifies `sign in.`), the display name placeholder is editorial rather than
neutral, and the post-submit confirmation carries an unnecessary adverb.

## Scope (verified against current code as of phase 21)

| # | File | Current | Change |
|---|---|---|---|
| 3 | `src/app/signin/page.tsx` | "the link opens today's prompt directly." | remove "directly" → "the link opens today's prompt." |
| 6 | `src/app/settings/SettingsForm.tsx` | placeholder="name shown on published entries" | placeholder="name" |
| 35 | `src/app/signin/page.tsx` | `<h1>sign in</h1>` | `<h1>sign in.</h1>` (terminal period per design HTML) |

## Items verified as already resolved or design-blocked

- (24) `/u/` username prefix — correct for URL context; @handle convention is
  for public profile display only. No change.
- (27) "no password" normalization — already consistent across `/` and `/signin`.
- (36) "ten minutes" lede — design/Ember · Landing.html retains this tagline;
  design folder wins on conflict. Item blocked pending a user-called design
  revision. Filed as [needs-user-call] in commit body.
- (38) "forgetting a day is fine" — phrase not present in current code.
- (39) "curated" — not present in current code.
- (40) "one small prompt" — not present in current code.
- (43) "view your public profile" — already reads "view public profile".
- (47) "no password required." — already "no password."
- (48) username placeholder "public" qualifier — placeholder already "username".

## Files changed

- `src/app/signin/page.tsx`
- `src/app/settings/SettingsForm.tsx`

## Tests

No test changes expected. Existing test coverage:
- `SigninPage.test.tsx` tests confirmation text content (regex); removing "directly"
  does not break any assertion.
- `SettingsForm.test.tsx` does not assert on placeholder values.
- `LandingPage.test.tsx` unchanged (no landing page edits).

## Verify gate

```
pnpm verify
```

typecheck → test:run → build → e2e. All must pass.

## Commit body template

```
feat: voice coherence sweep — phase 22

- /signin H1 gains terminal period: "sign in." (per design HTML spec)
- /signin confirmation: remove "directly" adverb from destination sentence
- /settings display name placeholder simplified to "name"

Decisions:
- (36) "ten minutes" lede: design/Ember · Landing.html retains the tagline;
  design folder wins on conflict; filed as [needs-user-call] in plan/AUDIT.md
- (24) /u/ username prefix: retained — correct for URL context in settings;
  @handle is a profile display convention, not the settings input context
- items 27, 38, 39, 40, 43, 47, 48: all already resolved in prior phases
```

## DoD

- [ ] `src/app/signin/page.tsx` H1 is `sign in.`
- [ ] Confirmation paragraph no longer says "directly"
- [ ] Display name placeholder is `name`
- [ ] `pnpm verify` green
- [ ] Plan row ticked `[x]`
