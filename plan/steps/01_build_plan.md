# Ember — build plan

> Phase-by-phase status. The next `[ ]` row is what ships
> next. `/ship-a-phase` reads this; `/march` dispatches off
> it.

## Status (at-a-glance)

- [x] Phase 0 — Bootstrap (external services, deploys, cloud loop) — via `/bootstrap`
- [x] Phase 1 — Substrate (Next.js app skeleton, Supabase client wiring, design tokens stub)
- [x] Phase 2 — Visual system commission (palette, type, mosaic tile shape) — design artifact
- [x] Phase 3 — Anonymous landing + 7-day preview
- [x] Phase 4 — Magic-link auth (Supabase Auth, `/signin`, session middleware) — 08eb4a4
- [x] Phase 5 — Today + entry write (`/today`, prompt curation, entry model) — 43a4594
- [x] Phase 6 — Log + mosaic (`/log`, `/log/[date]`, 60-day mosaic component) — 1467ac6
- [x] Phase 7 — Settings (`/settings`, timezone, display name, public username) — 863114c
- [x] Phase 8 — Public profile (`/u/[username]`, `/u/[username]/[date]`, publish toggle) — fc0ccba
- [x] Phase 9 — Polish (mobile reflow, empty states, error pages) — e82b631
- [x] Phase 10 — A11y pass (keyboard nav, aria, contrast) — 32a8c44
- [x] Phase 11 — Perf pass (RSC streaming, image opt, bundle audit) — f9d8859
- [x] Phase 12 — Prompt rotation v1.5 (Anthropic-personalized prompts opt-in)

<!-- Phases 13-19 promoted via /oversight 2026-05-21. Phases 13-16
     from plan/PHASE_CANDIDATES.md; phases 17-19 are oversight-authored
     experiments (the user asked for "some cool features"). Briefs can
     be refined per-phase with /plan-a-phase before each ships. -->
- [x] Phase 13 — Entry editing (edit past entries from `/log/[date]`) — 50c69ea
- [x] Phase 14 — Brand assets (favicon, OG image, social card, manifest) — 08c5b37
- [x] Phase 15 — A11y regression gate (axe-core in the Playwright suite) — 479866b
- [ ] Phase 16 — Rate limiting (magic-link send + entry write guards)
- [ ] Phase 17 — On this day (echo a past entry on `/today`)
- [ ] Phase 18 — Focus mode (distraction-free writing surface on `/today`)
- [ ] Phase 19 — Installable PWA + offline draft persistence

## Per-phase scope

### Phase 0 — Bootstrap

Run `/bootstrap` to provision GitHub repo, Vercel project,
Supabase project, propagate all secrets, install cloud-loop
workflow + Claude OAuth + ACTIONS_PAT, watch first deploy go
green. End state: pnpm dev works locally, /march is scheduled.

Brief: see `../setup/00_files.md` for the service index and
`../../nexus/customization/bootstrap-automation.md` for the
contract.

### Phase 1 — Substrate

Next.js 15 + App Router skeleton; Tailwind + design tokens
stub; Supabase server + browser clients; root layout; basic
404; placeholder `/`; verify gate green; hermetic e2e walks
`/` and returns 200.

### Phase 2 — Visual system commission

Drop a `claude-design.prompt.md` and commission the palette,
type pairings, mosaic tile aesthetics from a fresh agent.
Outputs: `design/tokens.css`, `design/Ember · Brand.html`
(brand mark + mosaic spec), `design/CLAUDE.md` (visual law).
No production code changes in this phase.

### Phase 3 — Anonymous landing

`/` renders the brand mark + tagline + a 7-day prompt
preview (read-only). Sticky CTA: "Sign in to start."

### Phase 4 — Magic-link auth

Supabase Auth integrated; `/signin` page; session middleware;
sign-out endpoint. No persistence yet; just round-trip.

### Phase 5 — Today + entry write

`/today` renders today's prompt + task. Entry form posts to
Supabase. Deterministic date-based prompt selection from a
seed list of ~100 prompts in `content/prompts.json`.

### Phase 6 — Log + mosaic

`/log` renders the 60-day mosaic. Each tile links to
`/log/[date]`. Single entry view is read-only; edit is a
v1.5 stretch.

### Phase 7 — Settings

`/settings` for timezone, display name, public username.

### Phase 8 — Public profile

`/u/[username]` + `/u/[username]/[date]`. Per-entry publish
toggle on the entry view.

### Phase 9-11 — Polish / A11y / Perf

Three focused passes. Each is a single phase to keep them
from sliding.

### Phase 12 — Prompt rotation v1.5

Opt-in personalized prompts via Anthropic API. Behind a
settings toggle ("variety: standard / personalized").

### Phase 13 — Entry editing

Edit endpoint + UI on `/log/[date]`. The single-entry view
gains an edit affordance: a textarea pre-filled with the
current body, save replaces the content and updates an
`updated_at` timestamp. Edit is allowed only for the entry's
author; a published entry stays editable and its public view
reflects the latest text. No new URL. Closes the "v1.5
stretch" deferred across spec, `design/INDEX.md`, and the
phase 6 brief.

### Phase 14 — Brand assets

Render the demand-pull asset layer named in
`design/CLAUDE.md`: favicon (16/32/48px), OG image
(1200×630, mosaic-tile grid on warm cream per the design
tokens), Twitter summary card, and a web app manifest.
Delegate rendering to the brander sub-agent against the
mosaic primitive. Wire the OG/twitter image references into
root layout + public-profile metadata (the metadata blocks
already exist from earlier SEO findings). No app logic
change beyond metadata.

### Phase 15 — A11y regression gate

Add `@axe-core/playwright` to the existing e2e suite.
Configure axe scans on `/`, `/signin`, `/today`, `/log`,
`/settings`; fail the verify gate on WCAG 2.1 AA violations.
Test-only addition — no app code changes. Locks in the 11+
a11y fixes that landed post-Phase-10 so the later UI phases
(17, 18) cannot silently regress them.

### Phase 16 — Rate limiting

Implement the anti-abuse limits already specified in
`bearings.md`: magic-link send capped at 3 per email per
24h; entry write capped at 10 per user per UTC day (a soft
ceiling — entry length stays unbounded). Server-side
enforcement in `/api/auth/signin` and `/api/entries`.
Storage: a `rate_limits` table or a count against existing
rows; no new URL family. Return a clear error code per the
error-state standing decision.

### Phase 17 — On this day

On `/today`, below the entry surface, surface a single quiet
reflection line when the user has a prior entry on the same
calendar day in an earlier month or year: "a month ago, you
wrote —" with the opening clause of that entry, linking to
its `/log/[date]`. Voice per `bearings.md` (lower-case, no
exclamation, "here is something to attend to" framing). No
new route, no new graphic, no analytics. Renders nothing
when there is no prior same-day entry.

### Phase 18 — Focus mode

A distraction-free writing surface on `/today`. A quiet
toggle expands the entry textarea to the full viewport and
hides the nav and page chrome, leaving only the prompt, the
textarea, and the subtle save indicator. `Esc` or a low-key
"done" control exits. Honors the motion budget (a single
200ms fade; no other animation). State is ephemeral — not
persisted. Serves the product's core tagline directly.

### Phase 19 — Installable PWA + offline drafts

Make ember installable and resilient on mobile. Add a
service worker and complete the web app manifest from Phase
14 (icons, theme color from design tokens, `display:
standalone`). Offline draft persistence: an in-progress
`/today` entry is held locally (IndexedDB) while offline and
the save retries on reconnect, the save indicator reflecting
"saved locally — will sync". No change to the server model.
Depends on Phase 14's manifest. Experimental — flag if the
offline path proves fragile.
