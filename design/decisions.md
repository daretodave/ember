# ember · design decisions

> the brief, written down. this file wins over `plan/bearings.md`
> on visual matters. on a conflict, this is the canonical source.

## the mood interpretation

"quiet warmth" became three commitments:

1. **warm cream paper, not white.** a true #ffffff page felt
   clinical against a calm daily-practice. a warm cream
   (`oklch(0.978 0.008 80)`) reads as *paper* rather than
   *screen*, which is the right framing for a place where
   you write a few sentences before opening your phone.

2. **slate ink with a warm tilt, not pure black.** pure black on
   cream felt sharp in a way the rest of the system isn't
   willing to be. the ink is `oklch(0.255 0.014 60)` — dark
   enough for body type contrast, warm enough to belong to
   the same temperature family as the paper and the accent.

3. **one ember accent, held back.** the first impulse was a
   vibrant terracotta; that impulse was wrong. the published
   ember is `oklch(0.625 0.135 48)` — chroma 0.135, not the
   0.18+ a "fiery" ember would want. at 16px tile size on
   cream, the restrained chroma reads as warmth, not alarm.
   "ember" should mean *banked coals*, not *open flame*.

## palette rationale

| token | value | role |
|---|---|---|
| `--color-paper` | `oklch(0.978 0.008 80)` | the page. warm cream. chroma 0.008 keeps it cream-not-yellow. |
| `--color-paper-sunk` | `oklch(0.955 0.010 80)` | the today-row highlight, the footer zone, the diagram panels. 2pts darker, same hue. |
| `--color-ink` | `oklch(0.255 0.014 60)` | body type. warm slate. 60° hue echoes the accent family. |
| `--color-ink-muted` | `oklch(0.535 0.012 65)` | chrome labels, dates, secondary copy. |
| `--color-ink-faint` | `oklch(0.745 0.010 70)` | empty-tile borders, placeholder text, never used for type. |
| `--color-border` | `oklch(0.880 0.008 75)` | section hairlines. |
| `--color-border-faint` | `oklch(0.930 0.008 75)` | within-section dividers in long lists. |
| `--color-accent` | `oklch(0.625 0.135 48)` | the ember. only on filled tiles, focus rings, primary state-on toggle. |
| `--color-accent-2` | `oklch(0.480 0.110 42)` | deep ember. published-tile 4px inset. accent in italic editorial pulls. |
| `--color-signal-error` | `oklch(0.525 0.155 28)` | error code marker, only. |

**dark mode** mirrors the temperature: warm near-black paper
(`oklch(0.185 0.010 60)`) under warm off-white ink. the accent
is lifted to `oklch(0.680 0.130 52)` to keep contrast against
the dark paper. the relationship between accent and accent-2
is preserved across modes.

**non-saturations** — every neutral chroma is at or below
0.014. nothing in the system is "near-white" while secretly
being slightly blue or slightly green. the warm tilt is
intentional and consistent.

## type rationale

**Source Serif 4 carries body** because the act ember asks
for is editorial — write a few sentences in response. a
serif here signals *take your time*, where a sans would
signal *fill this in*. source serif 4 specifically has an
8..60 optical-size axis, which means the prompt-at-40 and
the body-at-17 are different cuts of the same family — the
larger weight gets the open counters and crisp serifs it
needs at hero scale, the smaller weight gets the compact
proportions it needs at body scale. one family, multiple
voices, no awkward jump.

**Inter is chrome-only** because the chrome should be
quiet. inter at 14px sans does what it's supposed to: it
tells you "this is a button" or "this is a nav item"
without contributing voice. the serif speaks; inter
labels.

**JetBrains Mono is dates-only.** mono on dates is a
deliberate echo of paper-and-stamp calendars. it appears
on the /today date stamp, in mosaic hover tooltips, and on
the entry-view date header. nothing else. the temptation
to put a mono caption under every section header has been
resisted.

**ramp** — 12 / 14 / 16 / 17 / 20 / 24 / 32 / 40. eight
sizes, not seven, because the prompt range needed both
floor (32) and ceiling (40) to handle one-line and
two-line prompts gracefully.

## the mosaic spec, in prose

the mosaic is the brand mark. it appears in three sizes
(16 / 24 / 32 px tile) at a fixed 4:1 tile-to-gap ratio.
the grid is 6 columns by 10 rows = 60 days. tiles are
square, radius 0, always.

four states. only ever four states:

- **empty** — transparent fill, 1px ink-faint border. a
  day with no entry. quiet, not accusatory.
- **filled** — solid accent. a private entry exists.
- **today** — solid accent + a 2px paper ring inset, with
  a 1px accent halo around that. reads as "you are here"
  without shouting.
- **published** — solid accent with a 4px accent-2 inset.
  per-entry opt-in. the only place accent-2 appears in
  the tile inventory.

the mosaic appears alone (canonical brand mark) or paired
with the lowercase serif wordmark "ember" (header lockup).
there is no wordmark-alone treatment. there is no third
lockup.

hover (desktop only) surfaces a tooltip with the date in
mono and the first 80 characters of the entry in faint
mono. on mobile a tap navigates to `/log/[date]`. no
tooltip on mobile.

## five things the system will not do

1. **no icons.** the four tile states + the mosaic glyph
   are the entire visual vocabulary. no nav icons, no
   action icons, no inline iconography in copy. if a
   button needs a marker, it gets a word.

2. **no illustrations, no photos, no avatars.** the
   mosaic is the only graphic. user profiles do not have
   avatars or banners; they have a name, a handle, and a
   mosaic.

3. **no animation beyond a 200ms fade-in on first mosaic
   render**, staggered 8ms per tile. plus a 1px opacity
   shift on tile hover. that is the entire motion
   inventory. no page transitions, no element pop-ins
   beyond the mosaic, no scroll-linked anything.

4. **no shadows.** depth comes from the page (border +
   paper-sunk fill), not from drop-shadows. modals will
   sit on a paper-sunk backdrop; they will not float.

5. **no gradients.** every fill is a single oklch value.
   the mosaic is not gradient-tiled. the cta button is
   not gradient-filled. accent-on-paper, ink-on-paper,
   paper-on-ink — these are the only color pairings.

## the "wins over bearings on conflict" note

`plan/bearings.md` lists "Source Serif 4 for headings +
entries, Inter for chrome, JetBrains Mono for dates." this
file extends that contract with specific weight ranges,
optical-size usage, and the rule that mono is dates-only
(not dates-and-code, not dates-and-meta-labels).

`plan/bearings.md` lists the mosaic geometry: "tile size:
16px × 16px with 4px gaps (60 days = one 6×10 grid, ~140px
wide)." this file extends that with the canonical three-
size ramp (16 / 24 / 32) and locks the 4:1 tile-to-gap
ratio at every size.

on any future conflict between this file and bearings.md
on a visual matter (color values, type sizes, mosaic
geometry, motion, the don't-list), this file is the source
of truth. bearings.md should be updated, not contested.

## carry-forward notes for phase 2

- when porting to react/tailwind in `src/`, the tokens.css
  custom properties are the source. tailwind config's
  `theme.extend` should reference `var(--…)` rather than
  hard-coding the oklch values — so this file remains the
  single point of edit.
- the mosaic should be a single `<Mosaic>` component that
  takes an array of 60 tile states. the tooltip is a
  popover behavior, not a separate styled element.
- the seven-day landing preview and the seven-day /today
  strip share a primitive — extract `<TileStrip>` rather
  than reimplementing.
- the entry textarea should never grow a "characters left"
  counter or word count. entry length is unbounded; the
  ui should reflect that.
- the publish toggle on `/today` is intentionally
  understated. it is a switch, not a button, and it
  carries no copy beyond the word "publish." resist the
  product impulse to explain it.

ember · design · v1
