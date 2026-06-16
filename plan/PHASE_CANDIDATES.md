# Ember — phase candidates

> Last pass: 2026-06-16 at commit 5f3510f
> Pass count: 140

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

> Pruned via `/oversight` 2026-06-11: the per-pass "signals updated pass N —
> no new signals" append trail is removed. Going forward `/expand` maintains a
> single `- status:` line per candidate (overwrite it, don't append) and adds
> a dated note ONLY when a scope item is added, resolved, or re-scored.

## Pending

### [ ] [score 5.0] New-surface a11y sweep — passes 57-58 a11y findings on search, reminder, focus-mode, and log surfaces

- proposed: 2026-06-15, expand pass 136
- status: 2026-06-16 — /signin submit :focus-visible resolved (f571cbb, 3715e9e); pass 59 adds /settings weekly-reflection aria-describedby [LOW] to scope; daily-reminder and weekly-reflection aria-describedby resolved (b08765f, 4eb95b4); focus-mode check-in/tags aria-describedby resolved (22b0bcd, 22b0bcd); pass 60 (1ba1c4e) adds /today day-strip aria-hidden [LOW] and /settings prompt-source radio label verbosity [LOW] to scope; pass 140: day-strip aria-hidden confirmed false positive (aria-hidden already present at 9b1e99f; CRITIQUE.md [x]); candidate now 2 items (2 LOW)
- source signals:
  - critique pass 58 (commit a9827d4): /signin — submit button has no :focus-visible rule; keyboard focus invisible [MED] — .submit class in page.module.css has no :focus-visible; pattern was fixed on .fieldInput (bd69812) and .ctaBtn (32c93fb) but not on the form submit button; fix: add .submit:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; } to src/app/signin/page.module.css — RESOLVED at f571cbb
  - critique pass 58 (commit a9827d4): /settings — daily reminder "off" radio aria-describedby points to description of the active ("on") behavior [MED] — both off and on radios share aria-describedby="desc-reminder-off"; the paragraph describes active-reminder behavior, not the no-reminder state; fix: split into two description paragraphs (id="desc-reminder-off" and id="desc-reminder-on") with matching aria-describedby on each radio in src/app/settings/SettingsForm.tsx
  - critique pass 59 (commit eb5b8d0): /settings — weekly-reflection "off" and "on" radio inputs both carry aria-describedby="desc-reflection-off"; the paragraph at that id describes active-reflection behavior, not the no-reflection state; fix: add a second description paragraph id="desc-reflection-on" with active behavior text and update the "on" radio's aria-describedby accordingly in src/app/settings/SettingsForm.tsx [LOW]
  - critique pass 58 (commit a9827d4): /today — focus-mode check-in and tags inputs have no accessible descriptions; hint paragraphs hidden by aria-hidden [MED] — the main-entry section (aria-hidden when isFocus) contains the hint paragraphs for check-in and tags; the focus-overlay inputs have no aria-describedby; fix: duplicate hint paragraphs inside the focus overlay and add aria-describedby on the corresponding focus-mode inputs in src/app/today/TodayEntry.tsx
  - critique pass 57 (commit ee8ddd0): /log — "private" label on entry listing is free-floating text with no programmatic association to its entry [LOW] — "private" appears as trailing text after the entry preview with no aria-describedby or placement inside the article element; fix: move the private badge inside the article element and add context via aria-label or visually-hidden prefix in src/app/log/page.tsx
  - critique pass 60 (commit 1ba1c4e): /today — day-strip abbreviated weekday labels not aria-hidden; AT reads weekday name twice per entry [LOW] — abbreviated day name ('Wed', 'Thu') precedes full date string ('Wed 10 Jun 2026 — no entry') with no aria-hidden on the abbreviation element; fix: add aria-hidden="true" to the abbreviated day label element in src/app/today/DayStrip.tsx
  - critique pass 60 (commit 1ba1c4e): /settings — prompt source radio labels embed full descriptions inline; verbose under AT announcement [LOW] — each radio label contains the pack name and a full descriptive clause after an em-dash; daily-reminder and weekly-reflection use aria-describedby for supplementary text (a resolved pattern); prompt-source options do not; fix: separate description into sibling <span> with aria-describedby so the radio label is the pack name alone
- rationale: phases 31-35 (entry search, year-in-review, daily reminder, one-word check-in, entry tags) introduced new UI surfaces that have each accumulated at least one a11y gap. The 3 MED findings are all keyboard/AT-visibility gaps identical in severity to findings that prompted dedicated iterate fixes in passes 49-54. Together they form a focused one-phase close with no schema changes and no new routes.
- proposed scope: 1 phase — ship all pending scope items (3 remaining)
- estimated phases: 1
- conflicts: none — no new routes; no schema changes; all are attribute/CSS additions

### [ ] [score 4.5] Voice, navigation, and comprehension fixes — passes 57-58 findings on stat line philosophy, link labels, and section copy

- proposed: 2026-06-15, expand pass 136
- status: 2026-06-16 — quiet-day stat line resolved (0cf2771); "all entries" link resolved (74143b7, now "full entry"); pass 60 (1ba1c4e) adds /log "the past 60 days" heading [LOW] to scope; pass 140: "past 60 days" heading resolved (eb6ce9d, text now "the past 60 days — a writing window."); candidate now 3 items (3 LOW): /log search aria-label "your entries", / "the next seven days" heading, /settings "personalized" threshold copy
- source signals:
  - critique pass 57 (commit ee8ddd0): /log — "59 days quiet" stat line implies a performance score; contradicts "a missed day leaves no mark" philosophy [MED] — the stat line "N days written. N days quiet. N days published." displays the absence count prominently alongside the practice count; this is the opposite of the bearings and landing page promise; fix: remove "N days quiet." from the stat line so only written + published counts appear (src/app/log/page.tsx stat-line generation) — RESOLVED at 0cf2771
  - critique pass 58 (commit a9827d4): /log — "all entries" link implies an archive but navigates to single most-recent entry's dated page [MED] — link text "all entries" was chosen to replace "browse by date" (voice coherence pass) but the destination /log/${recentDate} is a single entry, not an archive; fix: change link text to the destination date string or "view entry" to accurately describe the link in src/app/log/page.tsx
  - critique pass 58 (commit a9827d4): /log — search input aria-label "search your entries" overrides visible label and introduces second-person "your" [LOW] — aria-label on the input wins over the associated <label>; the visible label "search entries" and AT-computed name "search your entries" diverge; "your" violates voice guide; fix: remove aria-label from input in src/app/log/LogSearch.tsx and rely on the programmatically-associated <label>
  - critique pass 58 (commit a9827d4): / — "the next seven days" section heading includes today; heading implies future-only content [LOW] — the seven-item list starts with "today"; the heading "the next seven days" implies future-only; fix: change to "the coming week" or "seven days of prompts" in src/app/page.tsx
  - critique pass 57 (commit ee8ddd0): /settings — "personalized" prompt description does not state the minimum entry threshold [LOW] — "falls back to a standard prompt until entries exist" is vague; a user with one entry cannot tell if personalization is active; fix: specify a concrete threshold phrase, e.g. "requires a few entries to take effect" in src/app/settings/SettingsForm.tsx
  - critique pass 60 (commit 1ba1c4e): /log — "the past 60 days" heading overstates window scope for sparse accounts [LOW] — new users see "the past 60 days" heading alongside "2 days written. 0 days published." stat; "60 days" is ambiguous — browsing window or expected count; fix: add a brief clarifying sub-label such as "a 60-day window" or rephrase heading to remove count ambiguity for new users (src/app/log/page.tsx)
- rationale: the "59 days quiet" stat line is the highest-priority finding: it directly contradicts the stated product philosophy on the authenticated /log page, which every user sees. the "all entries" mislabeling introduces navigation confusion on the same page. the remaining items are all 1-line copy fixes already scoped to src/ files. Together they close voice, navigation, and comprehension gaps introduced by phases 31-36.
- proposed scope: 1 phase — ship all pending scope items (5 remaining)
- estimated phases: 1
- conflicts: none — copy-only and attribute-only; no new routes; no schema changes

### [ ] [score 4.0] DOM rendering cleanup — always-in-DOM overlays and duplicate text for raw-text consumers

- proposed: 2026-05-31, expand pass 60
- status: 2026-06-11 — scope reduced to item 2 only (item 1, the / 7-day
  preview mobile header doubling, resolved itself per critique pass 27
  a59273f). The /today focus overlay remains always-in-DOM at
  TodayEntry.tsx (comment: "always in DOM so opacity transition plays on
  close"); finding alone scores [1.8], below the iterate threshold.
- source signals:
  - critique pass 22 (commit 24d04ae): /today — focus overlay always rendered in DOM [1.8] — the focus-mode overlay is retained permanently in the DOM for its opacity-transition animation and hidden from AT via aria-hidden; Playwright innerText, scrapers, and feed parsers see the full prompt/controls block duplicated verbatim
- rationale: content nodes CSS-hidden but not absent from the DOM cause text duplication for any raw-DOM consumer — Playwright innerText, link-preview scrapers, feed parsers, and search crawlers. The authenticated /today page's text is effectively doubled at rest. iterate cannot ship this (below threshold; ease 6 due to transition care required).
- proposed scope: 1 phase — /today focus overlay: conditionally render the overlay's inner content only when isFocus is true (outer container stays for the opacity transition; only the inner prompt, controls, and textarea are conditionally mounted) so the duplicate text is absent from the DOM at rest
- estimated phases: 1
- conflicts: none — no new routes, no schema changes; requires care around the CSS opacity transition (outer div stays, inner content conditionally renders)

### [ ] [score 4.0] Settings and profile UX friction — sign-out separation, timezone default for existing accounts

- proposed: 2026-05-27, expand pass 33
- status: 2026-06-11 — 2 scope items remain (2 and 3). Items 1
  (publish prereq hint, bceeb20), 4 (display name hint, 2e34197), 5
  (prereq hint pronoun, 581f6f2), and 6 (timezone field hint, 505d88f)
  resolved via iterate. Item 2 may be partially addressed (footer
  border-top separation exists but no explicit "session" section label).
- source signals:
  - critique pass 13 (commit 4f08c21): /settings — "sign out" sits adjacent to form "save" with no visual separation [2.1] — two differently-weighted actions share the same visual proximity; risk of misfire on mobile
  - iterate audit 2026-05-26: /settings — timezone combobox shows no value for accounts with no saved timezone [2.1] — existing users who never set a timezone return to a blank combobox with no detected default; auto-detection only fires for virgin profiles
- rationale: two remaining UX friction points on the settings flow have no resolution path — iterate cannot ship them (below threshold) and the voice coherence phase explicitly excludes them (UX issues, not copy). Together they affect the settings safety model and the returning-user timezone experience; the fixes are small and focused.
- proposed scope: 1 phase — (1) /settings: add a short horizontal rule and "session" section label above the sign-out form so it reads as a separate action from the form save, reducing misfire risk on mobile; (2) /settings: expand timezone auto-detection to run whenever tzVal === '' (not only for virgin profiles) so returning users with no saved timezone see a detected default rather than a blank combobox
- estimated phases: 1
- conflicts: none — UI-only changes; no new routes; no schema changes; sign-out section styling is CSS-only; timezone auto-detection is client-side only

### [ ] [score 4.0] Sub-threshold polish sweep — SEO, a11y, and semantics micro-fixes orphaned below iterate threshold

- proposed: 2026-06-03, expand pass 90
- status: 2026-06-16 — items 24 (.dayTask::before, 8905030) and 30 (/today section landmark, 0922be8) confirmed resolved; pass 60 (1ba1c4e) adds item 31 (/settings export/print whitespace a11y) to scope; pass 140: items 29 (/log article date h2, 3efd399) and 31 (/settings export/print whitespace, 74e15f2) resolved; 11 scope items pending (2, 3, 5, 20, 21, 22, 23, 25, 26, 27, 28). Items 24-27 added from critique passes 51-52; items 28-29 added from critique pass 53 (expand pass 133); item 30 added from critique pass 54 (expand pass 135); item 31 added from pass 60. Resolved since filing: 1 (37d4e8a), 4 (81072fa), 6 (f13c754), 7 (0101b1b), 8 (c3671bd), 9 (af927c1), 10 (567174d), 11 (43d1502), 12 (1c922ec), 13 (02aa0fd), 14 (faedf1d), 15 (549ebbc), 16 (18aef81), 17 (04498b9), 18 (9ffab40), 19 (0de5180), 24 (8905030), 29 (3efd399), 30 (0922be8), 31 (74e15f2).
- source signals (pending items):
  - item 2: / Twitter card images array lacks alt text [1.8] — `twitter.images` is a plain string array; next.js requires object array `[{ url, alt }]` to emit an alt attribute (fix: `twitter: { images: [{ url: '/opengraph-image', alt: 'ember — a daily writing ritual' }] }` in src/app/layout.tsx)
  - item 3: / MosaicPreview aria-label "60 days of practice" misrepresents illustrative content [1.8] (fix: change to "an example of 60 days tracked" in src/components/mosaic/MosaicPreview.tsx)
  - item 5: /today focus button has no visible description on mobile [1.6] — title tooltips are inaccessible on touch devices (fix: add a short DOM description below the focus button, parallel to the publish toggle description)
  - item 20: /log empty-state "in the mosaic above" directional spatial reference [1.8] (fix: "in the 60-day mosaic" to match the container aria-label; AUDIT.md pending)
  - item 21: / sign-in CTA aside contains no heading element [1.8] (fix: visually-hidden h2 "sign in" inside the aside)
  - item 22: /settings page has no sub-headings for individual setting groups [1.8] (fix: fieldset/legend or muted h2 above each group)
  - item 23: / mosaic preview has no visible caption for sighted users [1.8] (fix: short visible caption in previewMark section, e.g. "the log, over time.")
  - item 24: / — .dayTask::before pseudo-element renders 12×12px checkbox-like square before each task in the 7-day preview [1.8] (pass 51) — read-only preview rows have an empty-checkbox marker that implies interactivity; fix: remove the pseudo-element and rely on the "tiny task —" text prefix (src/app/page.module.css lines 180-188)
  - item 25: /today — OnThisDay <aside> has no aria-label; complementary landmark is unnamed [1.8] (pass 51) — fix: add aria-label="on this day" to the <aside> element in src/app/today/OnThisDay.tsx
  - item 26: /settings — <footer> has no accessible name; contentinfo landmark unnamed [1.8] (pass 51) — fix: add aria-label="account" to <footer> in src/app/settings/page.tsx
  - item 27: /settings — DeleteAccountSection has no aria-live region; deletion in-progress state not announced to screen readers [1.8] (pass 52) — the SettingsForm pattern (<span aria-live="polite">) is not replicated for the destructive flow; fix: add <span aria-live="polite">{deleting ? 'deleting.' : ''}</span> inside DeleteAccountSection
  - item 28: /signin — openGraph metadata block has no images property; share card renders without brand image [2.4] (pass 53) — next.js per-route openGraph merging replaces the full key when a child page overrides it; the /signin layout's openGraph block omits images so links shared to /signin produce an imageless card; fix: add images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember — a daily writing ritual' }] to the openGraph block in src/app/signin/layout.tsx and the same twitter.images to the twitter block
  - item 29: /log — entry article header contains date as plain text with no heading element; heading hierarchy inside the article is broken [2.4] (pass 53) — the <header> inside <article aria-label="most recent entry"> contains the date string with no heading element; AT users navigating by heading encounter the prompt h2 as the first and only heading inside the article; fix: wrap the date string in <h2> and demote the prompt line to <p className={styles.entryPrompt}>
  - item 30: /today — writing surface has no landmark or heading; heading navigation skips directly from H1 (prompt) to H2 (day strip) [2.4] (pass 54) — task check, textarea, and controls render as a flat fragment in TodayEntry.tsx with no section element; AT users navigating by landmark cannot reach the writing surface; fix: wrap TodayEntry outermost content in <section aria-label="today's entry"> (src/app/today/TodayEntry.tsx)
  - item 31: /settings — export and print controls abut without whitespace; concatenated in accessible text [1.8] (pass 60) — "export your data" and "print your book" appear as "export your dataprint your book" in accessible text with no whitespace separator between the two elements; fix: add a whitespace text node between the two sibling elements in src/app/settings/page.tsx
- rationale: easy-to-fix findings accumulate below the iterate threshold with no resolution path; each is a 1–2 line change. They don't cluster with any other candidate but together form a coherent one-pass batch closing real gaps in SEO metadata, AT accuracy, and touch-device comprehension.
- proposed scope: 1 phase — ship all pending items above
- estimated phases: 1
- conflicts: none — no new routes; no schema changes; metadata and attribute-only changes plus two small visible-copy additions

### [ ] [score 3.5] Anonymous page a11y compliance — WCAG AA and ARIA gaps on / and /signin missed by the authenticated-page passes

- proposed: 2026-06-12, expand pass 132
- status: 2026-06-12 — rescored 5.0 → 3.5; items 1, 3, 4 resolved by iterate
  this tick (565a6ee, bc52684, 3794674). 2 scope items remain: (2) /signin
  lockup Link aria-hidden-on-focusable ARIA violation; (5) / CTA aside
  DOM order after footer. Rescored: original signal multiplicity still holds
  but the MED-severity signal (autocomplete) resolved; remaining items are
  2 LOW findings with no conformance-level upgrade.
- source signals:
  - critique pass 51 (commit 0107c11): /signin — email input has no autocomplete="email" [MED] — WCAG 1.3.5; RESOLVED at 565a6ee
  - critique pass 51 (commit 0107c11): /signin — lockup Link carries aria-hidden="true" on a focusable element [LOW] — ARIA authoring practices prohibit aria-hidden on focusable elements; PENDING
  - critique pass 52 (commit b4d3589): / and /signin — <main id="main-content"> missing tabIndex={-1} [LOW] — RESOLVED at bc52684
  - critique pass 52 (commit b4d3589): / and /signin — <footer> elements have no accessible name; contentinfo landmarks unnamed on anonymous pages [LOW] — RESOLVED at 3794674
  - critique pass 52 (commit b4d3589): / — sticky CTA <aside> rendered after <footer> in DOM; complementary landmark follows contentinfo in AT landmark order [LOW] — PENDING
- rationale: the original 5-item compliance gap has been drained to 2 remaining items. The lockup Link aria-hidden-on-focusable is a true ARIA conformance violation (authoring practices explicitly prohibit aria-hidden on focusable elements); the CTA DOM order issue affects landmark navigation for AT users on the landing page. Together they're still worth a focused pass even at the reduced scope.
- proposed scope: 1 phase —
  (1) /signin: replace the lockup Link with a non-interactive <div> styled identically (removing href), keeping only the "back to home" Link navigational, to eliminate the aria-hidden-on-focusable ARIA violation (src/app/signin/page.tsx line 47)
  (2) /: move the <aside className={styles.cta}> before the <footer> in src/app/page.tsx DOM source order so AT landmark navigation encounters the CTA complementary landmark before contentinfo
- estimated phases: 1
- conflicts: none — no new routes; no schema changes; (1) requires care to preserve visual lockup appearance and the "back to home" accessible link

### [ ] [score 4.0] Voice coherence tail — post-phase 22 copy register gaps on new UI surfaces

- proposed: 2026-06-12, expand pass 132
- status: 2026-06-16 — items 1 (/signin "on its way", Phase 30), 5 (/log
  "browse by date" → "all entries" → "full entry"), and 6 (/signin "send a
  link" → "send link.", Phase 30) confirmed resolved; pass 140: adds /settings
  "sign out" second-person imperative [LOW] (AUDIT.md [2.0]) and /today
  focus-exit button "done writing" participial phrase [LOW] (CRITIQUE.md pass 59)
  — neither covered by any existing candidate; 5 scope items pending: /settings
  delete-account "your account", /settings "export your data", / "today's prompt
  is waiting.", /settings "sign out" label, /today "done writing" exit label
- source signals:
  - critique pass 51 (commit 0107c11): /signin — confirmation paragraph "a sign-in link is on its way." uses colloquial idiom departing from the flat bookish register; "directly" adverb in following clause adds no information [LOW] — fix: "a sign-in link has been sent. following it opens today's prompt. links expire after 24 hours. no password. no other mail."
  - critique pass 52 (commit b4d3589): /settings — delete-account confirmation warning reads "permanently delete your account" — second-person possessive within the same two-step flow that uses first-person for the trigger button ("delete my account") [LOW] — fix: "this will permanently delete the account and all entries. there is no undo."
  - critique pass 52 (commit b4d3589): /settings — export link "export your data" uses second-person possessive and imperative verb; voice guide prohibits second-person imperative copy [LOW] — fix: "export data" (noun phrase, no direct address)
  - critique pass 53 (commit 3f0847a): / — sticky CTA "today's prompt is waiting." uses mild anthropomorphism inconsistent with the flat declarative register; the prompt does not have agency [LOW] — fix: "today's prompt is ready." (src/app/page.tsx <p className={styles.ctaCopy}>)
  - critique pass 53 (commit 3f0847a): /log — "browse by date" link label uses second-person imperative verb; all other navigational copy uses noun phrases [LOW] — fix: change link text to "all entries" or "full log" (src/app/log/page.tsx <Link href={`/log/${recentDate}`}>browse by date</Link>)
  - critique pass 54 (commit 4ca3212): /signin — submit button idle label "send a link" is a bare imperative verb phrase; voice guide prohibits second-person imperative copy [LOW] — "send" is the only imperative verb in the page UI copy; fix: change idle label to "get a sign-in link" (src/app/signin/page.tsx: idle state of submit button)
- rationale: phases 21-22 addressed the voice coherence backlog explicitly. But phases 23-24 (data export, account deletion) shipped new UI surfaces with the same register issues, and /signin + /log accumulated additional voice violations in critique passes 53-54. Together these 6 findings span 4 surfaces and form a coherent one-pass close of the voice coherence arc. Copy-only; all are 1-line changes.
- proposed scope: 1 phase — ship all six scope items above
- estimated phases: 1
- conflicts: none — copy-only; no new routes; no schema changes

## Promoted

> Promoted to `plan/steps/01_build_plan.md` via `/oversight` 2026-05-21.
> Canonical scope now lives in the build plan's per-phase section.

- [score 8.0] Entry editing → **Phase 13**
- [score 7.0] Brand assets → **Phase 14**
- [score 5.5] Automated a11y regression testing → **Phase 15**
- [score 5.2] Rate limiting → **Phase 16**
- On this day (echo a past entry on `/today`) → **Phase 17** — oversight-authored experiment, not an `/expand` candidate
- Focus mode (distraction-free writing on `/today`) → **Phase 18** — oversight-authored experiment
- Installable PWA + offline drafts → **Phase 19** — oversight-authored experiment
- [score 7.0] Settings UX — searchable timezone combobox → **Phase 20** (promoted via `/oversight` 2026-05-23)
- [score 5.5] Content voice alignment — prompts.json task copy register → **Phase 21** (promoted via `/oversight` 2026-06-11)
- [score 5.0] Voice coherence audit pass — remaining stalled copy scope items → **Phase 22** (promoted via `/oversight` 2026-06-11; the 12 unresolved scope items are enumerated in the build plan's Phase 22 section)
- [score 5.0] Data export — entries as JSON or Markdown → **Phase 23** (promoted via `/oversight` 2026-06-11)
- [score 4.5] Account self-service — delete account and all data → **Phase 24** (promoted via `/oversight` 2026-06-11)
- [score 4.0] Loop issue mirroring — restore scripts/loop-issue.mjs → **Phase 25** (promoted via `/oversight` 2026-06-11)
- Evening theme (time-aware dark palette) → **Phase 26** — oversight-authored experiment (2026-06-11)
- Month in review (quiet monthly recap on `/log`) → **Phase 27** — oversight-authored experiment (2026-06-11)
- Shareable entry card (dynamic OG image for public entries) → **Phase 28** — oversight-authored experiment (2026-06-11)
- [score 4.5] E2e authenticated flow coverage → **Phase 29** (promoted via `/oversight` 2026-06-14)
- [score 5.0] Authentication funnel UX clarity → **Phase 30** (promoted via `/oversight` 2026-06-14; expiry-placement [needs-user-call] resolved to post-submission per the build plan's Phase 30 brief)
- Entry search → **Phase 31** — oversight-authored experiment (2026-06-14)
- Year in review → **Phase 32** — oversight-authored experiment (2026-06-14)
- Daily reminder (opt-in) → **Phase 33** — oversight-authored experiment (2026-06-14)
- One-word check-in → **Phase 34** — oversight-authored experiment (2026-06-14)
- Entry tags + themed browsing → **Phase 35** — oversight-authored experiment (2026-06-14)
- Markdown rendering in entries → **Phase 36** — oversight-authored experiment (2026-06-14)
- Weekly reflection (opt-in Anthropic synthesis) → **Phase 37** — oversight-authored experiment (2026-06-14)
- Prompt packs (themed collections) → **Phase 38** — oversight-authored experiment (2026-06-14)
- Bound export ("your book") → **Phase 39** — oversight-authored experiment (2026-06-14)

## Resolved

### [score 3.5] A11y micro-sweep — /today date heading association and aria-modal spec compliance — resolved via iterate

- proposed: 2026-05-28, expand pass 44
- resolution: both scope items addressed by iterate before a dedicated phase was needed. (1) date paragraph associated with prompt H1 via `aria-describedby="today-date"` in src/app/today/page.tsx (4ccd1b3, 2026-05-29); (2) focus-mode overlay `aria-modal={isFocus}` changed to `aria-modal={isFocus || undefined}` in src/app/today/TodayEntry.tsx (4db7e74, 2026-05-29). No dedicated phase required.

### [score 3.5] SEO micro-sweep — /log meta description and OG image alt text — resolved via iterate

- proposed: 2026-05-28, expand pass 44
- resolution: both scope items addressed by iterate before a dedicated phase was needed. (1) /log page metadata description updated from "your past 60 days" to "your writing log — prompts, responses, and the entries you have published over the past 60 days." (a29ff1f, 2026-05-29); (2) OG image alt in root layout updated from "ember" to "ember — a daily writing ritual" (bb32ff9, 2026-05-29). No dedicated phase required.

### [score 6.0] SEO completeness for public profiles — resolved via iterate

- proposed: 2026-05-23, expand pass 7
- resolution: both scope items addressed by iterate before a dedicated phase was needed. (1) `alternates.canonical` added to `/u/[username]` and `/u/[username]/[date]` `generateMetadata` (8d7d49a); (2) `sitemap.ts` made async, queries Supabase `profiles` table for non-null `username` rows, adds `/u/${username}` entries with fallback to static list on DB error (57d1cc2). No dedicated phase required.

### [score 7.0] CSS typography lint gate — resolved via iterate

- proposed: 2026-05-22, expand pass 5
- resolution: both scope items in the reduced scope (2026-05-23 note) addressed by iterate at f3ca66d — `lint:no-uppercase-css` script added to `package.json` and prepended to the verify chain; ban documented in `design/CLAUDE.md` "CSS rule bans" section. No dedicated phase required.

### [score 4.5] Sign-in page experience polish — resolved via iterate

- proposed: 2026-05-22, expand pass 5
- resolution: all 4 source signals addressed by iterate between expand passes 5 and 6. (1) `/signin/layout.tsx` added with `title: 'ember · sign in'`; (2) "sign-in links expire after 24 hours." added to footer (replacing vendor attribution); (3) back link changed to "back to home" (51977f7); (4) vendor attribution removed (dfe1ae4). No dedicated phase required — the bundle shipped as iterate fixes.

### [score 8.5] Voice + typography normalisation pass — resolved via iterate

- proposed: 2026-05-21, expand pass 4
- resolution: all 4 source findings addressed by iterate between expand passes 4 and 5 (commits cdcd1ff, d419779, 055c339, 1cfcd07, 0c1d673). The normalization work is complete; the candidate was not promoted to a dedicated phase. The lint-enforcement component of the proposed scope ("add an axe-core or custom lint check if feasible") was not implemented — extracted as new candidate "CSS typography lint gate" (expand pass 5, score 7.0).

### [score 4.2] Supabase migration CI automation — not promoted

- proposed: 2026-05-18, expand pass 2
- resolution: re-investigated via `/oversight` 2026-05-21 and **not promoted** — the work it asks for already exists. The candidate's premise (`migrate.mjs` falls to path 4; one missing secret blocks automation) is outdated. The `march.yml` workflow's "Apply Supabase migrations" step pushes pending migrations every tick via the IPv4 session pooler, using `SUPABASE_PROJECT_ID` + `SUPABASE_DB_PASSWORD` (GitHub secrets) and the `SUPABASE_REGION` variable — no `SUPABASE_ACCESS_TOKEN` needed, and it does not call `migrate.mjs` at all. A REST probe confirmed the `entries` table exists in production. Promoting this would have created a no-op phase.

## Considered (below threshold)

- **Save timestamp date context** — /today save indicator shows "last saved · HH:MM" with no date qualifier; ambiguous when a session persists across midnight. Single LOW signal (critique pass 57). Score ~2.5: single source, rare edge case, cosmetic only. Revisit if the session-persistence pattern becomes common.
- **Entry search** — spec says "Search (defer)"; single signal, moderate complexity (-1), estimated 1–2 phases. Score ~4. Revisit if AUDIT or user issues surface demand.
- **Magic-link email templates** — design/CLAUDE.md notes "default magic-link email is fine for v1; templated email lands in a later phase if it lands at all." Single signal, polish-only, score ~4. Revisit if brand impression on auth flow becomes a critique finding.
- **Session expiry UX** — Supabase browser client auto-refreshes JWTs; no evidence of a real gap. Score ~2.5: revisit if production reports of silent save failures emerge.
- **Prompt curation tooling** — the seed list is now 101 entries (a6d0d49); editorial work, not a development phase. Revisit if content quality becomes a critique finding.
- **Historical log navigation (pre-60-day entries)** — users with >60 days of practice have no UI path to older entries; URL access works but is not discoverable. Conflicts with bearings.md standing decision ("Pagination: never on /log"). Score ~3.5; needs user call if the standing decision should be revisited for long-term practitioners.
