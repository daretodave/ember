# Ember — phase candidates

> Last pass: 2026-06-11 at commit 5e4e1ce
> Pass count: 131

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

> Pruned via `/oversight` 2026-06-11: the per-pass "signals updated pass N —
> no new signals" append trail is removed. Going forward `/expand` maintains a
> single `- status:` line per candidate (overwrite it, don't append) and adds
> a dated note ONLY when a scope item is added, resolved, or re-scored.

## Pending

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

### [ ] [score 4.5] E2e authenticated flow coverage

- proposed: 2026-05-21, expand pass 4 (re-evaluated from "Considered below threshold", was score 3.0)
- status: 2026-06-11 — still zero authenticated e2e coverage. Phases 13–20
  all shipped without it; ~6 weeks of post-phase iterate fixes likewise.
  Uncovered risk surface: entry write/save on /today, edit flow on
  /log/[date], task toggle, focus mode, on-this-day, offline draft
  persistence (IndexedDB + service worker), timezone combobox
  open/filter/select. All existing Playwright specs test only
  anonymous/redirect state.
- source signals:
  - commit pattern: 20 phases shipped; all Playwright specs still test only anonymous/redirect state — `today.spec.ts` verifies redirect to `/signin` but never the actual write flow
  - phase 19 (PWA + offline): service-worker path and IndexedDB draft persistence have zero e2e coverage; phase 20 (timezone combobox) shipped with unit tests only
- rationale: the gap between what the app does and what e2e verifies has grown with every phase. A regression in the authenticated write flow would ship undetected through all gates. The complexity concern (auth mocking or test credentials) is outweighed by the risk surface; Supabase test-role credentials already in CI secrets are a viable path.
- proposed scope: 1 phase — add Playwright specs that sign in with a test account (Supabase test-role or a dedicated test user), exercise the core write flow on /today, verify entry persistence on /log, and verify the edit flow on /log/[date]; optionally cover the offline draft path with network-intercept stubs
- estimated phases: 1 (may require provisioning a test-user seed in the CI environment)
- conflicts: none — test-only addition

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

### [ ] [score 5.0] Authentication funnel UX clarity — sign-in expiry notice placement, post-submission destination context

- proposed: 2026-05-27, expand pass 35
- status: 2026-06-11 — 2 core scope items remain (2 and 3). Items 1
  (/ CTA returning-user ambiguity, 61eca21 + ade50e4), 4 ("send the
  link" → "send a link", 41d6df7), and 5 (reassurance paragraph DOM
  order, 27e8bf4) resolved via iterate. NOTE: scope item 3 (post-submit
  destination context) is now also scope item 3 of promoted Phase 22
  (voice coherence sweep) — if Phase 22 ships it, only item 2 remains
  here. Item 2 carries a [needs-user-call]: critique pass 37 suggested
  moving expiry INTO the inline pre-submission copy (shipped at 51e9c0a),
  which conflicts with this candidate's direction (show expiry only
  post-submission).
- source signals:
  - critique pass 17 (commit 88f37cf): /signin — expiry notice "sign-in links expire after 24 hours." appears in the pre-submission state [LOW] — its position implies time-pressure urgency before a link has even been requested
  - iterate audit (AUDIT.md [2.4]): /signin — sign-in page gives no destination context after email submission [LOW] — the post-submit confirmation never says where the link leads
- rationale: the findings cluster on the authentication funnel — the sign-in pre/post-submission states do not clearly guide first-time users. Individually below the iterate threshold; together a coherent UX gap in one flow.
- proposed scope: 1 phase — (1) /signin: render the expiry notice only in the post-submission confirmation view so it reads as context for a link already sent (resolve the [needs-user-call] on placement first); (2) /signin post-submission: add one sentence with destination context, e.g. "the link opens today's prompt directly."
- estimated phases: 1
- conflicts: scope overlap with promoted Phase 22 (item 3) — reconcile at promotion time; otherwise none — conditional rendering on /signin with no new routes and no schema changes

### [ ] [score 4.0] Sub-threshold polish sweep — SEO, a11y, and semantics micro-fixes orphaned below iterate threshold

- proposed: 2026-06-03, expand pass 90
- status: 2026-06-11 — 7 scope items pending (2, 3, 5, 20, 21, 22, 23).
  Resolved since filing: 1 (filed in error — already fixed at 37d4e8a),
  4 (81072fa), 6 (f13c754), 7 (0101b1b), 8 (c3671bd), 9 (af927c1),
  10 (567174d), 11 (43d1502), 12 (1c922ec), 13 (02aa0fd), 14 (faedf1d),
  15 (549ebbc), 16 (18aef81), 17 (04498b9), 18 (9ffab40), 19 (0de5180).
- source signals (pending items):
  - item 2: / Twitter card images array lacks alt text [1.8] — `twitter.images` is a plain string array; next.js requires object array `[{ url, alt }]` to emit an alt attribute (fix: `twitter: { images: [{ url: '/opengraph-image', alt: 'ember — a daily writing ritual' }] }` in src/app/layout.tsx)
  - item 3: / MosaicPreview aria-label "60 days of practice" misrepresents illustrative content [1.8] (fix: change to "an example of 60 days tracked" in src/components/mosaic/MosaicPreview.tsx)
  - item 5: /today focus button has no visible description on mobile [1.6] — title tooltips are inaccessible on touch devices (fix: add a short DOM description below the focus button, parallel to the publish toggle description)
  - item 20: /log empty-state "in the mosaic above" directional spatial reference [1.8] (fix: "in the 60-day mosaic" to match the container aria-label; AUDIT.md pending)
  - item 21: / sign-in CTA aside contains no heading element [1.8] (fix: visually-hidden h2 "sign in" inside the aside)
  - item 22: /settings page has no sub-headings for individual setting groups [1.8] (fix: fieldset/legend or muted h2 above each group)
  - item 23: / mosaic preview has no visible caption for sighted users [1.8] (fix: short visible caption in previewMark section, e.g. "the log, over time.")
- rationale: easy-to-fix findings accumulate below the iterate threshold with no resolution path; each is a 1–2 line change. They don't cluster with any other candidate but together form a coherent one-pass batch closing real gaps in SEO metadata, AT accuracy, and touch-device comprehension.
- proposed scope: 1 phase — ship all pending items above
- estimated phases: 1
- conflicts: none — no new routes; no schema changes; metadata and attribute-only changes plus two small visible-copy additions

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

- **Entry search** — spec says "Search (defer)"; single signal, moderate complexity (-1), estimated 1–2 phases. Score ~4. Revisit if AUDIT or user issues surface demand.
- **Magic-link email templates** — design/CLAUDE.md notes "default magic-link email is fine for v1; templated email lands in a later phase if it lands at all." Single signal, polish-only, score ~4. Revisit if brand impression on auth flow becomes a critique finding.
- **Session expiry UX** — Supabase browser client auto-refreshes JWTs; no evidence of a real gap. Score ~2.5: revisit if production reports of silent save failures emerge.
- **Prompt curation tooling** — the seed list is now 101 entries (a6d0d49); editorial work, not a development phase. Revisit if content quality becomes a critique finding.
- **Historical log navigation (pre-60-day entries)** — users with >60 days of practice have no UI path to older entries; URL access works but is not discoverable. Conflicts with bearings.md standing decision ("Pagination: never on /log"). Score ~3.5; needs user call if the standing decision should be revisited for long-term practitioners.
