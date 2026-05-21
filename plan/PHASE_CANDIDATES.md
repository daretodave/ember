# Ember — phase candidates

> Last pass: 2026-05-21 at commit 642834d
> Pass count: 4

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

## Pending

### [ ] [score 8.5] Voice + typography normalisation pass

- proposed: 2026-05-21, expand pass 4
- source signals:
  - CRITIQUE.md pass 1 (commit c69173d): [MED] /today — "YOUR RESPONSE" and "YOUR LAST SEVEN DAYS" in full uppercase, violating lower-case typographic voice
  - CRITIQUE.md pass 2 (commit 1ade924): [MED] /settings — "DISPLAY NAME" and "TIMEZONE" labels in full uppercase
  - CRITIQUE.md pass 2 (commit 1ade924): [MED] /log — H1 "YOUR PAST SIXTY DAYS" is all-caps
  - CRITIQUE.md pass 2 (commit 1ade924): [HIGH] / — "THE BRAND IS THE PRACTICE RENDERED" internal design copy surfaced to users
- rationale: 4 pending critique findings across 3 authenticated routes (plus the landing page) all share the same root: uppercase text literals and/or CSS text-transform that conflicts with bearings.md voice rule ("lower-case where typographic restraint reads better"). Iterate will nibble at these one tick at a time; a single normalisation pass resolves the cluster, brings the whole app into voice alignment, and closes 4+ pending findings without shipping multiple tiny commits.
- proposed scope: 1 phase — audit every page for uppercase text literals and CSS text-transform; normalise to lower-case where the voice rule applies; update design/CLAUDE.md with an explicit typography-case rule so future pages start correct; add an axe-core or custom lint check if feasible
- estimated phases: 1
- conflicts: none — aligns the implementation with the existing voice rule in bearings.md rather than introducing a new constraint

### [ ] [score 7.0] Settings UX — searchable timezone combobox

- proposed: 2026-05-21, expand pass 4
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
- source signals:
  - commit pattern: 19 phases shipped; all Playwright specs still test only anonymous/redirect state — `today.spec.ts` verifies redirect to `/signin` but never the actual write flow
  - phase 19 (PWA + offline): added service-worker path and IndexedDB draft persistence; these paths have zero e2e coverage
- rationale: with all 19 phases shipped, the gap between what the app does and what e2e verifies has grown significantly. A regression in the authenticated write flow (entry save, edit, task toggle, focus mode, offline draft sync) would ship undetected through all gates. The complexity concern (needing auth mocking or test credentials) remains but is outweighed by the risk surface now. The loop can address this by using Supabase test-role credentials already in CI secrets. Score re-evaluated from 3.0 to 4.5.
- proposed scope: 1 phase — add Playwright specs that sign in with a test account (Supabase test-role or a dedicated test user), exercise the core write flow on /today, verify entry persistence on /log, and verify the edit flow on /log/[date]; optionally cover the offline draft path with network-intercept stubs
- estimated phases: 1 (may require provisioning a test-user seed in the CI environment)
- conflicts: none — test-only addition

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

### [score 4.2] Supabase migration CI automation — not promoted

- proposed: 2026-05-18, expand pass 2
- resolution: re-investigated via `/oversight` 2026-05-21 and **not promoted** — the work it asks for already exists. The candidate's premise (`migrate.mjs` falls to path 4; one missing secret blocks automation) is outdated. The `march.yml` workflow's "Apply Supabase migrations" step pushes pending migrations every tick via the IPv4 session pooler, using `SUPABASE_PROJECT_ID` + `SUPABASE_DB_PASSWORD` (GitHub secrets) and the `SUPABASE_REGION` variable — no `SUPABASE_ACCESS_TOKEN` needed, and it does not call `migrate.mjs` at all. A REST probe confirmed the `entries` table exists in production. Promoting this would have created a no-op phase.

## Considered (below threshold)

- **Entry search** — spec says "Search (defer)"; single signal, moderate complexity (-1), estimated 1–2 phases. Score ~4. Revisit if AUDIT or user issues surface demand.
- **Magic-link email templates** — design/CLAUDE.md notes "default magic-link email is fine for v1; templated email lands in a later phase if it lands at all." Single signal, polish-only, score ~4. Revisit if brand impression on auth flow becomes a critique finding.
- **Session expiry UX** — Supabase browser client auto-refreshes JWTs; no evidence of a real gap. Score ~2.5: revisit if production reports of silent save failures emerge.
- **Prompt curation tooling** — the seed list is now 101 entries (a6d0d49); editorial work, not a development phase. Revisit if content quality becomes a critique finding.
