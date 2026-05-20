# Ember — phase candidates

> Last pass: 2026-05-20 at commit dacf70c
> Pass count: 3

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

## Pending

### [ ] [score 8.0] Entry editing — allow users to edit past entries from /log/[date]

- proposed: 2026-05-16, expand pass 1
- source signals:
  - design/INDEX.md: "there is no edit affordance on this page (a v1.5 stretch per spec)"
  - plan/bearings.md standing decisions: "edit is a v1.5 stretch"
  - phase 6 brief: edit explicitly scoped out with "v1.5 stretch" label
  - commit pattern: 3 independent references pointing at the same gap
- rationale: the app currently writes entries but offers no way to correct them. Every returning user who writes a typo or wants to expand their response hits a hard wall. Three independent references in spec, design, and plan all flag this as the deferred v1.5 feature — real demand from the product's natural use case, not model imagination.
- proposed scope: 1 phase — edit endpoint + UI on /log/[date] (textarea pre-filled, save replaces content, timestamp updated)
- estimated phases: 1
- conflicts: none with spec or URL contract; the edit surface is on an existing route

### [ ] [score 7.0] Brand assets — favicon, OG image, social card

- proposed: 2026-05-16, expand pass 1
- source signals:
  - design/CLAUDE.md: "Favicon, OG image, social cards. These are the demand-pull asset layer. A future /ship-asset slice renders them against the mosaic primitive, but they don't ship in v1."
  - design/INDEX.md: references the brander sub-agent approach for a future slice
  - every shared ember URL currently surfaces a blank/generic preview card
- rationale: two independent design-folder references name this explicitly as deferred-from-v1 demand-pull work. A shared ember link shows a blank preview on every social/messaging platform — the brand mark that took a full phase to commission is invisible at the key moment. The brander sub-agent is purpose-built for this; the work is bounded.
- proposed scope: 1 phase — favicon (16/32/48px), OG image (1200×630, mosaic tile grid on cream), Twitter card, manifest.json entry
- estimated phases: 1
- conflicts: none — design/CLAUDE.md explicitly scopes this as a future asset layer

### [ ] [score 5.0] Data export — download entries as JSON or Markdown

- proposed: 2026-05-16, expand pass 1
- source signals:
  - spec.md: "Exportable data (defer to v1.5)"
- rationale: spec named this as deferred to v1.5 from the outset. Users who have been practicing for weeks have no mechanism to back up or port their writing. Single signal source (spec), but the signal is explicit and user-protective. Scores below the other two because it serves a subset of users and the spec deferred it for good reason (v1 stability first).
- proposed scope: 1 phase — GET /api/export route returning JSON (entries + prompts + dates); optional ?format=md for Markdown; settings page "export your data" link
- estimated phases: 1
- conflicts: none with spec or URL contract (new route under /api/)

### [ ] [score 5.2] Rate limiting — implement anti-abuse guards on magic-link send and entry write

- proposed: 2026-05-18, expand pass 2
- source signals:
  - plan/bearings.md "Anti-abuse posture": "Rate limit on magic-link send: 3 per email per 24h" and "Rate limit on entry write: 10 per user per day" — explicit standing decisions, not aspirational
  - code audit: `src/app/api/auth/signin/route.ts` passes directly to `supabase.auth.signInWithOtp` with no rate-limit check
  - code audit: `src/app/api/entries/route.ts` has auth check but no write-rate guard
- rationale: two independent API routes share the same gap — the bearings.md anti-abuse rules are specified as hard product decisions but have never been implemented. Magic-link flooding allows infinite login-email spam to any address. Entry write has no server-side throttle. Both are single-endpoint fixes with no schema migration required.
- proposed scope: 1 phase — in-memory or Supabase-backed rate limiter for `/api/auth/signin` (track email + timestamp in a `rate_limits` table or Vercel KV), entry write guard counts writes per user per UTC day (query against `entries` table). No new URL routes required.
- estimated phases: 1
- conflicts: none with spec or URL contract; implementing what bearings.md already requires

### [ ] [score 4.2] Supabase migration CI automation — unblock DB schema evolution from the cloud loop

- proposed: 2026-05-18, expand pass 2
- source signals:
  - user-issue #6: "entries table missing from Supabase — migrations not applied" (DB completely unusable until migrations run)
  - ci commit c0fb29f: "ci: apply supabase migrations in march before the tick runs" — the loop already tried to automate this but `migrate.mjs` falls to path 4 (print SQL + instructions) because `SUPABASE_ACCESS_TOKEN` is not provisioned
  - `scripts/migrate.mjs` path 1 comment: "SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_ID → npx supabase db push (linked)" — the code for automated push exists, gated on a missing secret
- rationale: every future phase that touches the DB schema requires the user to manually paste SQL into the Supabase console. Three independent signals converge on the same root cause: a single missing GitHub Actions secret. Once `SUPABASE_ACCESS_TOKEN` is added as a repo secret and `SUPABASE_PROJECT_ID` is set, `scripts/migrate.mjs` path 1 runs automatically on every cloud march tick. No code changes needed — just secret provisioning + a runbook update in `setup/03_supabase.md`.
- proposed scope: 1 phase — provision `SUPABASE_ACCESS_TOKEN` (Supabase Management API token, read-only to DB for migration push), add `SUPABASE_PROJECT_ID` to GitHub Actions secrets, verify `pnpm db:migrate` succeeds in CI, update runbook
- estimated phases: 1 (but requires a user action to generate the access token)
- conflicts: none with spec or URL contract; this is infrastructure, not a product feature

### [ ] [score 5.5] Automated a11y regression testing — axe-core integration in Playwright

- proposed: 2026-05-20, expand pass 3
- source signals:
  - commit-pattern (Signal G): 10+ a11y `audit:` + `a11y:` commits landed after the dedicated Phase 10 a11y pass, covering TodayEntry, SettingsForm, LogMosaic, log pages, SigninPage, and DayStrip — all found only by manual iterate audit
  - AUDIT findings (Signal A): plan/AUDIT.md resolved 11 a11y findings post-Phase-10 spanning role="alert", aria-live, aria-label, heading structure, and label association; no automated gate caught any of them before they shipped
- rationale: Phase 10 was explicitly the a11y pass, yet 11+ issues survived into production and required a manual iterate cycle to surface. Without automated a11y testing, future phases (entry editing, account deletion, etc.) will re-introduce the same classes of violations and catch them only via post-ship audit. Adding `@axe-core/playwright` to the existing e2e suite creates a permanent regression gate that protects the entire a11y investment.
- proposed scope: 1 phase — add `@axe-core/playwright`; configure axe scans on `/`, `/signin`, `/today`, `/log`, `/settings`; fail on WCAG 2.1 AA violations; test-only addition (no app code changes)
- estimated phases: 1
- conflicts: none — extends existing Playwright suite; no new routes; no code changes required

### [ ] [score 4.5] Account self-service — delete account and all associated data

- proposed: 2026-05-20, expand pass 3
- source signals:
  - architectural gap: the app accumulates personal user data (text entries, profile, settings) in Supabase with no user-accessible deletion mechanism; users who want to leave can sign out but their data persists indefinitely
  - spec.md gap: the v1 spec defines all user routes but omits account lifecycle management entirely — neither explicitly deferred to v1.5 nor scoped as a non-goal, which is unusual for a data-collecting app
- rationale: any production app that collects personal data requires a user-accessible deletion path. GDPR Article 17 (right to erasure) applies. The /settings page is the natural home. Scope is bounded: one new API route + a confirmation UI — no new URL family needed.
- proposed scope: 1 phase — `DELETE /api/account` route (cascades delete of entries + profile row, then signs out); confirmation dialog on /settings ("delete my account and all my entries"); verify or add `ON DELETE CASCADE` FK constraints in Supabase migrations if absent
- estimated phases: 1 (may need one minor migration for FK cascade constraints)
- conflicts: none with spec or URL contract; one new API route; /settings page extension only

## Considered (below threshold)

- **Entry search** — spec says "Search (defer)"; single signal, moderate complexity (-1), estimated 1–2 phases. Score ~4. Revisit if AUDIT or user issues surface demand.
- **Magic-link email templates** — design/CLAUDE.md notes "default magic-link email is fine for v1; templated email lands in a later phase if it lands at all." Single signal, polish-only, score ~4. Revisit if brand impression on auth flow becomes a critique finding.
- **E2e authenticated flow coverage** — all Playwright specs test only the anonymous/redirect state; `today.spec.ts` verifies the redirect to `/signin` but not the actual write flow. Score ~3.0: real gap, but fixing it requires either hermetic Supabase test credentials or mocked auth tokens (complex setup). Revisit if a regression in the authenticated path ships undetected.
- **Session expiry UX** — Supabase browser client auto-refreshes JWTs; no evidence of a real gap. Score ~2.5: revisit if production reports of silent save failures emerge.
- **Prompt curation tooling** — the seed list is now 101 entries (a6d0d49); editorial work, not a development phase. Revisit if content quality becomes a critique finding.
