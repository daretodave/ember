# Ember — phase candidates

> Last pass: 2026-05-24 at commit 94021f4
> Pass count: 17

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

## Pending

### [ ] [score 5.0] Voice coherence audit pass — address pending copy inconsistencies and document voice rules

- proposed: 2026-05-23, expand pass 8; signals updated pass 9; signals updated pass 10; scope item 1 resolved pass 11; signals updated pass 13; scope item 8 resolved pass 13; scope items 7 and 10 resolved pass 15; signals updated pass 16
- source signals:
  - critique pass 7 (commit 69def1e): 4 pending LOW voice/copy findings across 4 pages — "not yet saved" reads as error before typing (/today), heading register inconsistency between noun phrase and declarative sentence (/), coaching tone in empty-state copy (/log), no destination context after email submission (/signin)
  - critique pass 8 (commit 5abb81e): 3 additional pending LOW voice/copy findings — stat line drops unit noun for published count (/log), footer "made for adults" frames by exclusion (/), display name placeholder uses second-person "you" (/settings)
  - critique pass 9 (commit 8c8a92d): 1 additional pending LOW voice/consistency finding — focus button has no title attribute while adjacent publish button does (/today); violates the voice guide rule "hover/tooltip copy is a complete sentence with a period"
  - critique pass 10 (commit 84e0c49): 3 additional pending LOW voice/copy findings — publish toggle tooltip uses imperative form (/today), "/u/your-handle" literal in username hint reads as unfinished (/settings), personalized prompt gives no fallback signal for users with no entries (/settings)
  - critique pass 11 (commit 2b4efe6): 3 additional pending LOW findings evaluated — "sign in to start" CTA label conflicts with "today's prompt is waiting" framing (/); /signin meta description identical to landing page (SEO); /settings meta description omits "prompt variety" section (SEO); the two meta description findings are adjacent SEO copy changes that fit the scope of this phase as items 13–14
  - iterate pattern: all 11 remaining pending findings score 2.7 or below in AUDIT.md, below the 3.0 iterate threshold; they will consume 11+ cloud ticks shipping individually with no documentation preventing recurrence; the cluster has grown across 5 consecutive critique passes
- rationale: the 11 remaining pending critique findings share a root — the product's copy voice is inconsistent across pages in small but accumulated ways. five critique passes have surfaced findings in this category and the signal cluster is growing (4 → 7 → 8 → 7 after one resolved → 9 after three new, one resolved → 11 after three new from pass 11, four already resolved). fixing them individually via iterate is feasible but slow and leaves no documentation preventing new page authors from repeating the same patterns. a single focused phase ships all remaining fixes and writes a voice reference section in design/CLAUDE.md capturing the specific rules (register consistency, "here is something to attend to" framing, no coaching imperatives, unit-noun consistency, value-first audience framing, tooltip completeness, meta description differentiation per page) — the same structural closure the CSS lint gate provides for typography.
- proposed scope: 1 phase — (1) / heading register: align "the next seven days." and "this is what arrives each morning." to the same syntactic form; (2) /log empty-state: replace "today is a good place to start." with observation framing; (3) /signin: add one post-submit sentence with destination context ("the link opens today's prompt."); (4) /log stat line: change "0 published." to "0 days published." for unit-noun consistency — resolved via iterate (2ebac0d); (5) / footer: reframe "made for adults who want a low-friction ritual." as a value statement; (6) /settings display name placeholder: replace "how you appear on your public profile" with neutral "visible name on your public profile"; (7) /settings "Claude" vendor name: replace "generated for you by Claude" with "generated from your recent entries" — resolved via iterate (73ce8ed); (8) /today focus button: add `title="enters a distraction-free writing view."` — resolved via iterate (7a90a47); (9) add a "Copy and voice rules" section to design/CLAUDE.md documenting register, framing, unit-noun, tooltip-completeness, audience-framing, and meta-description-differentiation conventions; (10) /today publish toggle tooltip: change imperative "make this entry visible on your public profile." to declarative "this entry will appear on your public profile." — resolved via iterate (1ec04e5); (11) /settings username hint: change "/u/your-handle" to "/u/username" for a clearly illustrative example; (12) /settings personalized prompt: add fallback qualifier ("falls back to a standard prompt until entries exist."); (13) /signin meta description: replace shared tagline with sign-in-specific copy ("sign in to ember with a link sent to your email — no password required."); (14) /settings meta description: add "prompt variety" to the page description ("display name, timezone, prompt variety, public username"); (15) / CTA label: change "sign in to start" to "sign in" to match nav and remove implication of a new beginning
- note: scope item "/today idle save-state" resolved via iterate (a044cd0, 2026-05-24) before phase promotion; scope item 4 (/log stat line unit noun) resolved via iterate (2ebac0d, 2026-05-24) before phase promotion; scope item 7 (/settings Claude vendor name) resolved via iterate (73ce8ed, 2026-05-24) before phase promotion; scope item 8 (/today focus button title) resolved via iterate (7a90a47, 2026-05-24) before phase promotion; scope item 10 (/today publish toggle tooltip imperative → declarative) resolved via iterate (1ec04e5, 2026-05-24) before phase promotion; scope items 13-15 added at expand pass 16 from critique pass 11 signals
- estimated phases: 1
- conflicts: none — copy-only changes plus documentation; no new routes, no schema changes

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
- note (2026-05-23): phase 20 (searchable timezone combobox) also shipped with no new authenticated e2e coverage — the combobox open/filter/select flow is untested in e2e. Risk surface continues to grow.
- note (2026-05-24): 6 additional iterate fixes shipped since phase 20 (a11y, force-dynamic, save indicator); no new e2e specs added. A regression in the authenticated surfaces (write flow, focus mode, offline draft, timezone combobox) would go undetected through all gates.
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
- [score 7.0] Settings UX — searchable timezone combobox → **Phase 20** (promoted via `/oversight` 2026-05-23)

## Resolved

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
