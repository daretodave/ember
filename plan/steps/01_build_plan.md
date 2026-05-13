# Ember — build plan

> Phase-by-phase status. The next `[ ]` row is what ships
> next. `/ship-a-phase` reads this; `/march` dispatches off
> it.

## Status (at-a-glance)

- [ ] Phase 0 — Bootstrap (external services, deploys, cloud loop) — via `/bootstrap`
- [ ] Phase 1 — Substrate (Next.js app skeleton, Supabase client wiring, design tokens stub)
- [ ] Phase 2 — Visual system commission (palette, type, mosaic tile shape) — design artifact
- [ ] Phase 3 — Anonymous landing + 7-day preview
- [ ] Phase 4 — Magic-link auth (Supabase Auth, `/signin`, session middleware)
- [ ] Phase 5 — Today + entry write (`/today`, prompt curation, entry model)
- [ ] Phase 6 — Log + mosaic (`/log`, `/log/[date]`, 60-day mosaic component)
- [ ] Phase 7 — Settings (`/settings`, timezone, display name, public username)
- [ ] Phase 8 — Public profile (`/u/[username]`, `/u/[username]/[date]`, publish toggle)
- [ ] Phase 9 — Polish (mobile reflow, empty states, error pages)
- [ ] Phase 10 — A11y pass (keyboard nav, aria, contrast)
- [ ] Phase 11 — Perf pass (RSC streaming, image opt, bundle audit)
- [ ] Phase 12 — Prompt rotation v1.5 (Anthropic-personalized prompts opt-in)

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
