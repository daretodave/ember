# External-observer findings — Ember

> Last pass: 2026-05-22 at commit 4552045
> Pass count: 5

> Written by `/critique` after walking the live site as a
> fresh-eyes visitor. Drained by `/iterate`.

## Pending

### [x] [LOW] / — task label prefix is inconsistent across 7-day preview
- pass: 4 (commit 8b806b8)
- viewport: both
- category: voice
- observation: in the 7-day preview on the landing page, the first day's task uses the prefix "today's tiny task —" while all subsequent days use "tiny task —" without the possessive prefix. within a single preview block the inconsistency is jarring.
- evidence: captured text: "today's tiny task — notice one thing today..." followed by "tiny task — slow down on one task today..."
- suggested fix: standardize to "tiny task —" across all seven rows (dropping the "today's" prefix), matching the recurring-days pattern.
- source: browser
- resolution: removed the isToday ternary in src/app/page.tsx; all seven rows now render "tiny task —". Shipped at 92a4995.

### [LOW] /today — task label "today's tiny task —" differs from anonymous preview "tiny task —"
- pass: 5 (commit 4552045)
- viewport: both
- category: voice
- observation: the authenticated /today page renders the task label as "today's tiny task —" while the landing-page 7-day preview (fixed at 92a4995) now uniformly uses "tiny task —" for all days including today. a visitor who reads the landing page before signing in sees the label change between surfaces.
- evidence: /today capture: "today's tiny task — notice one thing today that you do that you learned from someone else." vs / capture: "tiny task — notice one thing today that you do that you learned from someone else."
- suggested fix: remove the "today's" prefix from the task label on /today so it reads "tiny task —", matching the anonymous preview.
- source: browser

### [LOW] /log — H1 "your past sixty days" uses word form while stat line uses numeral "60"
- pass: 5 (commit 4552045)
- viewport: both
- category: voice
- observation: the /log page H1 reads "your past sixty days" (word form) while the stat line immediately below it reads "0 days written. 60 days quiet. 0 published." (numeral). two forms of the same number appear within a few lines of each other on the same page.
- evidence: "your past sixty days" (H1) directly above "0 days written. 60 days quiet. 0 published." on /log
- suggested fix: change the H1 to "your past 60 days" to match the numeral form used throughout the stat line.
- source: browser

### [LOW] /signin — "back" link has no visible destination
- pass: 5 (commit 4552045)
- viewport: both
- category: comprehension
- observation: the sign-in page shows a "back" link immediately after the wordmark. a visitor who arrived at /signin directly (e.g. via a shared link or bookmark) has no indication of where "back" leads.
- evidence: captured text: "ember / back / sign in." — "back" with no destination label
- suggested fix: change the link text to "back to home" or add aria-label="back to home" so the destination is explicit.
- source: browser

### [LOW] /today — "see all sixty" uses word form inconsistent with numeral "60" elsewhere
- pass: 4 (commit 8b806b8)
- viewport: both
- category: voice
- observation: the seven-day strip on /today links to /log with the label "see all sixty" (word form), while /log itself uses the numeral "60" throughout ("60 days quiet", "your past sixty days" h1 aside). the inconsistency is minor but noticeable within the same session.
- evidence: "/today" text: "see all sixty" vs "/log" text: "0 days written. 60 days quiet. 0 published."
- suggested fix: change "see all sixty" to "see all 60" to match the numeral form used on /log.
- source: browser

### [x] [LOW] /today — "done" button in seven-day strip lacks an accessible label
- pass: 4 (commit 8b806b8)
- viewport: both
- category: a11y
- observation: the "done" button for marking today's task complete appears in the DOM after the day-label strip (Sat, Sun, Mon, Tue, Wed, Thu, today) with no aria-label. a screen reader encountering "done" at that position lacks context for what action it confirms.
- evidence: captured text: "Sat Sun Mon Tue Wed Thu today" followed by "done" with no intervening label.
- suggested fix: add aria-label="mark today's task done" to the done button element.
- source: browser
- resolution: false positive — text capture shows visible text only. TodayEntry.tsx task button already has `aria-label={taskDone ? 'mark task not done' : 'mark task done'}` (shipped at a8db48d); focus-mode exit button has `aria-label="exit focus mode"` (TodayEntry.tsx:254). No code change required.


### [x] [LOW] /signin — no link-expiry or next-step copy after submission
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the sign-in page says "we email you a sign-in link. no password, no spam." but gives no indication of where the link lands or how long it is valid. a first-time visitor who closes the tab before the email arrives may be uncertain whether the link has expired.
- evidence: captured text: "we email you a sign-in link. no password, no spam." — no expiry or destination copy.
- suggested fix: add one line such as "the link is valid for 24 hours and drops you straight into today's page" to reduce post-submit uncertainty.
- resolution: footer now reads "sign-in links expire after 24 hours." — added at dfe1ae4 when the vendor attribution was replaced. Expiry concern addressed.

## Done

### [x] [LOW] /signin — "magic-link via supabase" vendor name in footer
- pass: 4 (commit 8b806b8)
- viewport: both
- category: voice
- observation: the /signin page footer read "magic-link via supabase." — a vendor name with no user meaning, at odds with ember's calm voice.
- evidence: `src/app/signin/page.tsx` line 99: `<span>magic-link via supabase</span>` in `<footer>`
- resolution: replaced with "sign-in links expire after 24 hours." — removes vendor attribution, adds useful expiry info. Shipped at dfe1ae4.

### [LOW] /signin — page title is identical to landing page, no signin-specific suffix
- pass: 3 (commit ae936e3); evidence updated pass 4
- viewport: both
- category: seo
- observation: the /signin page title is "ember — a daily writing ritual" — identical to the landing page (the root layout default). all other app pages carry descriptive suffixes ("ember · today", "ember · log", "ember · settings"). a user with both the landing page and the sign-in page open cannot distinguish them by tab title.
- evidence: captured title: "ember — a daily writing ritual" on both / and /signin (vs. "ember · today" on /today, "ember · log" on /log)
- suggested fix: set the /signin page title to "ember · sign in" to match the established pattern.
- resolution: added src/app/signin/layout.tsx exporting metadata { title: 'ember · sign in' }. Shipped at 6413cfb.

### [MED] / (mobile) — footer trust copy absent at 375px
- pass: 1 (commit c69173d)
- viewport: mobile
- category: comprehension
- observation: on desktop the footer includes "a sign-in link is the only thing you'll receive. no password, no spam." which is the primary objection-handler for a skeptical first-time visitor. this line does not appear in the mobile capture (375px), removing a meaningful trust signal before the sign-in CTA.
- evidence: desktop capture includes the privacy reassurance; mobile capture ends with "made for adults who want a low-friction ritual. / sign in to start" — no privacy copy.
- suggested fix: audit the mobile layout to confirm this copy is present and visible at 375px, or surface it directly above the "sign in to start" CTA.
- resolution: removed `.ctaCopy { display: none }` from the ≤480px breakpoint; set `font-size: var(--type-14)` so the copy stacks above the CTA button in column layout; increased `.page { padding-bottom }` to 160px on mobile. Shipped at a018b8d.

### [MED] /today — publish button has no affordance explaining what publishing does
- pass: 4 (commit 8b806b8)
- viewport: both
- category: comprehension
- observation: the publish button appears on /today alongside save and focus but there is no surrounding copy, tooltip, or label explaining what publishing does or who can see a published entry.
- evidence: captured text: "publish / focus / save" — no explanatory context visible in the DOM text.
- suggested fix: add a short descriptor near the publish button.
- resolution: added `title="make this entry visible on your public profile."` to both publish toggle `<label>` elements in TodayEntry.tsx. Shipped at 7fe5ba6.

### [MED] /signin — email field label is all-caps "EMAIL"
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the email input label renders as "EMAIL" in full uppercase. the cdcd1ff typography pass removed uppercase from labels in /settings and /today but the /signin label was not included.
- evidence: captured text: "EMAIL / send the link"
- suggested fix: remove text-transform: uppercase from the email label in the sign-in form so it reads "email" in lower-case, consistent with the rest of the app.
- resolution: removed `text-transform: uppercase` from `.fieldLabel` in signin/page.module.css. Shipped at 055c339.

### [MED] /today — save-state indicator may not be a live region
- pass: 1 (commit c69173d)
- viewport: both
- category: a11y
- observation: the save-state label "not yet saved" may not be in an aria-live region; screen reader users would not be notified when the state changes.
- evidence: captured text: "YOUR RESPONSE / not yet saved / publish / save" — save-state appears as static text with no live-region context visible.
- suggested fix: wrap the save-state label in `aria-live="polite"`.
- resolution: `aria-live="polite"` confirmed present on `.lastSaved` span in TodayEntry.tsx. Already fixed as part of audit finding [4.8] (shipped at 8b41e0a). Duplicate finding; closed without separate commit.

### [MED] /log — "60 quiet" in the empty-state stat line is ambiguous
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the empty-state stat line reads "0 days written. 60 quiet. 0 published." the word "quiet" is doing non-obvious work — it means days with no entry — but a first-time visitor is unlikely to parse this without an explanation.
- evidence: captured text: "0 days written. 60 quiet. 0 published."
- suggested fix: add a brief gloss — e.g. "0 days written. 60 quiet days. 0 published." — or a visible label beneath the stat row explaining what each figure counts.
- resolution: changed `{quiet} quiet.` to `{quiet} days quiet.` in log/page.tsx. Shipped at ccafa00.

### [MED] / — "read-only preview" label gives state but not purpose
- pass: 3 (commit ae936e3)
- viewport: desktop
- category: comprehension
- observation: the 7-day preview section is introduced with "the next seven days." followed by a terse "read-only preview" label. the label communicates the interaction state but not why the visitor is seeing this content before signing in. a first-time visitor may miss that this is an illustrative sample of what they will receive daily.
- evidence: captured text: "the next seven days. / read-only preview / today / Fri 22 May"
- suggested fix: add a short explanatory subtitle beneath "the next seven days." — e.g. "this is what arrives each morning." — so the preview's purpose is clear without requiring the visitor to infer it.
- source: browser
- resolution: replaced "read-only preview" with "this is what arrives each morning." in src/app/page.tsx. Shipped at 757f4a7.

### [MED] / — page title is a bare product name with no descriptive suffix
- pass: 2 (commit 1ade924)
- viewport: both
- category: seo
- observation: the homepage title is simply "ember" with no description of what the product does. this provides no keyword signal and gives the browser tab no context for a returning user who has multiple tabs open.
- evidence: capture metadata: title: "ember"
- suggested fix: change the root layout title to "ember — a daily writing ritual" (or equivalent from the tagline) to carry both brand identity and product purpose.
- source: browser
- resolution: changed root layout title, OG title, and twitter title to "ember — a daily writing ritual" in src/app/layout.tsx. Shipped at 99aa554.

### [MED] /today — date heading renders as all-caps "FRI 22 MAY 2026"
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the date heading on /today is displayed in full uppercase ("FRI 22 MAY 2026") while all other page copy uses lower-case. the cdcd1ff fix addressed `.entryLabel` and `.stripLabel` but did not cover the date heading class.
- evidence: captured text: "FRI 22 MAY 2026"
- suggested fix: remove the uppercase rule from the date heading element on /today so it renders as "Fri 22 May 2026".
- source: browser
- resolution: removed `text-transform: uppercase` from `.dateStamp` in today/page.module.css. Shipped at d419779.

### [MED] /today — FOCUS and DONE button labels are all-caps
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the focus-mode toggle and task-done button render their labels as "FOCUS" and "DONE" in full uppercase. the cdcd1ff fix covered section labels but not button labels.
- evidence: captured text: "FOCUS" and "DONE" amid otherwise lower-case copy
- suggested fix: render these button labels in sentence case ("Focus", "Done") via removing any text-transform: uppercase rule on the button elements; use CSS for stylistic treatment only if needed.
- source: browser
- resolution: removed `text-transform: uppercase` from `.focusTrigger` and `.focusDone` in today/page.module.css. Shipped at d419779.

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
