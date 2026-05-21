# Ember — phase candidates

> Last pass: 2026-05-20 at commit dacf70c
> Pass count: 3

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

## Pending

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
- **E2e authenticated flow coverage** — all Playwright specs test only the anonymous/redirect state; `today.spec.ts` verifies the redirect to `/signin` but not the actual write flow. Score ~3.0: real gap, but fixing it requires either hermetic Supabase test credentials or mocked auth tokens (complex setup). Revisit if a regression in the authenticated path ships undetected.
- **Session expiry UX** — Supabase browser client auto-refreshes JWTs; no evidence of a real gap. Score ~2.5: revisit if production reports of silent save failures emerge.
- **Prompt curation tooling** — the seed list is now 101 entries (a6d0d49); editorial work, not a development phase. Revisit if content quality becomes a critique finding.
