# External-observer findings — Ember

> Last pass: 2026-05-22 at commit ae936e3
> Pass count: 3

> Written by `/critique` after walking the live site as a
> fresh-eyes visitor. Drained by `/iterate`.

## Pending

### [MED] /signin — email field label is all-caps "EMAIL"
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the email input label renders as "EMAIL" in full uppercase. the cdcd1ff typography pass removed uppercase from labels in /settings and /today but the /signin label was not included.
- evidence: captured text: "EMAIL / send the link"
- suggested fix: remove text-transform: uppercase (or equivalent) from the email label in the sign-in form so it reads "email" in lower-case, consistent with the rest of the app.
- source: browser

### [MED] /today — date heading renders as all-caps "FRI 22 MAY 2026"
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the date heading on /today is displayed in full uppercase ("FRI 22 MAY 2026") while all other page copy uses lower-case. the cdcd1ff fix addressed `.entryLabel` and `.stripLabel` but did not cover the date heading class.
- evidence: captured text: "FRI 22 MAY 2026"
- suggested fix: remove the uppercase rule from the date heading element on /today so it renders as "Fri 22 May 2026".
- source: browser

### [MED] /today — FOCUS and DONE button labels are all-caps
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the focus-mode toggle and task-done button render their labels as "FOCUS" and "DONE" in full uppercase. the cdcd1ff fix covered section labels but not button labels.
- evidence: captured text: "FOCUS" and "DONE" amid otherwise lower-case copy
- suggested fix: render these button labels in sentence case ("Focus", "Done") via removing any text-transform: uppercase rule on the button elements; use CSS for stylistic treatment only if needed.
- source: browser

### [MED] / — "read-only preview" label gives state but not purpose
- pass: 3 (commit ae936e3)
- viewport: desktop
- category: comprehension
- observation: the 7-day preview section is introduced with "the next seven days." followed by a terse "read-only preview" label. the label communicates the interaction state but not why the visitor is seeing this content before signing in. a first-time visitor may miss that this is an illustrative sample of what they will receive daily.
- evidence: captured text: "the next seven days. / read-only preview / today / Fri 22 May"
- suggested fix: add a short explanatory subtitle beneath "the next seven days." — e.g. "this is what arrives each morning." — so the preview's purpose is clear without requiring the visitor to infer it.
- source: browser

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

### [MED] / — page title is a bare product name with no descriptive suffix
- pass: 2 (commit 1ade924)
- viewport: both
- category: seo
- observation: the homepage title is simply "ember" with no description of what the product does. this provides no keyword signal and gives the browser tab no context for a returning user who has multiple tabs open.
- evidence: capture metadata: title: "ember"
- suggested fix: change the root layout title to "ember — a daily writing ritual" (or equivalent from the tagline) to carry both brand identity and product purpose.
- source: browser

### [LOW] /signin — page title is bare "ember" with no descriptive suffix
- pass: 3 (commit ae936e3)
- viewport: both
- category: seo
- observation: the /signin page title is "ember" — identical to the landing page title. all other authenticated-side pages carry descriptive suffixes ("ember · today", "ember · log", "ember · settings"). a user with both the landing page and the sign-in page open cannot distinguish them by tab title.
- evidence: captured title: "ember" (vs. "ember · today" on /today, "ember · log" on /log)
- suggested fix: set the /signin page title to "ember · sign in" to match the established pattern.
- source: browser

### [LOW] /signin — no link-expiry or next-step copy after submission
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the sign-in page says "we email you a sign-in link. no password, no spam." but gives no indication of where the link lands or how long it is valid. a first-time visitor who closes the tab before the email arrives may be uncertain whether the link has expired.
- evidence: captured text: "we email you a sign-in link. no password, no spam." — no expiry or destination copy.
- suggested fix: add one line such as "the link is valid for 24 hours and drops you straight into today's page" to reduce post-submit uncertainty.

## Done

### [HIGH] /settings — timezone selector is effectively unusable on mobile
- pass: 1 (commit c69173d)
- viewport: both
- category: a11y
- observation: the timezone selector is a flat unfiltered list of 200+ timezone strings in a single `<select>` element with no optgroup grouping and no search. a user on mobile must scroll through hundreds of raw tz database names (e.g. `Africa/Abidjan`, `America/Indiana/Knox`) with no shortcut.
- evidence: settings page body text is almost entirely composed of raw timezone names in alphabetical sequence; no region groupings visible in the text capture.
- suggested fix: group timezones with `<optgroup>` by region, or replace with a searchable combobox so users can type to filter.
- issue: #26
- resolution: added groupTimezones() helper in SettingsForm.tsx; timezone <select> now renders <optgroup> per region prefix. Shipped at 8d43d1b.

### [HIGH] /today — focus-mode overlay DOM duplication exposes duplicate controls to screen readers
- pass: 2 (commit 1ade924)
- resolution: `aria-hidden={!isFocus}`, `aria-modal={isFocus}`, and `tabIndex={isFocus ? 0 : -1}` on overlay interactive elements added to TodayEntry.tsx as part of phase 19. Shipped at a9e1729.

### [MED] /today — section header caps conflict with stated typographic voice
- pass: 1 (commit c69173d)
- resolution: removed `text-transform: uppercase` from `.entryLabel` and `.stripLabel` in today/page.module.css. Shipped at cdcd1ff.

### [MED] /settings — field labels DISPLAY NAME and TIMEZONE are full uppercase
- pass: 2 (commit 1ade924)
- resolution: removed `text-transform: uppercase` from `.label` in settings/page.module.css. Shipped at cdcd1ff.

### [MED] /log — H1 "YOUR PAST SIXTY DAYS" is all-caps
- pass: 2 (commit 1ade924)
- resolution: removed `text-transform: uppercase` from `.mosaicMeta` in log/page.module.css. Shipped at cdcd1ff.

### [MED] /today — FOCUS button has no accessible label
- pass: 2 (commit 1ade924)
- resolution: `aria-label="enter focus mode"` added to the focusTrigger button in TodayEntry.tsx as part of phase 19. Shipped at a9e1729.

### [HIGH] / — "THE BRAND IS THE PRACTICE RENDERED" is internal design copy surfaced to users
- pass: 2 (commit 1ade924)
- viewport: both
- category: voice
- observation: the phrase "THE BRAND IS THE PRACTICE RENDERED" appears in full uppercase between the intro copy and the 7-day prompt preview. it reads as an internal design-system label or brand-strategy fragment rather than user-facing content, and breaks the lower-case typographic register of every other element on the page.
- evidence: captured body text: "THE BRAND IS THE PRACTICE RENDERED / the next seven days. / read-only preview"
- suggested fix: remove the line entirely. if it anchors a section structurally, replace with a semantically appropriate hidden label or a visible heading in sentence case.
- source: browser
- resolution: removed the `previewMarkLabel` span from src/app/page.tsx. Shipped at 0c1d673.
