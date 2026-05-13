# Ember

> Ten minutes of intention before the day swallows you.

## What it is

Ember is a calm daily-practice site. Each morning you open
it and find one small prompt and one tiny task. You write
a few sentences in response. Optionally mark the task done.
Move on.

Over weeks, your responses accumulate into a quiet personal
log of the things you've been attending to. The visual
language is a 60-day mosaic of small filled tiles — one per
day — that fills in as you practice.

The pitch in one line: **ten minutes of intention before
the day swallows you.**

## Who it's for

Adults who want a low-friction daily ritual. Not journaling
(too open-ended). Not habit tracking (too quantified).
Something in between — small enough to do without thinking,
structured enough to actually do.

The persona: a person who has tried Day One, Reflectly,
Streaks, etc. and bounced off because every app demanded
either too much or measured too much. Ember asks for one
thing per day and shows one thing back.

## v1 scope (must ship)

- Anonymous landing page with a 7-day preview (read-only)
- Email magic-link auth (Supabase Auth)
- One prompt + one task pair per day, deterministic
  per-date (same content for all users on a given day,
  curated from a seed list)
- Response entry: text area + optional task checkbox
- Streak view: a 60-day mosaic of filled tiles, hover for
  date + first line
- Settings: timezone, display name, optional public username
- Per-entry "publish" toggle (default private)
- Public profile page (only shows published entries)

## v1 deliberately NOT

- Email reminders or push notifications (pull-based:
  forgetting a day doesn't shame you)
- Social graph (followers, likes, comments)
- Multiple practices / categories (one stream only)
- Exportable data (defer to v1.5)
- Search (defer)
- AI-personalized prompts (defer; v1 uses a curated seed
  list, deterministic per-date)

## Voice

Calm, plain, slightly bookish. "Here is something to attend
to" not "Your daily inspiration!" No exclamation points
unless quoted. The brand promise on the landing page is two
sentences; that's the whole pitch.

## Surface

Site (Next.js App Router).

## URL contract

- `/` — anonymous landing + 7-day preview
- `/today` — today's prompt + your entry (auth)
- `/log` — your past 60 days (auth)
- `/log/[date]` — single past entry (auth)
- `/u/[username]` — public profile (anyone)
- `/u/[username]/[date]` — single published entry (anyone)
- `/signin` — magic-link auth
- `/settings` — timezone, display name, public username

## Auth

Required for `/today`, `/log`, `/settings`. Magic-link via
Supabase Auth. Anonymous OK for `/`, `/u/<username>`,
`/u/<username>/<date>`, `/signin`.

## Stack

- Next.js 15 (App Router, RSC)
- TypeScript strict
- Tailwind + design tokens (palette TBD, will commission a
  visual system)
- Supabase Auth + Postgres
- Vercel hosting (pdx1, closest to Supabase us-west-1)
- Anthropic API for prompt rotation (v1.5+)
- pnpm + biome
- Vitest + Playwright

## Hard rules

1. **Pull-based always.** Never push notifications, never
   unsolicited email. If a user wants reminders, they set
   a calendar event themselves.
2. **Public entries require explicit per-entry opt-in.**
   No "make all entries public" mass toggle. Each entry's
   visibility is its own decision.
3. **No per-user analytics.** Page-level aggregates only.
   No "you've practiced N days" pop-ups, no "see how you
   compare" UI.
4. **The mosaic is the brand mark.** It's the only graphic
   in the product. Never replace it with photos,
   illustrations, or per-user avatars.
5. **No streak-shaming.** No "you broke your streak!", no
   guilt-trip copy. The mosaic shows what is, not what
   isn't.
