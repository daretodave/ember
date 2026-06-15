# Phase 30 — Authentication funnel UX clarity

## Outcome

`/signin` pre/post-submission states are tightened so first-time visitors
are guided cleanly: expiry notice moves to confirmation-only, the reassurance
paragraph leads with the account-creation path, the confirmation copy drops
the colloquial "on its way", the double-announcement a11y gap is closed, the
placeholder redundancy is removed, and the submit label is quietened to match
the page's restrained register.

Copy and conditional-render changes on `/signin` only. No new routes, no
schema changes.

## Why

Five pending critique findings (passes 54, 55, 56) cluster on `/signin`'s
voice and a11y:
- Reassurance paragraph buries the account-creation path as sentence 4 of 4
- Expiry fact expressed in two different registers across the pre/post states
- "on its way" is colloquial against the rest of the page's spare register
- `role="status"` + programmatic focus double-announces the confirmation to
  screen readers
- Placeholder "email address" duplicates the "email" label in a different
  register
- Submit button "send a link" is an imperative verb phrase

Shipping them as one coherent voice-and-clarity pass avoids piecemeal
iterate churn on the same surface.

## Scope

### Pre-submission reassurance paragraph

OLD: "a sign-in link is sent to this address. it expires after 24 hours.
no password. no other mail. a new address creates an account."

NEW: "a new address creates an account. a returning address receives a
sign-in link. no password. no other mail."

Rationale: lead with the account-creation path (mirrors the landing page fix
from pass 48). Remove expiry sentence — that context belongs on the
confirmation once the link has actually been sent.

### Post-submission confirmation paragraph

OLD: "a sign-in link is on its way. the link opens today's prompt.
sign-in links expire after 24 hours. no password. no other mail."

NEW: "a sign-in link has been sent. the link opens today's prompt.
the link expires after 24 hours. no password. no other mail."

Changes:
- "on its way" → "has been sent" (removes colloquialism)
- "sign-in links expire after 24 hours." → "the link expires after 24 hours."
  (singular definite, refers to the specific link just sent — register
  alignment with the pre-submit "it expires" that used to be there)

### Double-announcement fix

Remove `role="status"` from the confirmation `<p>`. Keep `tabIndex={-1}`
and the programmatic focus via `useEffect`. Screen readers announce the
element when focus arrives; the live region is redundant and causes
double-announcement on VoiceOver and NVDA.

Add `data-testid="signin-confirmation"` to maintain testability.

### Submit button idle label

OLD: "send a link" (imperative)
NEW: "send link." (terse label, period-terminated, matches "sending." style)

Decision: "send link." removes the imperative article construction while
keeping the label unambiguous in context. Period-termination mirrors the
"sending." in-progress state for visual register consistency.

### Email input placeholder

Remove `placeholder="email address"`. The "email" label is sufficient and
consistent with the terse label style of other inputs on the page.

### Scope item 3 check (from Phase 22)

Confirmed: the post-submit destination context sentence ("the link opens
today's prompt.") landed with Phase 22. It remains in the confirmation
paragraph; no change needed.

## Files changed

- `src/app/signin/page.tsx` — reassurance, confirmation, double-announcement,
  placeholder, submit label
- `src/app/signin/__tests__/SigninPage.test.tsx` — update assertions to match
  new copy and new testid approach (no role="status")
- `apps/e2e/tests/signin.spec.ts` — update "send a link" button text assertion

## Decisions (pre-made)

- **Remove role="status", keep focus shift.** Programmatic focus shift is the
  primary a11y delivery path; the live region adds a second announcement path.
  Removing `role="status"` eliminates the duplication. `tabIndex={-1}` stays
  so `confirmationRef.current?.focus()` succeeds.
- **data-testid over role query.** Tests that previously queried `getByRole('status')`
  switch to `getByTestId('signin-confirmation')` so the test suite is not
  coupled to the ARIA role used for announcement semantics.
- **"send link." not "get a sign-in link".** The critique suggested a noun
  phrase. "get a sign-in link" is also imperative; "send link." is terse,
  period-terminated, and parallels "sending." to give the button/status a
  coherent two-state voice.
- **Pre-submit expiry removal.** The expiry fact is most useful to a visitor
  who has already submitted the form and is waiting for a link. Showing it
  before submission adds noise; it remains in the confirmation where it's
  contextually relevant.

## Tests matrix

| File | Tests |
|---|---|
| `src/app/signin/__tests__/SigninPage.test.tsx` | 8 unit tests (updated) |
| `apps/e2e/tests/signin.spec.ts` | 5 e2e tests (1 updated) |

## Verify gate

```bash
pnpm verify
# typecheck → test:run → build → e2e
```

## DoD

- [ ] Pre-submit reassurance reordered; expiry sentence removed
- [ ] Post-submit confirmation: "has been sent", "the link expires after..."
- [ ] `role="status"` removed from confirmation; `data-testid` added
- [ ] Submit button idle label: "send link."
- [ ] Email input placeholder removed
- [ ] Unit tests updated to match new copy and testid
- [ ] E2e test updated for new button text
- [ ] 5 CRITIQUE.md findings marked resolved
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- Other pending CRITIQUE.md findings on `/`, `/log`, `/settings` — drain via
  `/iterate`
