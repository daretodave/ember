# External-observer findings — Ember

> Last pass: 2026-05-21 at commit c69173d
> Pass count: 1

> Written by `/critique` after walking the live site as a
> fresh-eyes visitor. Drained by `/iterate`.

## Pending

### [HIGH] /settings — timezone selector is effectively unusable on mobile
- pass: 1 (commit c69173d)
- viewport: both
- category: a11y
- observation: the timezone selector is a flat unfiltered list of 200+ timezone strings in a single `<select>` element with no optgroup grouping and no search. a user on mobile must scroll through hundreds of raw tz database names (e.g. `Africa/Abidjan`, `America/Indiana/Knox`) with no shortcut.
- evidence: settings page body text is almost entirely composed of raw timezone names in alphabetical sequence; no region groupings visible in the text capture.
- suggested fix: group timezones with `<optgroup>` by region, or replace with a searchable combobox so users can type to filter.

### [MED] /today — section header caps conflict with stated typographic voice
- pass: 1 (commit c69173d)
- viewport: both
- category: voice
- observation: "YOUR RESPONSE" and "YOUR LAST SEVEN DAYS" are rendered in full uppercase, while every other label and body copy on the page uses sentence or lower case. this violates the "lower-case where typographic restraint reads better" voice rule.
- evidence: captured text: "YOUR RESPONSE / not yet saved / publish / save / YOUR LAST SEVEN DAYS / see all sixty"
- suggested fix: change these labels to lower case ("your response", "your last seven days") to match the voice pattern used across the rest of the page.

### [MED] / (mobile) — footer trust copy absent at 375px
- pass: 1 (commit c69173d)
- viewport: mobile
- category: comprehension
- observation: on desktop the footer includes "a sign-in link is the only thing you'll receive. no password, no spam." which is the primary objection-handler for a skeptical first-time visitor. this line does not appear in the mobile capture (375px), removing a meaningful trust signal before the sign-in CTA.
- evidence: desktop capture includes the privacy reassurance; mobile capture ends with "made for adults who want a low-friction ritual. / sign in to start" — no privacy copy.
- suggested fix: audit the mobile layout to confirm this copy is present and visible at 375px, or surface it directly above the "sign in to start" CTA.

### [MED] /log — "60 quiet" in the empty-state stat line is ambiguous
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the empty-state stat line reads "0 days written. 60 quiet. 0 published." the word "quiet" is doing non-obvious work — it means days with no entry — but a first-time visitor is unlikely to parse this without an explanation.
- evidence: captured text: "0 days written. 60 quiet. 0 published."
- suggested fix: add a brief gloss — e.g. "0 days written. 60 quiet days. 0 published." — or a visible label beneath the stat row explaining what each figure counts.

### [MED] /today — save-state indicator may not be a live region
- pass: 1 (commit c69173d)
- viewport: both
- category: a11y
- observation: the save-state label "not yet saved" is visible in the response section before any text is entered. if this indicator is not wrapped in an `aria-live` region, screen reader users will not be notified when the state changes to "saved" or an error.
- evidence: captured text: "YOUR RESPONSE / not yet saved / publish / save" — save-state appears as static text with no live-region context visible.
- suggested fix: wrap the save-state label in `aria-live="polite"` so state changes are announced without requiring the user to move focus.

### [LOW] /signin — no link-expiry or next-step copy after submission
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the sign-in page says "we email you a sign-in link. no password, no spam." but gives no indication of where the link lands or how long it is valid. a first-time visitor who closes the tab before the email arrives may be uncertain whether the link has expired.
- evidence: captured text: "we email you a sign-in link. no password, no spam." — no expiry or destination copy.
- suggested fix: add one line such as "the link is valid for 24 hours and drops you straight into today's page" to reduce post-submit uncertainty.

## Done

(none yet)
