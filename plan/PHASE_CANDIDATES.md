# Ember — phase candidates

> Last pass: 2026-05-23 at commit 5250734
> Pass count: 7

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

## Pending

### [ ] [score 7.0] CSS typography lint gate — prevent text-transform:uppercase regressions

- proposed: 2026-05-22, expand pass 5
- source signals:
  - commit pattern: 8 of 20 commits since expand pass 4 are audit/fix pairs removing `text-transform: uppercase` from CSS modules (cdcd1ff, d419779, 055c339, 1cfcd07, and audit commits for each); 25% of recent iterate capacity spent on the same mechanical pattern
  - critique pattern: typography-voice findings appeared in all 3 critique passes (pass 1: /today section headers; pass 2: /settings, /log, /; pass 3: /today date heading, FOCUS/DONE buttons, /signin email label) — the pattern keeps recurring across new CSS modules
  - active instances: `grep -rn "text-transform.*uppercase" src/` today returns 3 hits — `page.module.css:.previewMarkLabel` (orphaned selector, element removed at 0c1d673), `u/[username]/page.module.css:.entryDate`, `log/[date]/page.module.css:.entryLabel` — confirming the fix passes addressed specific named selectors but not all instances in those files
- rationale: the loop's iterate cycle has been spending significant capacity on the same mechanical fix (remove text-transform: uppercase from CSS module) page by page. Each fix is correct but leaves no guard. 3 instances remain today despite multiple dedicated passes. A one-phase lint gate closes the cycle permanently: no new CSS module can silently reintroduce the pattern. Cost is one phase; benefit is elimination of an ongoing iterate overhead category.
- note (2026-05-23): all 3 previously active instances (`.previewMarkLabel`, `.entryDate`, `.entryLabel`) have been removed by iterate between expand passes 5 and 6 (commits 055c339, 3795494). `grep -rn "text-transform.*uppercase" src/` now returns 0 hits. Proposed scope reduced to: (1) add the grep lint step to the verify gate; (2) document the ban in `design/CLAUDE.md`. The cleanup component of the original scope is done.
- proposed scope: 1 phase — (1) add a `grep -rn "text-transform.*uppercase" src/` step to the verify gate that exits non-zero if any match is found; (2) document the ban in `design/CLAUDE.md` so new page authors know not to use it
- estimated phases: 1
- conflicts: none — enforces an existing voice constraint; no new design decision required

### [ ] [score 7.0] Settings UX — searchable timezone combobox

- proposed: 2026-05-21, expand pass 4
- note (2026-05-22): `<optgroup>` grouping by region was added at 8d43d1b (iterate), addressing the minimum viable fix. The full combobox (type-to-filter) was not shipped. Candidate remains valid; urgency reduced slightly since the worst-case mobile UX is improved.
- source signals:
  - CRITIQUE.md pass 1 (commit c69173d): [HIGH] /settings — timezone selector is a flat unfiltered list of 200+ tz strings; effectively unusable on mobile
- rationale: a flat `<select>` with 200+ raw tz database names (Africa/Abidjan, America/Indiana/Knox…) is a known UX anti-pattern on mobile. This is the single highest-friction point in the settings flow — users who need to set their timezone correctly (critical for prompt date alignment) face a scroll-through-hundreds experience with no shortcut. Replacing with a searchable combobox (type to filter, grouped by region or country) makes the field usable on mobile and faster on desktop. Scope is bounded to one settings field; no schema changes required.
- proposed scope: 1 phase — replace the `<select>` timezone field in SettingsForm with a searchable combobox component; group entries by region with `<optgroup>` as a minimum, or implement a type-to-filter combobox; keep the underlying value format (IANA tz string) unchanged
- estimated phases: 1 (may need a small third-party combobox library or a bespoke accessible component)
- conflicts: none with spec or URL contract; /settings page extension only; no new route

### [ ] [score 5.0] Data export — download entries as JSON or Markdown

- proposed: 2026-05-16, expand pass 1
- source signals:
  - spec.md: "Exportable data (defer to v1.5)"
- rationale: spec named this as deferred to v1.5 from the outset. Users who have been practicing for weeks have no mechanism to back up or port their writing. Single signal source (spec), but the signal is explicit and user-protective. Scores below the other two because it serves a subset of users and the spec deferred it for good reason (v1 stability first).
- proposed scope: 1 phase — GET /api/export route returning JSON (entries + prompts + dates); optional ?format=md for Markdown; settings page "export your data" link
- estimated phases: 1
- conflicts: none with spec or URL contract (new route under /api/)

### [ ] [score 4.5] Account self-service — delete account and all associated data

- proposed: 2026-05-20, expand pass 3
- source signals:
  - architectural gap: the app accumulates personal user data (text entries, profile, settings) in Supabase with no user-accessible deletion mechanism; users who want to leave can sign out but their data persists indefinitely
  - spec.md gap: the v1 spec defines all user routes but omits account lifecycle management entirely — neither explicitly deferred to v1.5 nor scoped as a non-goal, which is unusual for a data-collecting app
- rationale: any production app that collects personal data requires a user-accessible deletion path. GDPR Article 17 (right to erasure) applies. The /settings page is the natural home. Scope is bounded: one new API route + a confirmation UI — no new URL family needed.
- proposed scope: 1 phase — `DELETE /api/account` route (cascades delete of entries + profile row, then signs out); confirmation dialog on /settings ("delete my account and all my entries"); verify or add `ON DELETE CASCADE` FK constraints in Supabase migrations if absent
- estimated phases: 1 (may need one minor migration for FK cascade constraints)
- conflicts: none with spec or URL contract; one new API route; /settings page extension only

### [ ] [score 4.5] E2e authenticated flow coverage

- proposed: 2026-05-21, expand pass 4 (re-evaluated from "Considered below threshold", was score 3.0)
- note (2026-05-22): phases 17–19 have now shipped, adding substantial uncovered surface: on-this-day rendering logic (/today), focus-mode overlay DOM manipulation and Esc key handling (/today), and PWA offline draft persistence (IndexedDB, service-worker intercept, sync-on-reconnect). Risk surface has grown since this candidate was filed; score should be treated as 4.5–5.0.
- source signals:
  - commit pattern: 19 phases shipped; all Playwright specs still test only anonymous/redirect state — `today.spec.ts` verifies redirect to `/signin` but never the actual write flow
  - phase 19 (PWA + offline): added service-worker path and IndexedDB draft persistence; these paths have zero e2e coverage
- rationale: with all 19 phases shipped, the gap between what the app does and what e2e verifies has grown significantly. A regression in the authenticated write flow (entry save, edit, task toggle, focus mode, offline draft sync) would ship undetected through all gates. The complexity concern (needing auth mocking or test credentials) remains but is outweighed by the risk surface now. The loop can address this by using Supabase test-role credentials already in CI secrets. Score re-evaluated from 3.0 to 4.5.
- proposed scope: 1 phase — add Playwright specs that sign in with a test account (Supabase test-role or a dedicated test user), exercise the core write flow on /today, verify entry persistence on /log, and verify the edit flow on /log/[date]; optionally cover the offline draft path with network-intercept stubs
- estimated phases: 1 (may require provisioning a test-user seed in the CI environment)
- conflicts: none — test-only addition


### [ ] [score 6.0] SEO completeness for public profiles — canonical URL tags and dynamic sitemap

- proposed: 2026-05-23, expand pass 7
- source signals:
  - iterate audit 2026-05-23: `/u/[username]` and `/u/[username]/[date]` generateMetadata functions set openGraph.url but omit `alternates.canonical` — Next.js emits no `<link rel="canonical">` for the primary share targets
  - iterate audit 2026-05-23: `src/app/sitemap.ts` returns a static array covering only `/` and `/signin`; public profiles are the main externally-linked content and are absent from the sitemap entirely
- rationale: public profiles and published entries are the primary sharing surface — the only pages ember users send to others. both SEO gaps (no canonical, absent from sitemap) affect these pages specifically. individually each fix scores below the iterate 3.0 threshold (canonical: 2.7; sitemap: 2.5), but they address the same surface, have the same owner, and are best shipped together. the sitemap item in particular requires a Supabase query at build time — more than a one-line fix. bundled into one small phase, they close the SEO gap for the public-facing layer with minimal scope.
- proposed scope: 1 phase — (1) add `alternates: { canonical: url }` to `generateMetadata` in `src/app/u/[username]/page.tsx` and `src/app/u/[username]/[date]/page.tsx`; (2) make `sitemap.ts` async, query Supabase `profiles` table for rows with non-null `username`, add `/u/${username}` for each (and optionally published entries); add error handling so a DB failure falls back to the static list gracefully
- estimated phases: 1
- conflicts: none — metadata-only change for (1); sitemap is already a Next.js App Router route file for (2); no new URL family required

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

## Resolved

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
