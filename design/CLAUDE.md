# ember — visual law

> This file is read on every session in this project. Honor it
> before improvising. It overrides any older guidance found
> elsewhere in the repo — including `agents.md` and
> `plan/bearings.md` — on visual matters.

Ember is a calm daily-practice site. **Pull-based always. One small prompt + one tiny task per day. The 60-day mosaic accumulates as a quiet log of attention.** Audience is the adult who wants a low-friction ritual; not a productivity hacker, not a journaler.

The visual system lives entirely in this folder. **For any frontend work — new screens, primitives, page edits, copy near UI elements, color decisions, type decisions, animation decisions — read this file first, then `decisions.md`, then the matching `Ember · <Screen>.html` reference. If your change conflicts with what's described there, this folder wins. Open an `[needs-user-call]` instead of working around it.**

---

## The visual system, in one paragraph

Ember's identity rests on two pillars: **color** and **typography**. Warm cream paper, warm slate ink, one ember-toned accent held back from a "fiery" chroma. Source Serif 4 for editorial text (prompts, entries, hero), Inter for chrome (nav, buttons, labels), JetBrains Mono for dates only. The 60-day mosaic of 16/24/32px square tiles is the **only** graphic in the entire product. There are no illustrations, no icons, no photos, no avatars, no logos beyond the mosaic + lowercase "ember" wordmark.

---

## Five hard rules — never break

1. **The 60-day mosaic is the only graphic.** No icons (nav, action, inline). No illustrations. No photos. No user avatars. No per-show or per-entry imagery. Where a marker is needed in a list or button, it gets a **word**, not a symbol.

2. **Four tile states. Only ever four.** `empty` (transparent + 1px ink-faint border), `filled` (solid accent), `today` (filled accent + 2px paper-ring inset + 1px accent halo), `published` (filled accent + 4px accent-2 inset). Do not invent a fifth state. Do not propose hover-fills, "almost there" states, "streak" highlights, or any other variant.

3. **No streak-shaming, no celebration moments.** The mosaic shows what is, not what isn't. Empty tiles are quiet, never accusatory. There is no "you broke your streak!" UI, no "you've practiced N days!" pop-up, no confetti, no encouragement copy. Per `decisions.md`: *the product is for the user, not for engagement.*

4. **No motion beyond a 200ms fade-in on first mosaic render (staggered 8ms per tile) and a 1px opacity shift on tile hover.** That is the entire motion inventory. No page transitions, no element pop-ins outside the mosaic, no scroll-linked anything, no hover animations on buttons beyond a static color swap.

5. **No shadows. No gradients.** Depth comes from `--color-border` hairlines and `--color-paper-sunk` fills, never drop-shadows. Every fill is a single oklch value. Modals sit on paper-sunk backdrops; they do not float.

---

## Show identity → mosaic identity

There is no "show" concept in ember (that's pantheon). The **user's identity** is the mosaic. A profile is a name, a `@handle` in mono, and a mosaic where only published tiles are filled. Unpublished days are empty regardless of whether the user practiced — the mosaic on a public profile leaks nothing about private activity.

---

## Type: where each family goes

- **Source Serif 4** — body. Hero prompts (32-40px). Entry input + rendered responses (17px, prose line-height). Wordmark "ember" (24px, lowercase). Source Serif 4 has an 8..60 optical-size axis; the hero and the body are different cuts of the same family. Do not substitute a different serif.
- **Inter** — chrome only. Buttons, nav, settings labels, footer copy. 14px sans by default. The serif speaks; Inter labels.
- **JetBrains Mono** — dates only. The `/today` date stamp, mosaic hover tooltips, entry header dates. Not for code, not for meta-labels, not for "data feel" anywhere else. Mono on dates is a deliberate echo of paper-and-stamp calendars.

If a type need arises that doesn't fit into this triangle (serif/Inter/mono), surface it as a `[needs-user-call]`. Do not introduce a fourth family.

---

## File map (this folder)

| file | purpose |
|---|---|
| `CLAUDE.md` | This file. Visual law summary. |
| `decisions.md` | The brief — full rationale, palette defenses, type rationale, mosaic spec, carry-forward notes for phase 2. **The canonical source on a conflict.** |
| `INDEX.md` | One-page tour of every file. Read this for orientation. |
| `tokens.css` | The authoritative source for every value. Palette (light + dark), type ramp, spacing, radii, motion, mosaic geometry. When phase 2 ports to Tailwind, the Tailwind config references these custom properties — don't re-encode the values. |
| `Ember · Brand.html` | The mosaic brand mark spec. Three tile sizes, all four states, both modes, construction table, hover spec, lockup rules, don't-list. |
| `Ember · Tokens.html` | Visible token swatches — palette, type ladder, spacing ramp, mosaic states, button + input primitives. |
| `Ember · Landing.html` | The anonymous `/` page. |
| `Ember · Today.html` | The authenticated `/today` screen. |
| `Ember · Log.html` | The authenticated `/log` screen with the 60-day mosaic. |
| `Ember · Profile.html` | The public `/u/[username]` page (only published tiles filled). |
| `Ember · Signin.html` | The `/signin` magic-link screen. |
| `Ember · Mobile.html` | 375px walkthrough — same HTML, single-column reflow. |
| `Ember · Pause 1 - Palette + Type.html` | Historical artifact from the design pass's pause-and-confirm beat. Kept for the audit trail. |

---

## Frontend-work workflow (canonical)

When working on anything that touches the rendered product — phases 2 through 8, plus any `/iterate` finding that lands on UI:

1. **Read `design/CLAUDE.md`** (this file).
2. **Read `design/decisions.md`** for the rationale behind the decision you're about to make.
3. **Find the matching `Ember · <Screen>.html`** and treat it as the production target. The HTML is the spec — port it to React/Tailwind in `src/`, don't re-interpret.
4. **Reference `design/tokens.css` directly.** Tailwind config should pull from `var(--color-*)`, `var(--type-*)`, etc., so the design folder remains the single point of edit.
5. **If the design folder doesn't cover what you need**, file an `[needs-user-call]` in `plan/AUDIT.md`. Do not extend the visual system mid-phase. Visual extensions are their own design commission pass.

This workflow applies to every contributor, every skill (`/ship-a-phase`, `/iterate`, `/critique`, even `/triage` when classifying UI issues), and every sub-agent.

---

## Wins over bearings on conflict

`plan/bearings.md` describes the visual system in working defaults. **This folder wins on every conflict.** If `bearings.md` describes a color, type size, mosaic dimension, or motion that contradicts `decisions.md` or `tokens.css`, the design folder is the source of truth — update bearings, don't litigate.

If a new screen is needed that the design folder doesn't include, the path is: (1) ship an `[needs-user-call]` requesting a design extension, (2) wait for the user to either re-commission or relax the constraint, (3) then implement. Never implement first.

---

## What the design folder does NOT cover

- **Favicon, OG image, social cards.** These are the demand-pull asset layer. A future `/ship-asset` slice renders them against the mosaic primitive, but they don't ship in v1.
- **Onboarding flows, admin UI, moderation UI.** All out of scope for v1.
- **Email templates.** Supabase Auth's default magic-link email is fine for v1; templated email lands in a later phase if it lands at all.
- **Marketing pages, about pages, FAQ.** The landing page is the entire marketing surface.
