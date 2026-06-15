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
- [x] Phase 16 — Rate limiting (magic-link send + entry write guards) — 42a8f96
- [x] Phase 17 — On this day (echo a past entry on `/today`) — ff5435a
- [x] Phase 18 — Focus mode (distraction-free writing surface on `/today`) — 77398f5
- [x] Phase 19 — Installable PWA + offline draft persistence — a9e1729

<!-- Phase 20 promoted via /oversight 2026-05-23 from
     plan/PHASE_CANDIDATES.md [score 7.0]. Build plan was exhausted at
     phase 19; user chose to drain the top-scored pending candidate. -->
- [x] Phase 20 — Searchable timezone combobox on `/settings` — b1656b7

<!-- Phases 21-25 promoted via /oversight 2026-06-11 from
     plan/PHASE_CANDIDATES.md (build plan exhausted at phase 20; all
     pending audit findings sub-threshold; loop starved). Phases 26-28
     are oversight-authored experiments per the user's standing
     preference for feature experiments. Briefs can be refined
     per-phase with /plan-a-phase before each ships. -->
- [x] Phase 21 — Content voice alignment (rewrite prompts.json task copy to participial form) — 25965a8
- [x] Phase 22 — Voice coherence sweep (remaining stalled copy scope items) — e69536f
- [x] Phase 23 — Data export (entries as JSON / Markdown via `/api/export`) — e7b86c1
- [x] Phase 24 — Account deletion (self-service delete account + all data) — 909071e
- [x] Phase 25 — Loop issue mirroring (restore `scripts/loop-issue.mjs`) — 836db0c
- [x] Phase 26 — Evening theme (time-aware dark palette) — 7e175dd
- [x] Phase 27 — Month in review (quiet monthly recap on `/log`) — bf9d39d
- [x] Phase 28 — Shareable entry card (dynamic OG image for public entries) — 94db9f2

<!-- Phases 29-39 promoted/authored via /oversight 2026-06-14. Build plan
     was exhausted at phase 28 and the audit fully drained; the only
     remaining work was sub-threshold LOW a11y/voice polish. Per the user's
     standing preference for feature experiments over audit churn, this set
     promotes the two strongest pending /expand candidates (29-30) and
     authors nine feature experiments (31-39). Briefs can be refined
     per-phase with /plan-a-phase before each ships. -->
- [x] Phase 29 — E2e authenticated flow coverage (sign-in, write, edit, persist) — 83ec0bf
- [x] Phase 30 — Authentication funnel UX clarity (`/signin` pre/post-submit states) — 4cfb1d8
- [x] Phase 31 — Entry search (full-text search across past entries) — bd77eca
- [x] Phase 32 — Year in review (quiet annual recap on `/log`) — 1d48c85
- [ ] Phase 33 — Daily reminder (opt-in email nudge to write)
- [ ] Phase 34 — One-word check-in (optional per-entry mood/weather word)
- [ ] Phase 35 — Entry tags + themed browsing
- [ ] Phase 36 — Markdown rendering in entries (plain storage, rendered view)
- [ ] Phase 37 — Weekly reflection (opt-in Anthropic synthesis of the week)
- [ ] Phase 38 — Prompt packs (selectable themed prompt collections)
- [ ] Phase 39 — Bound export ("your book" — typeset printable compilation)

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

### Phase 20 — Searchable timezone combobox

Replace the flat `<select>` on `/settings` (200+ raw IANA
tz strings, currently grouped by region via `<optgroup>` at
8d43d1b) with a searchable combobox. Type to filter; keyboard-
navigable; ARIA combobox role + listbox semantics; honors the
existing optgroup region structure when no query is entered.
The underlying value format (IANA tz string) is unchanged so
the API contract and stored data are untouched — UI swap only.
Mobile is the priority surface; the type-to-filter affordance
removes the scroll-through-hundreds anti-pattern. Bias toward
a bespoke accessible component over a heavy library; if a
library is needed, prefer headless (Radix / Downshift) and
keep the dependency narrow. No new URL family.

### Phase 21 — Content voice alignment

Rewrite all ~101 task entries in `content/prompts.json` from
second-person imperative form ("tidy the surface you look at
most often") to gerund or participial form consistent with
the voice guide in `design/CLAUDE.md` ("the task marked if
it happened" is the model). Spawn the content-curator
sub-agent for the bulk rewrite. Content-only — no code
changes; `prompts.ts` reads the JSON without format
assumptions; the verify gate must pass with content-only
changes. Closes the documented voice-guide compliance gap
visible on every `/today` and in the landing 7-day preview.

### Phase 22 — Voice coherence sweep

Ship the remaining stalled copy scope items from the voice
coherence candidate (each individually below the iterate
threshold; numbering per the candidate's scope list):
(3) `/signin` post-submit destination context sentence
("the link opens today's prompt."); (6) `/settings` display
name placeholder to a neutral form; (24) `/settings`
username prefix "@" vs "/u/" — verify against the public
profile's @username display convention before changing;
(27) normalize the "no password" phrasing form across `/`
and `/signin`; (35) `/signin` H1 "sign in." terminal-period
register inconsistency; (36) `/` "ten minutes" lede figure —
ground it or remove it ([needs-user-call]; default: remove);
(38) `/` "forgetting a day is fine" presupposes existing
practice for a pre-signup visitor; (39) `/settings`
"curated" ungrounded editorial register; (40) `/` lede "one
small prompt" vs the named concept "prompt"; (43)
`/settings` "view your public profile" → "view public
profile"; (47) `/signin` confirmation "no password
required." → "no password."; (48) `/settings` username
placeholder drops the "public" qualifier. Copy-only; no new
routes, no schema changes.

### Phase 23 — Data export

`GET /api/export` returns the authenticated user's entries +
prompts + dates as JSON; `?format=md` returns Markdown. An
"export your data" link on `/settings`. New route under
`/api/` only — no new page URL family. Spec deferred this to
v1.5 from the outset; users with weeks of practice currently
have no backup or portability path.

### Phase 24 — Account deletion

`DELETE /api/account` route: cascades deletion of entries +
profile row, then signs out. Confirmation UI on `/settings`
("delete my account and all my entries") — destructive
action, so the confirmation must be explicit and separated
from the save/sign-out controls. Verify or add `ON DELETE
CASCADE` FK constraints in Supabase migrations if absent
(may need one minor migration). GDPR right-to-erasure
closure for a personal-data-collecting app.

### Phase 25 — Loop issue mirroring

Write `scripts/loop-issue.mjs` per the iterate.md §2.5
contract: (1) `open --severity ... --category ... --source
... --title "..." --body-file <path>` creates a GitHub issue
via `gh issue create`, applies the `loop:opened` label,
echoes the issue number; (2) `close-comment --number N
--commit <sha> --deploy-url <url>` posts a closing comment.
Failure is a warning, never a blocker. Load GH_TOKEN /
GH_REPO from the environment (same pattern as
`deploy-check.mjs`). 81 AUDIT.md entries currently carry
`[mirror-failed]`; this reconnects the public loop timeline.
Script-only — no app code.

### Phase 26 — Evening theme (experiment)

A time-aware dark palette. Honor
`prefers-color-scheme: dark` with a token-derived dark
variant of the existing palette (warm, dim — candlelight
rather than tech-dark), defined in `design/tokens.css` as a
parallel custom-property set. No toggle UI in v1 of this
experiment — the OS preference decides. All contrast ratios
must hold AA against the a11y gate (phase 15 axe scans run
in both schemes if feasible). Design tokens are the single
source; no per-component color literals. Flag and stop if
the design system needs more than a token-layer change.

### Phase 27 — Month in review (experiment)

On `/log`, when a calendar month has just ended (first ~7
days of a new month), render a single quiet recap line above
the mosaic for the month that closed: entries written count
and one observational clause, e.g. "in may — 14 entries.
the longest sat on the 12th." Voice per `bearings.md`:
lower-case, observational, no streak language, no praise, no
exclamation. Renders nothing when the prior month has zero
entries. No new route, no schema change — derived from the
entries already fetched for the mosaic.

### Phase 28 — Shareable entry card (experiment)

Dynamic OG image for public entry pages
(`/u/[username]/[date]`): an `opengraph-image` route that
renders the entry's opening clause (~80 chars), the author's
display name, the date, and the mosaic motif on warm cream
per design tokens — so a shared public entry link carries
the brand instead of the generic site card. Published
entries only (the page is already public); no change to the
publish model or to private data exposure. Reuses the phase
14 OG pipeline. Cache with standard Next.js image-route
semantics.

### Phase 29 — E2e authenticated flow coverage

Promoted from `plan/PHASE_CANDIDATES.md` [score 4.5]. Every
Playwright spec still tests only anonymous/redirect state;
28 phases shipped without a single authenticated assertion,
so a regression in the core write flow would pass all gates.
Add specs that sign in with a test account (Supabase
test-role user or a dedicated seeded user — credentials wired
via CI secrets, mirroring the `mint-cookie.mjs` path the
cloud loop already uses for /critique), then exercise: the
write flow on `/today` (compose, save, assert persistence),
entry visibility on `/log` (the new entry appears in the
mosaic + most-recent article), and the edit flow on
`/log/[date]` (edit, save, assert updated text + `updated_at`
moved). Optionally cover the offline-draft path (phase 19)
with a network-intercept stub. Ships this FIRST among the new
phases so the feature work that follows (31-39) lands on top
of real authenticated coverage. Test-only addition — no app
code changes. May require a one-time test-user seed step in
the CI environment; document it in `apps/e2e`.

### Phase 30 — Authentication funnel UX clarity

Promoted from `plan/PHASE_CANDIDATES.md` [score 5.0]. Tighten
the `/signin` pre/post-submission states so first-time
visitors are guided cleanly. Scope: (1) resolve the standing
`[needs-user-call]` on the expiry notice — DEFAULT decision:
the expiry line ("links expire after 24 hours.") reads as
context for a link already sent, so it belongs in the
post-submission confirmation, not the pre-submission form;
move it accordingly and remove any duplicate pre-submission
instance. (2) Fold in the adjacent unresolved `/signin`
register findings clustered in critique passes 51-55: the
confirmation copy "on its way" colloquialism, the
double-announcement (both `role="status"` live region and
programmatic focus on the confirmation), and the
imperative-verb submit label — so the funnel ships as one
coherent voice-and-clarity pass rather than leaving siblings
for the iterate tail. Confirm scope item 3 (post-submit
destination context) actually landed with Phase 22; if not,
include it. Copy + conditional-render changes on `/signin`
only; no new routes, no schema changes.

### Phase 31 — Entry search (experiment)

The one capability the spec deferred from the outset
("Search (defer)") and the obvious gap for anyone with weeks
of practice: there is no way to find a past entry except by
scrolling the mosaic or guessing a date URL. Add a search
surface (a quiet input on `/log`, or a dedicated `/log`
sub-affordance) that full-text-searches the authenticated
user's own entries by body text and prompt. Server-side query
against Postgres — prefer a `tsvector`/`websearch_to_tsquery`
full-text index over naive `ILIKE` (add the generated column
+ GIN index in a migration); fall back to trigram if FTS
proves heavy. Results list links to each matching
`/log/[date]` with a short matched-text excerpt. Own entries
only — RLS already scopes this; no cross-user search, no
public search. Voice per `bearings.md` (lower-case, no
result-count gamification). Empty query renders nothing;
no-results renders one quiet line. New behavior on an
existing route family — no new public URL.

### Phase 32 — Year in review (experiment)

Extend the month-in-review pattern (phase 27) to the calendar
year. On `/log`, in the first ~7 days of a new year (or as a
linkable `/log/[year]` recap — pick the lighter touch), render
a single quiet recap block for the year that just closed:
total entries written, the months that carried the most
practice, and one observational clause in the same register
("in 2025 — 213 entries. the quietest stretch was august.").
Voice per `bearings.md`: lower-case, observational, no streak
language, no praise, no exclamation, no charts that imply a
scoreboard. Renders nothing when the prior year has zero
entries. Derived from entries already queryable for the
mosaic — no new schema. Reuses the month-in-review component
shape where it can.

### Phase 33 — Daily reminder (experiment)

An opt-in daily email nudge to write today's entry. OFF by
default — a setting on `/settings` ("daily reminder: off /
on", with the send time honoring the user's saved timezone).
A scheduled job (extend the existing GitHub Actions cadence or
a Supabase scheduled function / pg_cron) selects users who
opted in and have not yet written today, and sends one short
plain-text reminder via the project's existing mail path
(the Supabase auth mailer or a transactional provider —
choose the path already wired, document if a new secret is
needed). Voice per `bearings.md`: no pressure, no streak
framing, no guilt copy — one quiet line and a link to
`/today`. Strict anti-spam: at most one reminder per user per
day, never if today's entry already exists, instant
unsubscribe honored. New `reminder_opt_in` + `reminder_hour`
columns (migration). Flag and stop if no transactional mail
path is available without new paid infra.

### Phase 34 — One-word check-in (experiment)

An optional single-word check-in per entry — a mood or
weather word ("steady", "rain", "frayed") captured alongside
the day's writing. A small, skippable input on `/today` near
the entry surface; never required to save. The word surfaces
subtly: as a quiet annotation on the `/log/[date]` view and,
if it reads well without becoming a scoreboard, as a faint
textural cue on the mosaic tile (color or glyph — must hold
the a11y contrast gate and must not imply a rating). Voice
per `bearings.md`: it is a note to self, not a metric — no
aggregation, no "mood trends", no charts in v1. New nullable
`checkin_word` column (migration); free-text, length-capped,
sanitized. Renders nothing when absent.

### Phase 35 — Entry tags + themed browsing (experiment)

Let an entry carry lightweight tags (e.g. "work", "family",
"travel") so a practitioner can trace a theme across time.
Add a tag input on `/today` and on the `/log/[date]` edit
surface (comma or chip entry; create-on-type; length-capped;
sanitized). Browse by tag: a filter affordance on `/log` that
narrows the mosaic + entry list to a chosen tag, and a
`/log?tag=` (or `/log/tag/[tag]`) view linking each tagged
entry. Schema: a normalized `tags` + `entry_tags` join, or a
`text[]` column with a GIN index — choose based on the search
work in phase 31 (reuse the indexing approach). Own entries
only; tags are private (not shown on public profiles in v1).
Voice per `bearings.md`: tags are quiet organization, not
gamified collections — no counts-as-achievement framing.
Migration required.

### Phase 36 — Markdown rendering in entries (experiment)

Entries are stored as plain text today and rendered verbatim.
Let the rendered views interpret a safe subset of Markdown —
emphasis, lists, blockquotes, links, headings — while storage
stays plain text (no format lock-in, fully reversible).
Render on `/log/[date]`, the public `/u/[username]/[date]`,
and the most-recent article on `/log`; the `/today` compose
textarea stays plain (optionally a low-key preview toggle).
Use a vetted, sanitizing Markdown pipeline (e.g.
`react-markdown` + `rehype-sanitize`, or `marked` +
`DOMPurify`) — untrusted user content, so the sanitizer is
non-negotiable and links get `rel="ugc nofollow"`. Typography
must stay within the design tokens (no raw HTML passthrough,
constrained heading scale). No schema change — pure render
layer. Flag if sanitization adds meaningful bundle weight on
the public path.

### Phase 37 — Weekly reflection (experiment)

An opt-in, quiet weekly synthesis composed by Claude. When a
user has opted in (a `/settings` toggle, OFF by default) and
has written at least N entries in the past week, surface a
short reflective paragraph — read back, not advice — that
notices threads across the week's entries ("this week kept
returning to rest, and to a conversation you hadn't had
yet."). Reuse the project's existing Anthropic wiring from
phase 12; before implementing, consult the `claude-api` skill
and use the latest Claude model. Generate server-side, cache
the result per user per ISO week (a `weekly_reflections`
table keyed by user + week — never regenerate on every view;
respect cost), and gate generation behind the opt-in so no
entry text is sent to the model without consent. Voice per
`bearings.md`: observational, lower-case, no praise, no
prescriptions, no scoring. Show a clear "written by ember
from your week" provenance line. Flag and stop if the
moderation/consent path is unclear. Migration required.

### Phase 38 — Prompt packs (experiment)

Today the daily prompt comes from one ~101-entry seed list.
Let a user opt into a themed prompt pack — alternate curated
collections (e.g. "gratitude", "craft", "stoic", "grief")
selectable on `/settings` ("prompt source: standard / <pack>")
— so the daily ritual can take a chosen register. Packs are
content files alongside `content/prompts.json` (one JSON per
pack, same shape, voice-aligned per `design/CLAUDE.md`);
spawn the content-curator sub-agent to author the pack copy.
Selection is per-user (a `prompt_pack` column, default
`standard`); the deterministic date-based selection logic
(phase 5) reads from the chosen pack. Composes with phase 12
personalization as a precedence decision (pack vs personalized
— document the order). No new public route. Migration for the
preference column; the rest is content + a settings control.

### Phase 39 — Bound export ("your book") (experiment)

Beyond the raw JSON/Markdown data export (phase 23), give a
practitioner a readable artifact: a typeset, chronological
compilation of all their entries — "your book" — rendered as
a clean print-stylesheet HTML page (`/export/book` or a
`/settings` action) that the browser prints to PDF, with a
title page, date headers, prompts, and entry bodies set in the
brand typography. Print CSS (`@media print`) is the v1 path —
no server-side PDF dependency unless trivial. Optional cover
using the mosaic motif. Honors Markdown rendering (phase 36)
if shipped. Own entries only, authenticated. Voice + type per
`design/CLAUDE.md`. No schema change — derives entirely from
existing entries. Flag if print fidelity across browsers
proves too fragile for a clean v1.
