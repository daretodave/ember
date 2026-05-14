# Ember — bearings

> Stack pins, URL contract, standing decisions, hard rules.
> The most-read file in the loop after `01_build_plan.md`.

## Project

- **Name:** ember (lowercase always)
- **Tagline:** ten minutes of intention before the day swallows you
- **Surface:** site
- **Repo:** daretodave/ember
- **Hosting:** Vercel (pdx1)
- **Default branch:** main
- **Default URL (v1):** https://ember-rust-sigma.vercel.app

## Stack (locked — do not re-litigate)

| Layer | Pin |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript strict |
| Styling | Tailwind + design tokens |
| Auth | Supabase Auth (magic-link) |
| DB | Supabase Postgres |
| Hosting | Vercel pdx1 |
| AI (v1.5+) | Anthropic Claude Sonnet 4.6 |
| Package manager | pnpm |
| Lint + format | biome |
| Tests | Vitest + Playwright |

## URL contract

| Route | Auth | Surface |
|---|---|---|
| `/` | none | anonymous landing + 7-day prompt preview |
| `/today` | required | today's prompt + your entry |
| `/log` | required | your past 60 days (mosaic + list) |
| `/log/[date]` | required | a single past entry |
| `/u/[username]` | none | public profile (if user has published entries) |
| `/u/[username]/[date]` | none | a single published entry |
| `/signin` | none | magic-link signin |
| `/settings` | required | timezone, display name, public username |

Locked. Any new URL family requires a phase.

## Voice

Knowledgeable peer. Plain. Slightly bookish. Lower-case where
typographic restraint reads better than capitalization.

- No exclamation points unless quoted
- No second-person imperative copy ("Take a deep breath!")
- Prefer "here is something to attend to" framing
- Hover/tooltip copy is a complete sentence with a period

## Standing decisions

- **Pagination:** never on `/log`. 60 days fit in one mosaic.
  If a user accumulates more, the mosaic stays at 60; older
  is browsed by URL (`/log/2025-08-12`).
- **Sort:** newest first everywhere except the public profile
  (where it's chronological).
- **Empty state for /today:** "Today's prompt is below. Take
  your time."
- **Empty state for /log:** "Your log is empty. Today is a
  good place to start."
- **Error state:** muted card with the literal error code
  and a "try again" link. No friendly euphemisms.
- **Top-N count:** N/A (no rankings, no leaderboards)
- **Empty username on /settings:** fine; no public profile
  is generated.

## External services

| # | Service | Runbook | Last verified |
|---|---|---|---|
| 01 | GitHub | `setup/01_github.md` | — |
| 02 | Vercel | `setup/02_vercel.md` | — |
| 03 | Supabase | `setup/03_supabase.md` | — |

## Auth posture

- **Identity:** Supabase Auth (magic-link only, no
  social, no password)
- **Anonymous read:** allowed on `/`, `/u/<username>`,
  `/u/<username>/<date>`, `/signin`
- **Anonymous write:** never
- **Public username:** opt-in; default is private profile
- **Public entry:** opt-in per entry; default private

## Anti-abuse posture

- No comments / replies → no UGC moderation surface in v1
- No file uploads in v1 (entries are text only)
- Rate limit on magic-link send: 3 per email per 24h
- Rate limit on entry write: 10 per user per day (a soft
  ceiling; entry length is unbounded)

## Hard rules (project-specific, layered on agents.md)

1. **Pull-based always.** No unsolicited email or push.
2. **Per-entry publish is opt-in.** No mass toggle.
3. **No per-user analytics.**
4. **The mosaic is the only graphic.**
5. **No streak-shaming language.**

## Visual / tonal defaults

**Authoritative source: `design/CLAUDE.md` + `design/decisions.md` + `design/tokens.css`.** The design folder wins on conflict; this section is a working summary for orientation only. Any visual change starts in `design/`, then propagates to `src/`.

- Light mode default; dark mode honored by `prefers-color-scheme`
- Type: Source Serif 4 (body + entries + hero, optical-size axis), Inter (chrome only, 14px default), JetBrains Mono (dates only)
- Palette: warm cream paper + warm slate ink + one held-back ember accent. Exact oklch values in `design/tokens.css`.
- Mosaic: 6×10 = 60 days, three tile sizes (16/24/32px) at a 4:1 tile-to-gap ratio. Four states (empty / filled / today / published). **The only graphic in the entire product.**
- Motion budget: 200ms fade-in on first mosaic render (8ms tile stagger) + 1px opacity hover. That is the entire inventory.
- No shadows. No gradients. No icons. No illustrations. No avatars.

See `design/CLAUDE.md` for the visual law; `design/INDEX.md` for a tour of every screen.
