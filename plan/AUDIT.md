# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [x] [5.4] /today — save indicator shows "not yet saved" for existing entries on load
- category: bug
- impact: 6
- ease: 9
- observation: `TodayEntry` initializes `saveState` to `'idle'` unconditionally. `saveIndicatorText()` only returns a formatted saved-time when `saveState === 'saved' && savedAt`. A returning user with an existing entry has `savedAt` set from `initialEntry.updated_at` but `saveState` is still `'idle'`, so the indicator reads "not yet saved" even though the entry exists and is displayed pre-filled.
- evidence: `src/app/today/TodayEntry.tsx` line 22: `useState<SaveState>('idle')` — no initialEntry check. Line 129: `if (saveState === 'saved' && savedAt)` never matches on load for an existing entry.
- suggested fix: initialize `saveState` from `initialEntry`: `useState<SaveState>(initialEntry !== null ? 'saved' : 'idle')`. `handleResponseChange` already resets to `'idle'` on first edit, so the state machine stays correct.
- source: /iterate audit 2026-05-23
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: initialized saveState to 'saved' when initialEntry !== null in TodayEntry.tsx. Shipped at c1eec87.

### [x] [5.4] /today — "see all 60" link label implies a backlog for users with no entries
- category: external-critique
- impact: 6
- ease: 9
- observation: the seven-day strip shows seven days all marked "no entry" and the log link still reads "see all 60". for a brand-new user who has written nothing, the number 60 implies a backlog that does not exist. 60 is the mosaic window size, but that framing is invisible to a new user.
- evidence: "see all 60" immediately followed by seven strip days all labeled "no entry"
- suggested fix: change the link text to "open log" (no count) so it reads as a navigation affordance rather than a count of existing content.
- source: /critique pass 7 (commit 69def1e)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: changed "see all 60" to "open log" in DayStrip.tsx. Shipped at 831dc54.

### [x] [5.6] verify gate — no lint guard against text-transform:uppercase in src/
- category: tests
- impact: 7
- ease: 8
- observation: 8 of the last 20 commits were iterate fixes removing `text-transform: uppercase` from individual CSS modules. Each fix was correct but left no guard. grep now returns 0 hits — but there is nothing in the verify gate preventing a new CSS module from silently reintroducing the pattern. The ban is not documented in design/CLAUDE.md either.
- evidence: `package.json` verify script has no css-lint step; `design/CLAUDE.md` has no note on text-transform:uppercase; pattern recurred across 8 pages before being fully cleared.
- suggested fix: (1) add a `lint:no-uppercase-css` script to package.json that exits non-zero if any match found; (2) prepend it to the verify chain; (3) add a "CSS rule bans" section to design/CLAUDE.md documenting the ban.
- source: /iterate audit 2026-05-23
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: added `lint:no-uppercase-css` to package.json and prepended to verify chain; documented ban in design/CLAUDE.md "CSS rule bans" section. Shipped at f3ca66d.

### [ ] [2.8] /today — "not yet saved" status reads as an error state before any typing
- category: external-critique
- impact: 4
- ease: 7
- observation: the save-state indicator reads "not yet saved" on first load, before the user has typed a single character. for a first-time visitor this lands as an error or warning rather than an idle placeholder — the word "yet" implies something was expected and is missing.
- evidence: "your response\nnot yet saved\npublish\nfocus\nsave" — appears immediately on page load with empty textarea
- suggested fix: show no save-state label until the user begins typing, or replace the idle text with a neutral em-dash or nothing.
- source: /critique pass 7 (commit 69def1e)

### [ ] [2.7] / — heading register inconsistency between "the next seven days." and "this is what arrives each morning."
- category: external-critique
- impact: 3
- ease: 9
- observation: the two adjacent section labels use different syntactic registers. "the next seven days." is a noun phrase ending in a period, functioning as a section heading. "this is what arrives each morning." is a full declarative sentence. on a page that exercises careful typographic restraint, the inconsistency creates a small tonal wobble.
- evidence: "the next seven days.\nthis is what arrives each morning."
- suggested fix: align to the same register — either "the next seven days" (no period, noun phrase) or "here is what arrives each morning." (full sentence, consistent with the stated voice posture).
- source: /critique pass 7 (commit 69def1e)

### [ ] [2.7] /log — "today is a good place to start" edges toward coaching tone
- category: external-critique
- impact: 3
- ease: 9
- observation: the empty-state line "today is a good place to start" nudges the user toward an action in a way that conflicts with the stated voice posture of "prefer 'here is something to attend to' framing" and the site's deliberate avoidance of motivational copy. it reads as mild encouragement rather than a calm observation.
- evidence: "your log is empty. today is a good place to start."
- suggested fix: reframe as an observation: "your log is empty. today's entry will appear here." — describes what will happen without coaching.
- source: /critique pass 7 (commit 69def1e)

### [ ] [2.4] /signin — sign-in page gives no destination context after email submission
- category: external-critique
- impact: 3
- ease: 8
- observation: the sign-in page confirms an email link will be sent and notes "sign-in links expire after 24 hours." but never tells the user where that link takes them. a first-time visitor has no frame of reference for what the logged-in experience looks like before clicking.
- evidence: "we email you a sign-in link. no password, no spam." / "sign-in links expire after 24 hours." — no destination copy
- suggested fix: add one sentence to the footer, e.g. "the link opens your daily prompt directly." — closes the post-submit loop.
- source: /critique pass 7 (commit 69def1e)

### [x] [3.6] / — "that's deliberate." reads as a defensive aside
- category: external-critique
- impact: 4
- ease: 9
- observation: the closing section on the landing page reads "the same prompt and task arrive for everyone on a given day. that's deliberate. ember does not personalize your morning." the phrase "that's deliberate." is a pre-emptive rebuttal to an imagined objection — inconsistent with the voice guide's preference for settled statements over defensive asides.
- evidence: `src/app/page.tsx` line 66–68: `that&apos;s deliberate.{' '}` sandwiched between two declarative sentences.
- suggested fix: remove "that's deliberate." — the sentence "ember does not personalize your morning." already carries the point without the defensive aside.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: removed "that's deliberate." from the closing paragraph in src/app/page.tsx. Shipped at a44a3a6.

### [x] [5.4] /settings — prompt variety radio group has no focus-visible style
- category: external-critique
- impact: 6
- ease: 9
- observation: the "standard / personalized" radio group uses visually-hidden inputs (opacity: 0; width: 0; height: 0) with styled label elements, but no `:focus-visible` rule exists on `.radioOption` or its container. keyboard users tabbing through the radio group receive no visible focus indicator.
- evidence: `settings/page.module.css`: `.radioInput { position: absolute; opacity: 0; width: 0; height: 0; }` — no `:focus-visible` sibling or parent rule for `.radioOption`.
- suggested fix: add `.radioOption:has(:focus-visible) { outline: 2px solid var(--color-accent); outline-offset: 2px; }` to settings/page.module.css.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: added `.radioOption:has(:focus-visible)` outline rule in settings/page.module.css. Shipped at 2af17d5.

### [x] [4.5] / — CTA "sign in to start" names the action but not the destination
- category: external-critique
- impact: 5
- ease: 9
- observation: the landing page CTA reads "sign in to start" with no indication of what the first logged-in experience looks like — that the user lands on today's prompt page. the post-auth path is unanchored.
- evidence: captured CTA text: "sign in to start" — no adjacent copy explaining what follows.
- suggested fix: add a brief phrase near the CTA such as "today's prompt is waiting." so the destination is concrete.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T05:55:00Z]
- resolution: changed ctaCopy primary text to "today's prompt is waiting." and moved privacy copy to the muted span. Shipped at 0e37545.

### [x] [3.6] /today — day-strip tiles are aria-hidden with no AT-accessible state
- category: external-critique
- impact: 6
- ease: 6
- observation: the seven-day strip renders each tile with aria-hidden="true", so screen readers receive no information about which days have entries. state (written/quiet/published) is encoded in CSS class names but those elements are removed from the AT tree.
- evidence: captured text: "Sun Mon Tue Wed Thu Fri today" — state encoded only in CSS class names (tile--filled, tile--published).
- suggested fix: add a visually-hidden span inside each stripDay with the date and state, e.g. "Mon — written" or "Tue — no entry".
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T07:07:00Z]
- resolution: added tileStateLabel() helper in DayStrip.tsx; visually-hidden span provides full date + state per tile ("Mon 19 May 2026 — written", etc.); visible date span gets aria-hidden="true" to prevent double-announcement. Shipped at 9b1e99f.

### [x] [3.6] /log — "today" in empty-state message is plain text, not a link
- category: external-critique
- impact: 4
- ease: 9
- observation: the empty-state message reads "your log is empty. today is a good place to start." — the word "today" names the sibling page but is rendered as plain text. a new user who has just signed up will expect to click it but cannot; they must find another navigation path, which breaks the first-time experience.
- evidence: captured text: "your log is empty. today is a good place to start." — no link affordance visible.
- suggested fix: wrap "today" in a Link to /today.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: wrapped "today" in `<Link href="/today">` in src/app/log/page.tsx. Shipped at ff7dd43.

<!-- 3 pending findings pruned via /oversight 2026-05-23.
     Two SEO items (canonical, sitemap) — score 2.5/2.7, below the iterate
     3.0 threshold, and were already filed as a bundled candidate (SEO
     public-profile completeness 6.0). Vendor-name finding (2.7, "Claude" in
     /settings hint) pruned alongside as voice nit; if it matters it will
     resurface via /critique. -->

### [x] [5.4] /u/[username]/[date] — public entry pages missing OG image in social metadata
- category: seo
- impact: 6
- ease: 9
- observation: `/u/[username]/[date]` is the primary share target when a user publishes an entry and shares the link. its `generateMetadata` returns `openGraph` without an `images` field and sets `twitter.card: 'summary'` with no images. the sibling `/u/[username]` profile page correctly includes `images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }]` and `twitter.card: 'summary_large_image'`. because Next.js App Router metadata performs a shallow merge on the `openGraph` object, a child route that omits `images` replaces the parent's `openGraph` entirely — the OG image from the root layout does not cascade through.
- evidence: `src/app/u/[username]/[date]/page.tsx` `generateMetadata`: `openGraph: { title, description, url }` — no images; `twitter: { card: 'summary' }` — no images. contrast with `src/app/u/[username]/page.tsx`: `openGraph: { ..., images: [{ url: '/opengraph-image', ... }] }`, `twitter: { card: 'summary_large_image', images: ['/opengraph-image'] }`.
- suggested fix: add `images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }]` to the `openGraph` block and change `twitter.card` to `'summary_large_image'` with `images: ['/opengraph-image']`.
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: added images to openGraph and upgraded twitter.card to 'summary_large_image' in src/app/u/[username]/[date]/page.tsx. Shipped at e2b9a06.

### [x] [1.8] /signin — "back" link has no visible destination
- category: external-critique
- impact: 4
- ease: 9
- observation: the sign-in page header shows a "back" link with no destination label. a visitor who arrived at /signin directly (via bookmark, shared link, or search) cannot tell where "back" leads without clicking it.
- evidence: `src/app/signin/page.tsx` line 44–46: `<Link href="/" className={styles.backLink}>back</Link>` — single word, no aria-label, no destination hint.
- suggested fix: change link text to "back to home" so the destination is explicit without needing a tooltip. optionally also add `aria-label="back to home"` for consistency with other nav links.
- source: /critique pass 5 (commit 4552045)
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: changed "back" to "back to home" and added aria-label="back to home" in src/app/signin/page.tsx. Shipped at 51977f7.

### [x] [1.8] /log — H1 "your past sixty days" uses word form while stat line uses numeral "60"
- category: external-critique
- impact: 2
- ease: 9
- observation: the /log page H1 reads "your past sixty days" while the stat line immediately below reads "0 days written. 60 days quiet." — two forms of the same number on the same screen.
- evidence: `src/app/log/page.tsx` line 81: `your past sixty days`; stat line uses numeral "60".
- suggested fix: change H1 and metadata description to "your past 60 days" to match numeral form used throughout the stat line.
- source: /critique pass 5 (commit 4552045)
- issue: [mirror-failed: 2026-05-23T01:26:00Z]
- resolution: changed H1 and metadata description to "your past 60 days". Also fixed "see all sixty" (DayStrip), "published in the last sixty days" (/u/[username]), and three aria-labels in the same commit. Shipped at 2573c76.

### [x] [3.6] /signin — "magic-link via supabase" vendor name in footer
- category: external-critique
- impact: 4
- ease: 9
- observation: the /signin page footer renders `magic-link via supabase` as a permanent attribution. supabase is a backend vendor name with no meaning to end users and at odds with ember's calm, minimal voice. every visitor to the signin page sees it before and after submitting.
- evidence: `src/app/signin/page.tsx` line 99: `<span>magic-link via supabase</span>` in `<footer>`.
- suggested fix: replace with copy describing the user experience — e.g. "sign-in links expire after 24 hours." — removing the vendor name and adding useful information.
- source: /critique pass 4 (commit b1aa4e9)
- issue: #28
- resolution: replaced `magic-link via supabase` with `sign-in links expire after 24 hours.` in the /signin footer. Shipped at dfe1ae4.

### [x] [2.7] / — task label prefix inconsistent across 7-day preview
- category: external-critique
- impact: 3
- ease: 9
- observation: in the 7-day preview on the landing page, the first day's task uses "today's tiny task —" while all subsequent days use "tiny task —". the inconsistency is jarring within a single preview block.
- evidence: `src/app/page.tsx` line 57: `{day.isToday ? "today's tiny task" : 'tiny task'} — {day.task}`. the ternary produces two distinct prefixes in the same list.
- suggested fix: standardize to "tiny task —" across all seven rows by replacing the ternary with a static string literal `'tiny task'`.
- source: /critique pass 4 (commit b1aa4e9)
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: removed the isToday ternary; all seven rows now render "tiny task —". Shipped at 92a4995.

### [x] [3.6] /today — task label "today's tiny task" differs from anonymous preview "tiny task"
- category: external-critique
- impact: 4
- ease: 9
- observation: authenticated /today rendered "today's tiny task —" while the landing-page 7-day preview (standardized at 92a4995) uniformly uses "tiny task —". a visitor who previewed the landing before signing in saw the label change between surfaces.
- evidence: `src/app/today/TodayEntry.tsx` line 145: `today&apos;s tiny task{' '}` — the hardcoded prefix persisted after the landing-page fix.
- suggested fix: remove the "today's" prefix so both surfaces use "tiny task —".
- source: /critique pass 5 (commit 4552045)
- issue: [mirror-failed: 2026-05-22T21:12:00Z]
- resolution: removed the "today's" prefix in TodayEntry.tsx. Shipped at 0c3165d.

### [x] [1.8] /today — "see all sixty" uses word form inconsistent with numeral "60" elsewhere
- category: external-critique
- impact: 2
- ease: 9
- observation: DayStrip renders `see all sixty` (word form) while /log uses the numeral "60" throughout. the inconsistency is minor but noticeable in a single session.
- evidence: `src/app/today/DayStrip.tsx` line 43: `see all sixty`. `/log` page: "0 days written. 60 days quiet."
- suggested fix: change `see all sixty` to `see all 60` to match the numeral form used on /log.
- source: /critique pass 4 (commit b1aa4e9)
- resolution: changed "see all sixty" to "see all 60" in DayStrip.tsx. Shipped at 2573c76 (bundled with /log H1 fix and five other "sixty" occurrences).

### [x] [4.5] /u/[username], /log/[date] — text-transform: uppercase on date header and edit label
- category: voice
- impact: 5
- ease: 9
- observation: two active selectors still carry `text-transform: uppercase` after the cdcd1ff and 1cfcd07 passes. `.entryDate` in `u/[username]/page.module.css` renders the date header as "FRI 22 MAY 2026 · PUBLISHED" on the public profile. `.entryLabel` in `log/[date]/page.module.css` renders the "your response" label in uppercase in EditEntry.tsx. Both violate the bearings.md voice rule. A third instance, `.previewMarkLabel` in `page.module.css`, is an orphaned selector (element removed at 0c1d673) and can be cleaned up.
- evidence: `grep -rn "text-transform.*uppercase" src/` returns `page.module.css:96`, `u/[username]/page.module.css:150`, `log/[date]/page.module.css:272`; `u/[username]/page.tsx:121` uses `.entryDate`; `log/[date]/EditEntry.tsx:97` uses `.entryLabel`; `.previewMarkLabel` has no references in component files.
- suggested fix: remove `text-transform: uppercase` from `.entryDate` (u/[username]/page.module.css) and `.entryLabel` (log/[date]/page.module.css); also remove the orphaned `.previewMarkLabel` `text-transform` rule in page.module.css.
- source: /iterate audit 2026-05-22
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: removed `text-transform: uppercase` from `.entryDate` (u/[username]/page.module.css), `.entryLabel` (log/[date]/page.module.css), and orphaned `.previewMarkLabel` (page.module.css). Shipped at 3795494.

### [x] [6.3] /today — publish toggle has no affordance explaining what publishing does
- category: external-critique
- impact: 7
- ease: 9
- observation: the publish checkbox on /today appears with no surrounding copy, tooltip, or description explaining what publishing does or who can see a published entry. a user encountering this control for the first time has no basis for deciding whether to use it.
- evidence: critique pass 4 — captured text: "publish / focus / save" with no explanatory context visible in DOM text.
- suggested fix: add `title="make this entry visible on your public profile."` to the publish toggle label (both normal and focus-overlay copies). Follows the bearings rule: "Hover/tooltip copy is a complete sentence with a period."
- source: /critique pass 4 (commit b1aa4e9)
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: added `title="make this entry visible on your public profile."` to both publish toggle `<label>` elements in TodayEntry.tsx. Shipped at 7fe5ba6.

### [x] [5.4] /today — date heading renders as all-caps "FRI 22 MAY 2026"
- category: external-critique
- impact: 6
- ease: 9
- observation: the date heading on /today is displayed in full uppercase ("FRI 22 MAY 2026") via `text-transform: uppercase` on `.dateStamp` in today/page.module.css. `formatDisplayDate` already returns mixed-case ("Fri 22 May 2026"); the CSS is overriding it. the cdcd1ff fix addressed `.entryLabel` and `.stripLabel` but did not cover `.dateStamp`.
- evidence: `today/page.module.css:83` — `.dateStamp { text-transform: uppercase; }`
- suggested fix: remove `text-transform: uppercase` from `.dateStamp`.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T04:09:00Z]
- resolution: removed `text-transform: uppercase` from `.dateStamp` in today/page.module.css. Shipped at d419779.

### [x] [5.4] /today — FOCUS and DONE button labels are all-caps
- category: external-critique
- impact: 6
- ease: 9
- observation: the focus-mode toggle ("FOCUS") and exit ("DONE") buttons render in full uppercase via `text-transform: uppercase` on `.focusTrigger` and `.focusDone`. button text in source is already lower-case ("focus", "done"); the CSS is inflating it.
- evidence: `today/page.module.css:383` `.focusTrigger { text-transform: uppercase; }`; line 445 `.focusDone { text-transform: uppercase; }`
- suggested fix: remove `text-transform: uppercase` from `.focusTrigger` and `.focusDone`.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T04:09:00Z]
- resolution: removed `text-transform: uppercase` from `.focusTrigger` and `.focusDone` in today/page.module.css. Shipped at d419779.

### [x] [4.9] / — "read-only preview" label gives state but not purpose
- category: external-critique
- impact: 7
- ease: 7
- observation: the 7-day preview section is introduced with "the next seven days." followed by a terse "read-only preview" label. the label communicates the interaction state but not why the visitor is seeing this content. a first-time visitor may miss that this is an illustrative sample of what they will receive daily.
- evidence: captured text: "the next seven days. / read-only preview / today / Fri 22 May"
- suggested fix: add a short explanatory subtitle beneath "the next seven days." — e.g. "this is what arrives each morning." — so the preview's purpose is clear without requiring the visitor to infer it.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T08:00:00Z]
- resolution: replaced "read-only preview" with "this is what arrives each morning." in the sevenMeta span in src/app/page.tsx. Shipped at 757f4a7.

### [x] [4.5] /signin — email field label is all-caps "EMAIL"
- category: external-critique
- impact: 5
- ease: 9
- observation: the email input label renders as "EMAIL" in full uppercase via `text-transform: uppercase` on `.fieldLabel` in signin/page.module.css. the cdcd1ff typography pass removed uppercase from labels in /settings and /today but the /signin label was not included.
- evidence: `signin/page.module.css:91` — `.fieldLabel { text-transform: uppercase; }`
- suggested fix: remove `text-transform: uppercase` from `.fieldLabel` in signin/page.module.css.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T10:40:00Z]
- resolution: removed `text-transform: uppercase` from `.fieldLabel` in signin/page.module.css. Shipped at 055c339.

### [x] [4.5] / — page title is a bare product name with no description
- category: external-critique
- impact: 8
- ease: 9
- observation: `src/app/page.tsx` line 36 contains `<span className={styles.previewMarkLabel}>the brand is the practice rendered</span>`. CSS `text-transform: uppercase` in `.previewMarkLabel` renders this as "THE BRAND IS THE PRACTICE RENDERED" — internal design-system language exposed on the primary conversion surface. Breaks voice and confuses first-time visitors.
- evidence: `src/app/page.tsx:36` + `src/app/page.module.css:96`
- suggested fix: remove the `<span>` and its inner text entirely; the MosaicPreview is self-explanatory and the section needs no visible label.
- source: /critique pass 2 (commit 1ade924)
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: removed the `previewMarkLabel` span from src/app/page.tsx. Shipped at 0c1d673.

### [x] [5.6] /today — focus-mode overlay DOM duplication exposes duplicate controls to screen readers
- category: external-critique
- impact: 8
- ease: 7
- observation: the focus-mode overlay contains a second full copy of the prompt, "YOUR RESPONSE" heading, save-state indicator, and publish/save controls. Both copies are in the DOM simultaneously; without `aria-hidden` on the inactive overlay, screen readers encounter every interactive control twice.
- evidence: both copies live in DOM at once with no aria-hidden on the inactive one.
- suggested fix: add `aria-hidden="true"` to the focus-mode overlay container when focus mode is not active.
- source: /critique pass 2 (commit 1ade924)
- resolution: `aria-hidden={!isFocus}` added to the focus overlay div, along with `aria-modal={isFocus}` and `tabIndex={isFocus ? 0 : -1}` on overlay interactive elements. Shipped as part of phase 19 (a9e1729).

### [x] [5.4] /today — section header caps conflict with stated typographic voice
- category: external-critique
- impact: 6
- ease: 9
- observation: "YOUR RESPONSE" and "YOUR LAST SEVEN DAYS" are rendered in full uppercase while every other label uses sentence or lower case, violating the `bearings.md` voice rule "lower-case where typographic restraint reads better".
- evidence: `src/app/today/page.module.css` multiple `text-transform: uppercase` rules
- suggested fix: remove `text-transform: uppercase` from `.entryLabel` and `.stripLabel` selectors (or equivalent), leaving source text already lower-case.
- source: /critique pass 1 (commit c69173d)
- issue: #25
- resolution: removed `text-transform: uppercase` from `.entryLabel` and `.stripLabel` (today/page.module.css), `.label` (settings/page.module.css), and `.mosaicMeta` (log/page.module.css). Closes the /today, /settings, and /log uppercase-label cluster from critique passes 1 and 2. Shipped at cdcd1ff.

### [x] [7.2] /settings — timezone selector is effectively unusable on mobile
- category: external-critique
- impact: 9
- ease: 8
- observation: the timezone selector is a flat unfiltered list of 200+ timezone strings in a single `<select>` with no `<optgroup>` grouping and no search. mobile users must scroll hundreds of raw IANA tz names.
- evidence: settings page body text is almost entirely composed of raw timezone names in alphabetical sequence.
- suggested fix: group timezones with `<optgroup>` by region prefix (Africa, America, Asia, Europe, etc.).
- source: /critique pass 1 (commit c69173d)
- issue: #26
- resolution: added groupTimezones() helper in SettingsForm.tsx; timezone <select> now renders <optgroup> per region. Shipped at 8d43d1b.

### [x] [5.4] /today — save-state indicator may not be in an aria-live region
- category: external-critique
- impact: 6
- ease: 9
- observation: the "not yet saved" / "saved" indicator on /today may not be wrapped in an `aria-live` region; screen reader users may not be notified when save state changes.
- evidence: captured text shows save-state as static text with no live-region context visible.
- suggested fix: verify `aria-live="polite"` on the save-state element; add if absent.
- source: /critique pass 1 (commit c69173d)
- resolution: `aria-live="polite"` confirmed present on `.lastSaved` span in TodayEntry.tsx (both normal and focus-overlay copies). Already fixed as part of [4.8] in the Done section (shipped at 8b41e0a). Duplicate finding; closed without separate commit.

### [x] [4.5] / — page title is a bare product name with no description
- category: external-critique
- impact: 5
- ease: 9
- observation: the homepage `<title>` is simply "ember" — no description, no keyword signal, no context for returning users with multiple tabs.
- evidence: root layout metadata title = "ember"
- suggested fix: change root layout title to "ember — a daily writing ritual" (or from the tagline).
- source: /critique pass 2 (commit 1ade924)
- issue: [mirror-failed: 2026-05-22T06:08:00Z]
- resolution: changed root layout title, OG title, and twitter title to "ember — a daily writing ritual". Shipped at 99aa554.

### [x] [4.5] /log — "60 quiet" in the empty-state stat line is ambiguous
- category: external-critique
- impact: 5
- ease: 9
- observation: "0 days written. 60 quiet. 0 published." — the word "quiet" means days with no entry but a first-time visitor cannot parse this without explanation.
- evidence: captured text: "0 days written. 60 quiet. 0 published."
- suggested fix: add a gloss — "60 quiet days." — or a visible label beneath the stat row explaining what each figure counts.
- source: /critique pass 1 (commit c69173d)
- issue: [mirror-failed: 2026-05-22T09:19:00Z]
- resolution: changed `{quiet} quiet.` to `{quiet} {quiet === 1 ? 'day' : 'days'} quiet.` in log/page.tsx. Shipped at ccafa00.

### [x] [4.5] /log, /log/[date], /u/[username]/[date], /u/[username] — uppercase date/meta labels
- category: voice
- impact: 5
- ease: 9
- observation: `text-transform: uppercase` persists on four selectors after the cdcd1ff and d419779 passes fixed today/page.module.css but left the log and public-profile pages untouched: `.entryDate` in log/page.module.css, `.entryDate` in log/[date]/page.module.css, `.entryDate` in u/[username]/[date]/page.module.css, and `.mosaicMeta` in u/[username]/page.module.css. The log `.entryDate` shows a date like "FRI 22 MAY"; the profile `.mosaicMeta` shows "PUBLISHED IN THE LAST SIXTY DAYS" — both violate the voice rule.
- evidence: log/page.module.css:173, log/[date]/page.module.css:96, u/[username]/[date]/page.module.css:76, u/[username]/page.module.css:91
- suggested fix: remove `text-transform: uppercase` from all four selectors (same mechanical fix as d419779 applied to today/page.module.css).
- source: /iterate audit 2026-05-22
- issue: #27
- resolution: removed `text-transform: uppercase` from all four selectors. Shipped at 1cfcd07.

### [x] [4.2] / (mobile) — footer trust copy absent at 375px
- category: external-critique
- impact: 6
- ease: 7
- observation: desktop footer includes "a sign-in link is the only thing you'll receive. no password, no spam." — a key trust signal for skeptical first-time visitors. this copy does not appear in the mobile (375px) capture, removing the objection-handler before the sign-in CTA.
- evidence: desktop capture includes the privacy reassurance; mobile capture ends with "sign in to start" with no privacy copy.
- suggested fix: audit the mobile layout to confirm this copy is visible at 375px, or surface it directly above the "sign in to start" CTA.
- source: /critique pass 1 (commit c69173d)
- issue: [mirror-failed: 2026-05-22T15:44:00Z]
- resolution: removed `.ctaCopy { display: none }` at ≤480px; set font-size to var(--type-14) so copy stacks above the CTA button in column layout; increased page padding-bottom to 160px on mobile. Shipped at a018b8d.

### [x] [3.6] /signin — page title not distinctive (inherits root layout title)
- category: seo
- impact: 4
- ease: 9
- observation: /signin is a 'use client' component with no exported metadata; it inherits the root layout title "ember — a daily writing ritual". all other authenticated pages carry descriptive suffixes ("ember · today", "ember · log", "ember · settings"). a user with both the landing page and the sign-in page open cannot distinguish them by tab title.
- evidence: /signin/page.tsx has no metadata export; root layout title is "ember — a daily writing ritual" (changed from bare "ember" at 99aa554 but still not sign-in-specific).
- suggested fix: add src/app/signin/layout.tsx with `export const metadata = { title: 'ember · sign in' }`.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T17:42:00Z]
- resolution: added src/app/signin/layout.tsx exporting metadata { title: 'ember · sign in' }. Shipped at 6413cfb.

### [x] [2.4] /signin — no link-expiry or next-step copy after submission
- category: external-critique
- impact: 3
- ease: 8
- observation: no indication of how long the magic-link is valid or where it lands; users who close the tab before the email arrives are left uncertain.
- evidence: captured text: "we email you a sign-in link. no password, no spam." — no expiry or destination copy.
- suggested fix: add one line such as "the link is valid for 24 hours and drops you straight into today's page".
- source: /critique pass 1 (commit c69173d)
- resolution: footer now reads "sign-in links expire after 24 hours." — added as part of the dfe1ae4 vendor-attribution fix. Expiry concern addressed.

### [x] [4.5] /today — FOCUS button has no accessible label
- category: external-critique
- impact: 5
- ease: 9
- observation: the focus-mode toggle button is labelled only with "FOCUS" — no `aria-label`. Screen readers cannot determine whether this toggles a view, opens a modal, or changes a setting.
- evidence: FOCUS button in TodayEntry component.
- suggested fix: add `aria-label="enter focus mode"` (or dynamic `aria-label` for pressed state) to the FOCUS button.
- source: /critique pass 2 (commit 1ade924)
- resolution: `aria-label="enter focus mode"` added to the focusTrigger button in TodayEntry.tsx as part of phase 19 (a9e1729).

## Done

### [x] [4.5] a11y — sign-in confirmation message has no ARIA live region

- category: a11y
- impact: 5
- ease: 9
- observation: `src/app/signin/page.tsx` shows a `<p className={styles.confirmation}>` when `state === 'sent'`, but this paragraph carries no `role="status"` or `aria-live`. Screen readers will not announce that the magic-link email was sent. The error state already has `role="alert"` (line 86), but the success state was missed — the same class of gap that was fixed in TodayEntry (lastSaved aria-live), SettingsForm (saveStatus aria-live), and SigninPage error (role="alert").
- evidence: `src/app/signin/page.tsx` line 54: `<p className={styles.confirmation}>check your email...` — no role, no aria-live, rendered only when `state === 'sent'`.
- suggested fix: add `role="status"` to the confirmation `<p>` so screen readers politely announce the success state.
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: added `role="status"` to the confirmation `<p>` in signin/page.tsx. Shipped at d5d2f20.

### [x] [3.6] a11y — ProfileMosaic published tile links missing entry state label

- category: a11y
- impact: 4
- ease: 9
- observation: `ProfileMosaic.tsx` renders published tiles as Link elements with `aria-label={tile.displayDate}`. The label announces only the date ("Mon 12 May 2026") with no indication the tile links to a published entry. Screen reader users navigating the public profile mosaic hear only a date — no context about what they are navigating to. This is the same gap that was fixed in LogMosaic (finding [4.8]), but was not applied to the parallel ProfileMosaic component.
- evidence: `src/app/u/[username]/ProfileMosaic.tsx` line 31: `aria-label={tile.displayDate}` — bare date, no state context. LogMosaic fix at c8770e7 added `tileStateLabel()` to make labels like "Wed 13 May 2026 — published"; ProfileMosaic still uses bare date.
- suggested fix: change `aria-label={tile.displayDate}` to `` aria-label={`${tile.displayDate} — published entry`} `` — all clickable tiles in ProfileMosaic are by definition published.
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: changed `aria-label={tile.displayDate}` to `` aria-label={`${tile.displayDate} — published entry`} `` in ProfileMosaic.tsx. Shipped at 22f9659.

### [x] [3.6] a11y — TodayEntry task button aria-label is static regardless of pressed state

- category: a11y
- impact: 4
- ease: 9
- observation: `TodayEntry.tsx` uses `aria-pressed={taskDone}` correctly to convey toggle state, but `aria-label="mark task done"` is static and never changes. When `taskDone=true`, screen readers announce "mark task done, toggle button, pressed" — the label describes the forward action but not the reverse. A user hearing this cannot tell that clicking will unmark the task. Dynamically updating the label removes the ambiguity.
- evidence: `src/app/today/TodayEntry.tsx` line 57: `aria-label="mark task done"` — hardcoded string with no dependency on `taskDone`.
- suggested fix: change to `aria-label={taskDone ? 'mark task not done' : 'mark task done'}`.
- issue: #24
- resolution: changed to `aria-label={taskDone ? 'mark task not done' : 'mark task done'}` in TodayEntry.tsx. Shipped at a8db48d.

### [x] [4.0] test — /api/auth/signin route has no unit tests

- category: tests
- impact: 5
- ease: 8
- observation: `src/app/api/auth/signin/route.ts` exports POST (initiates Supabase magic-link OTP) but has no colocated unit tests. Every other API route has colocated tests. Uncovered branches: missing/non-string email → 400; Supabase OTP error → 400; success → 200; three-tier env-var fallback for emailRedirectTo.
- evidence: `find src/app/api/auth/signin -name "*.test.*"` returned no results.
- suggested fix: add `src/app/api/auth/signin/__tests__/route.test.ts` with 6 tests.
- issue: [mirror-failed: 2026-05-20T12:06:00Z]
- resolution: added `src/app/api/auth/signin/__tests__/route.test.ts` with 6 tests. Shipped at 2dcef41.

### [x] [3.6] test — settings route missing `use_personalized_prompts` test coverage

- category: tests
- impact: 4
- ease: 9
- observation: `POST /api/settings` handles `use_personalized_prompts` (added in phase 12) at lines 57–59 of `src/app/api/settings/route.ts`, but the test suite has no test that includes this field in the request body. If the field is silently dropped during a future refactor, no test catches it. Every other accepted field (display_name, username, timezone, conflict handling) has explicit coverage.
- evidence: `src/app/api/settings/route.ts` lines 57–59: `if (use_personalized_prompts !== undefined && typeof use_personalized_prompts === 'boolean')`. `src/app/api/settings/__tests__/route.test.ts`: 6 tests, none pass `use_personalized_prompts` in the body.
- suggested fix: add a test that sends `{ use_personalized_prompts: true }` and asserts `mockUpsert` was called with `expect.objectContaining({ use_personalized_prompts: true })`.
- issue: [mirror-failed: 2026-05-20T00:00:00Z]

### [x] [3.6] perf — landing page sign-in links are raw `<a>` anchors

- category: perf
- impact: 4
- ease: 9
- observation: `src/app/page.tsx` had two raw `<a href="/signin">` anchors — header nav (line 17) and CTA button (line 91). Both are the primary conversion path for all unauthenticated visitors, causing full-page reloads instead of client-side navigation with prefetching. The nav-link audit (finding [4.5]) fixed authenticated nav links but missed the anonymous landing page.
- evidence: `src/app/page.tsx` line 17: `<a href="/signin">sign in</a>` in `<nav>`; line 91: `<a className={styles.ctaBtn} href="/signin">sign in to start</a>` in CTA.
- suggested fix: import `Link` from 'next/link'; replace both `<a href="/signin">` with `<Link href="/signin">`.
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: replaced both raw anchors with `<Link>` in src/app/page.tsx. Shipped at a313cd3.

### [x] [2.7] perf — DayStrip "see all sixty" link is a raw `<a>` anchor

- category: perf
- impact: 3
- ease: 9
- observation: `src/app/today/DayStrip.tsx` renders `<a href="/log" className={styles.stripLink}>see all sixty</a>`, causing a full-page reload when clicked. The nav-link audit (finding [4.5]) fixed all nav anchors but missed this content link in DayStrip.
- evidence: `src/app/today/DayStrip.tsx` line ~46: raw `<a href="/log">`.
- suggested fix: import `Link` from `next/link` in DayStrip.tsx and replace `<a href="/log">` with `<Link href="/log">`.
- resolution: replaced raw `<a>` with `<Link>` and imported `Link` from `next/link` in DayStrip.tsx.

### [x] [2.7] a11y — DayStrip section has no accessible heading

- category: a11y
- impact: 3
- ease: 9
- observation: `<section className={styles.strip}>` in `DayStrip.tsx` uses a `<span>` for its visible label "your last seven days". Screen reader users navigating by headings skip straight from the page `<h1>` (today's prompt) to nothing inside DayStrip. Unlabeled sections are not exposed as named landmarks.
- evidence: `src/app/today/DayStrip.tsx` line ~41: `<span className={styles.stripLabel}>your last seven days</span>` — plain span, not a heading.
- suggested fix: change `<span className={styles.stripLabel}>` to `<h2 className={styles.stripLabel}>` to add the section to heading navigation.
- resolution: changed `<span className={styles.stripLabel}>` to `<h2 className={styles.stripLabel}>` in DayStrip.tsx.

### [x] [4.5] perf — site nav uses raw `<a>` tags; full-page reload on every authenticated navigation

- category: perf
- impact: 5
- ease: 9
- observation: all four authenticated page layouts (`today/`, `log/`, `log/[date]/`, `settings/`) render the site nav with raw `<a href="...">` anchors instead of Next.js `<Link>`. Raw anchors trigger full-page reloads; `<Link>` enables client-side transitions and prefetching. `Link` is already imported in all four files.
- evidence: `src/app/today/page.tsx` lines 63–65; `src/app/log/page.tsx` lines 73–76; `src/app/log/[date]/page.tsx` lines 62–65; `src/app/settings/page.tsx` lines 38–40 and line 54.
- suggested fix: replace `<a href="...">` with `<Link href="...">` in all four nav blocks and the settings profile link.
- issue: #23

### [x] [4.0] bug — entries API accepts future dates; UI rejects them

- category: bug
- impact: 5
- ease: 8
- observation: `POST /api/entries` validates date format (YYYY-MM-DD) but does not check whether the date is in the future. Authenticated users can submit entries for future dates. These rows are stored in the DB but are inaccessible via the UI — `log/[date]/page.tsx` already calls `notFound()` for any date > today. The inconsistency creates phantom rows that violate the product model (one entry per day, written on that day).
- evidence: `src/app/api/entries/route.ts` lines 31–33: validates format only, no temporal bound. `src/app/log/[date]/page.tsx` lines 26–29: rejects future dates with `notFound()`.
- suggested fix: derive UTC today as `new Date().toISOString().slice(0, 10)`, check `if (date > today)` and return 400. Add a test for this branch.
- issue: #22
- resolution: added today-date guard in `src/app/api/entries/route.ts` and a new test. Shipped at c5ffb03.

### [x] [5.4] a11y — SigninPage error message has no role="alert"

- category: a11y
- impact: 6
- ease: 9
- observation: `src/app/signin/page.tsx` renders `<p className={styles.errorMsg}>{errorMsg}</p>` when `state === 'error'`, but the paragraph carries no `role="alert"` and no `aria-live`. When sign-in fails (invalid email, Supabase rate-limit, network error) the error text appears visually but screen readers receive no announcement — identical to the pattern already fixed in TodayEntry and SettingsForm.
- evidence: `src/app/signin/page.tsx` line 86: `<p className={styles.errorMsg}>{errorMsg}</p>` — no role, no aria-live, dynamically rendered on error.
- suggested fix: add `role="alert"` to the error paragraph.
- issue: #19

### [x] [4.5] test — signout route has no unit tests

- category: tests
- impact: 5
- ease: 9
- observation: `src/app/auth/signout/route.ts` exports POST (calls `supabase.auth.signOut()` then redirects to `/`) and GET (returns 405). Neither branch has a test. Every other API route has colocated tests.
- evidence: `find src -path "*/signout*test*"` returns no results.
- suggested fix: add `src/app/auth/signout/__tests__/route.test.ts` with 2 tests: POST signs out and redirects to `/`; GET returns 405.
- issue: #20
- resolution: added `src/app/auth/signout/__tests__/route.test.ts` with POST and GET tests. Shipped at bbeb643.

### [x] [3.6] seo — log/[date] generateMetadata missing description

- category: seo
- impact: 4
- ease: 9
- observation: `src/app/log/[date]/page.tsx` `generateMetadata` returns only `{ title }` with no `description`. Search engines and social previews fall back to the root layout description ("ten minutes of intention before the day swallows you") for all date-specific log pages.
- evidence: `src/app/log/[date]/page.tsx` lines 15–20: `return { title: \`ember · log · ${date}\` }` — no description key.
- suggested fix: add `description: 'your entry for ${date}'` (or similar) to the return object.
- issue: #21
- resolution: added `description: \`your entry for ${date}\`` to generateMetadata return. Shipped at c0fcf1f.

### [x] [5.6] seo — public profile pages missing openGraph and twitter metadata

- category: seo
- impact: 8
- ease: 7
- observation: `/u/[username]/page.tsx` returned only `title` and `description` from `generateMetadata` — no `openGraph` or `twitter`. `/u/[username]/[date]/page.tsx` returned only `title`. Shared links fell back to the generic root layout card.
- evidence: `src/app/u/[username]/page.tsx` lines 17–23; `src/app/u/[username]/[date]/page.tsx` lines 18–23.
- suggested fix: add `openGraph` and `twitter` blocks to both routes' `generateMetadata`, using `NEXT_PUBLIC_SITE_URL` for canonical URLs.
- issue: #17
- resolution: added `description`, `openGraph`, and `twitter` to both routes. Shipped at 7532c5d.

### [x] [5.4] a11y — SettingsForm save feedback has no ARIA live regions

- category: a11y
- impact: 6
- ease: 9
- observation: `SettingsForm.tsx` updates the UI dynamically after save — a "saved." confirmation span and error messages — but neither uses ARIA live regions. The `saveStatus` span always renders "saved." in the DOM; only a CSS class toggles visibility (no content change), so screen readers do not announce the confirmation. The `saveError` span and `fieldError` paragraph are conditionally rendered on error but carry no `role="alert"`.
- evidence: `src/app/settings/SettingsForm.tsx` lines 189–194: `saveStatus` span no `aria-live`; `saveError` span no `role`; line 183–185: `fieldError` paragraph no `role`.
- suggested fix: add `aria-live="polite"` to `saveStatus` span and render conditional content; add `role="alert"` to `saveError` and `fieldError`.
- issue: #16

### [x] [4.8] a11y — LogMosaic tile aria-labels omit entry state

- category: a11y
- impact: 6
- ease: 8
- observation: `LogMosaic.tsx` renders 60 interactive link tiles each with `aria-label={tile.displayDate}`. Screen reader and keyboard users navigating the mosaic hear only the date ("Wed 13 May 2026") with no indication of tile state — whether the day has a written entry, a published entry, or no entry at all.
- evidence: `src/app/log/LogMosaic.tsx` line 82: `aria-label={tile.displayDate}` on every tile regardless of `tile.state` (`empty` | `filled` | `today` | `published`)
- suggested fix: append state description to aria-label: "no entry" / "written" / "today" / "published"
- issue: #15
- resolution: added `tileStateLabel()` helper in LogMosaic.tsx; aria-label now reads "Wed 13 May 2026 — written" etc. Shipped at c8770e7.

### [x] [4.8] a11y — save feedback in TodayEntry has no live region

- category: a11y
- impact: 6
- ease: 8
- observation: `TodayEntry.tsx` updates the `lastSaved` span text dynamically after a save, and conditionally renders an error paragraph on failure. Neither element uses ARIA live regions. Screen reader users won't know when their entry has saved successfully or if a save error has occurred — the only feedback is visual.
- evidence: `src/app/today/TodayEntry.tsx` line 80: `<span className={styles.lastSaved}>` text updates after save with no aria-live; line 103–105: error `<p>` conditionally rendered with no role="alert"
- suggested fix: add `aria-live="polite"` to the `lastSaved` span; add `role="alert"` to the error paragraph
- issue: #14
- resolution: added `aria-live="polite"` to the lastSaved span and `role="alert"` to the save error paragraph in TodayEntry.tsx. Shipped at 8b41e0a.

### [x] [5.4] a11y — task-done state not conveyed to screen readers on log views

- category: a11y
- impact: 6
- ease: 9
- observation: `log/[date]/page.tsx` renders `<span className={styles.entryTaskCheck} />` and `<span className={styles.entryTaskUnchecked} />` as purely visual indicators. `log/page.tsx` renders `<span className={recentEntry.task_done ? styles.entryTaskCheck : undefined} />`. All three spans are empty — no `aria-label`, no `role`, no text. Screen readers see only the task description with no indication of whether the task was completed.
- evidence: `src/app/log/[date]/page.tsx` lines 79–84; `src/app/log/page.tsx` line 104.
- suggested fix: add `role="img"` and `aria-label="task done"` / `aria-label="task not done"` to the task-state spans in both files.
- issue: #13
- resolution: added `role="img"` and `aria-label="task done"`/`"task not done"` to task-state spans in both log pages. Shipped at 22c5da5.

### [x] [6.3] a11y — TodayEntry textarea has no programmatic label

- category: a11y
- impact: 7
- ease: 9
- observation: `src/app/today/TodayEntry.tsx` renders a `<p className={styles.entryLabel}>your response</p>` above the textarea, but it is a plain paragraph, not a `<label>` element. The textarea has no `id`, no `htmlFor` association, and no `aria-label`. Screen readers will not announce "your response" when the user focuses the textarea — the core write surface of the app.
- evidence: `TodayEntry.tsx` lines ~45–52: `<p className={styles.entryLabel}>your response</p>` immediately above `<textarea ... />` with no id, no aria-label, no htmlFor link.
- suggested fix: change the `<p>` to `<label htmlFor="today-entry-response">`, add `id="today-entry-response"` to the textarea.
- issue: #12
- resolution: changed `<p>` to `<label htmlFor="today-entry-response">` and added `id="today-entry-response"` to the textarea. Shipped at 44613b0.

### [x] [5.6] bug — log mosaic counts wrong on today-tile edge case

- category: bug
- impact: 5
- ease: 9
- observation: `src/app/log/page.tsx` computed `written`, `quiet`, and `published` by filtering the `tiles` array on `state`. Two faults: (1) today's tile always has `state = 'today'` (set before the `is_published` check), so a published today-entry is never counted in `published`. (2) today's tile has `state = 'today'` even with no entry yet, inflating `written` by 1 for every new user before they've ever written.
- evidence: tile state machine in `log/page.tsx` sets `state = 'today'` before `is_published` check; `written = tiles.filter(t => t.state !== 'empty').length` always includes today.
- suggested fix: derive counts from the `entries` map directly (`entries.size`, `60 - entries.size`, `[...entries.values()].filter(e => e.is_published).length`).
- resolution: fixed in `src/app/log/page.tsx` — counts now derived from the `entries` map. Shipped this tick.

### [x] [4.2] test gap — auth middleware has no unit tests

- category: tests
- impact: 6
- ease: 7
- observation: `src/middleware.ts` had no unit tests despite being the sole auth guard for all protected routes (`/today`, `/log`, `/settings`). It also redirects authenticated users away from `/signin`.
- evidence: `find src -name "*.test.*" | xargs grep -l "middleware"` returned no results.
- suggested fix: add `src/__tests__/middleware.test.ts` covering unauthenticated redirects, authenticated pass-through, and /signin-to-/today redirect.
- issue: #11
- resolution: added 12 tests in `src/__tests__/middleware.test.ts` using `@vitest-environment node`. Shipped at f5990c2.

### [x] [4.2] content gap — only 20 prompts vs spec target of ~100; rotation repeats every 20 days

- category: content-gaps
- impact: 7
- ease: 6
- observation: `content/prompts.json` contains 20 entries. The deterministic rotation in `src/lib/prompts.ts` cycles `daysSinceEpoch % prompts.length`, so any user practicing daily sees the same prompt every 20 days. Phase 5 brief specified "a seed list of ~100 prompts."
- evidence: `cat content/prompts.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"` → 20
- suggested fix: expand content/prompts.json to ~100 entries in the established voice. Delegate to prompt-curator sub-agent; no schema or code changes required.
- next: spawn prompt-curator sub-agent to write ~80 additional prompts + tasks in the established voice
- issue: #10
- resolution: expanded content/prompts.json from 20 to 101 entries via prompt-curator sub-agent. Shipped at a6d0d49.

### [x] [user-issue #6] [HIGH] entries table missing from Supabase — migrations not applied

- category: external-issue
- impact: 9
- ease: 6
- issue: #6
- investigated: 2026-05-16 — at the time, confirmed all 4 migrations in supabase/migrations/ had not been applied to the connected project.
- resolution: superseded. The `march.yml` cloud-loop workflow gained an "Apply Supabase migrations" step that pushes pending migrations every tick via the IPv4 session pooler — using `SUPABASE_PROJECT_ID` + `SUPABASE_DB_PASSWORD` (already GitHub secrets) and the `SUPABASE_REGION` variable; no `SUPABASE_ACCESS_TOKEN` required. Verified via `/oversight` 2026-05-21: a REST probe of `/rest/v1/entries` returned HTTP 200, confirming the table exists in production. No user action required; GitHub issue #6 can be closed.

### [x] [6.3] stale useCallback closure in SettingsForm silently ignores personalizedVal on save

- category: bug
- impact: 7
- ease: 9
- resolution: added `personalizedVal` to the `useCallback` dependency array. Shipped at 0419eb3.
- issue: #9

### [x] [5.4] robots.txt and sitemap.xml absent — site is not crawlable

- category: seo
- impact: 6
- ease: 9
- issue: #7
- resolution: added `src/app/robots.ts` and `src/app/sitemap.ts` using Next.js 15 App Router conventions. Shipped at 8e399c7.

### [x] [4.9] OG / social metadata absent on all pages

- category: seo
- impact: 7
- ease: 7
- resolution: added openGraph (type, siteName, title, description, url) and twitter card (summary) to root layout metadata. Text cards now surface on every social/messaging platform. No OG image for v1. Shipped at 2907586.

### [x] [4.0] auth/callback route has no unit test

- category: tests
- impact: 5
- ease: 8
- issue: #8
- resolution: added `src/app/auth/callback/__tests__/route.test.ts` with 3 tests covering all three branches. Shipped at bef2c0e.

### [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- resolution: added `VERCEL_PROJECT_PRODUCTION_URL` as fallback in `src/app/api/auth/signin/route.ts` so the route no longer falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is absent. Added two targeted tests covering the env-var fallback chain. Note: the Supabase Dashboard "Site URL" at Authentication → URL Configuration should also be set to the production Vercel URL — that is a user action in the Supabase console.
