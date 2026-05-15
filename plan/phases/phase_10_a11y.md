# Phase 10 — A11y pass

## Outcome

Every page passes a structural accessibility audit: skip-to-content link,
correct landmark regions (`<main>`, labelled `<nav>`), `aria-current="page"`
on active nav links, sound heading hierarchy, and decorative tiles hidden
from the accessibility tree. Keyboard users can navigate all interactive
surfaces without a mouse.

## Why

Phases 1–9 built and polished the feature surface. A11y corrections are
cheapest applied as a single focused pass before the perf pass (phase 11),
because perf work may restructure the component tree.

## Scope

### 1. Skip-to-content link (layout.tsx)

Add a visually-hidden skip link as the **first focusable element** in `<body>`:

```tsx
<a href="#main-content" className="skip-link">skip to content</a>
```

Style in `globals.css`:
- Absolutely positioned off-screen by default
- Becomes visible on `:focus-visible` (top-left corner, paper background,
  ink color, 1px border)
- z-index above the header

All pages that render a `<main>` must carry `id="main-content"` on that element.
Pages that currently lack a `<main>` (landing, public profile) get one added
in this phase.

### 2. `aria-label` on all `<nav>` elements

Every `<nav>` in the product must have an `aria-label` so screen readers
can distinguish them when multiple landmarks appear on the same page.

| File | Element | Label to add |
|---|---|---|
| `src/app/today/page.tsx` | `<nav className={styles.nav}>` | `aria-label="site navigation"` |
| `src/app/log/page.tsx` | `<nav className={styles.nav}>` | `aria-label="site navigation"` |
| `src/app/log/[date]/page.tsx` | `<nav className={styles.nav}>` | `aria-label="site navigation"` |
| `src/app/settings/page.tsx` | `<nav className={styles.nav}>` | `aria-label="site navigation"` |
| `src/app/u/[username]/page.tsx` | entry `<nav>` already labelled | no change |

### 3. `aria-current="page"` on active nav links

The sites's primary nav uses a CSS `.navCurrent` class to style the active
link. Screen readers need `aria-current="page"` to announce which page is
active. Add to every nav link that is currently the page:

- `today/page.tsx` → `<a href="/today" aria-current="page">`
- `log/page.tsx` → `<a href="/log" aria-current="page">`
- `log/[date]/page.tsx` → `<a href="/log" aria-current="page">` (log is the parent section)
- `settings/page.tsx` → `<a href="/settings" aria-current="page">`

### 4. `<main id="main-content">` on landing and public-profile pages

`src/app/page.tsx` — wrap all content sections inside `<main id="main-content">`.
Exclude the header and footer-credit div (they go outside main).

`src/app/u/[username]/page.tsx` — wrap identity, mosaicWrap, privacyNote,
divider, entryView/emptyState, and entryNav inside `<main id="main-content">`.
The page header goes outside.

All existing pages with `<main>` get `id="main-content"` added:
- `src/app/today/page.tsx` ✓ (add id)
- `src/app/log/[date]/page.tsx` ✓ (add id)
- `src/app/settings/page.tsx` ✓ (add id)
- `src/app/signin/page.tsx` ✓ (add id)
- `src/app/u/[username]/[date]/page.tsx` ✓ (add id)

### 5. Heading hierarchy on log page

`src/app/log/page.tsx` has no page-level `<h1>`. The mosaic section uses
`<p className={styles.mosaicMeta}>your past sixty days</p>`, while the most
recent entry card uses `<h1>` for the prompt text.

Fix: change `<p className={styles.mosaicMeta}>` to
`<h1 className={styles.mosaicMeta}>`. The entry card's prompt heading
becomes `<h2 className={styles.entryPrompt}>`. This gives the page a
correct outline: h1 = page purpose, h2 = entry content.

Update the `.mosaicMeta` style in `log/page.module.css` if needed to
preserve the visual (it's already Inter 12px uppercase — no visual change
expected from a block-level swap).

### 6. DayStrip decorative tiles

In `src/app/today/DayStrip.tsx`, the mosaic tiles are non-interactive
`<div>` elements. Each has `aria-label={date}` (e.g. `"2026-05-15"`), but:
- They are not focusable and cannot be activated.
- The day label is already rendered as a visible `<span>` below the tile.

Change: remove `aria-label` from the tiles and add `aria-hidden="true"`.
The strip section already renders visible text labels; the tile colors are
decorative only.

### 7. MosaicGlyph inner tiles

`src/app/components/mosaic/MosaicGlyph.tsx` renders its parent `<div>`
with `aria-label="ember"` but the 60 child tiles are bare `<div>`s that
are accessible by default (even if they have no role). Add `aria-hidden="true"`
to the glyph's container's children by adding it once to the mapped divs:

```tsx
<div key={i} className={tileClass(state)} aria-hidden="true" />
```

The parent `aria-label="ember"` already describes the whole glyph;
the children add nothing.

### 8. LogMosaic keyboard focus tooltip

`src/app/log/LogMosaic.tsx` shows a tooltip only on `mouseenter`/`mouseleave`.
Keyboard users focusing a tile via Tab receive no date/excerpt hint.

Add `onFocus` / `onBlur` handlers matching the mouse enter/leave logic:
- `onFocus`: compute position from `getBoundingClientRect()` the same way
  as `handleEnter`, set tooltip visible.
- `onBlur`: set tooltip hidden.

This requires a minor change: the focus handler needs access to the
`currentTarget` element. Use `e.currentTarget` (same as mouseenter).

Note: the tooltip is `aria-hidden="true"` so screen readers won't read it
from the DOM — screen readers already get the tile's `aria-label`. The
tooltip is a *visual* aid for sighted keyboard users only.

### 9. Skip-link CSS in globals.css

```css
.skip-link {
  position: absolute;
  left: var(--space-4);
  top: var(--space-4);
  transform: translateY(-200%);
  z-index: 9999;
  padding: var(--space-2) var(--space-4);
  background: var(--color-paper);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  font-family: var(--font-sans);
  font-size: var(--type-14);
  text-decoration: none;
  transition: transform 120ms ease;
}
.skip-link:focus-visible {
  transform: translateY(0);
}
```

## Decisions (pre-decided — DO NOT ASK)

1. **Skip link targets `#main-content`, not `#content`.** Consistent with
   the `id="main-content"` pattern; shorter than page-specific IDs.
2. **Heading hierarchy fix on log page changes `<p>` to `<h1>`.** The
   mosaicMeta copy ("your past sixty days") is the most logical page-level
   heading. The entry prompt demotes to `<h2>`. Visual styles are
   unchanged — the class already uses Inter 12px; no size adjustment needed.
3. **DayStrip tiles go aria-hidden, not role="img".** They are color chips
   with visible text labels below — not standalone images. `aria-hidden` is
   appropriate; adding role="img" with a duplicate label would be redundant.
4. **LogMosaic tooltip stays aria-hidden.** The tile Links already have
   `aria-label={tile.displayDate}`. Screen readers read the label; the tooltip
   is only for sighted keyboard users who need visual feedback.
5. **`<nav aria-label="site navigation">` on all primary navs.** A single
   consistent label is simpler than page-specific labels (e.g.
   "today navigation") and easier to keep in sync.
6. **No axe-core / jest-axe dependency.** Tests are structural checks (skip
   link present, aria-current on active link, nav has aria-label, main exists).
   Automated contrast testing is deferred to a tooling-only CI step; not
   blocking this phase.

## Components / files changed

- `src/app/layout.tsx` — add skip link, add className binding
- `src/app/globals.css` — `.skip-link` rule
- `src/app/page.tsx` — wrap in `<main id="main-content">`
- `src/app/today/page.tsx` — `id="main-content"` on `<main>`, nav aria-label, aria-current
- `src/app/log/page.tsx` — `<main>` wrapper with id, nav aria-label, aria-current, h1/h2 fix
- `src/app/log/[date]/page.tsx` — `id="main-content"` on `<main>`, nav aria-label, aria-current
- `src/app/settings/page.tsx` — `id="main-content"` on `<main>`, nav aria-label, aria-current
- `src/app/signin/page.tsx` — `id="main-content"` on `<main>`
- `src/app/u/[username]/page.tsx` — wrap content in `<main id="main-content">`
- `src/app/u/[username]/[date]/page.tsx` — `id="main-content"` on `<main>`
- `src/app/today/DayStrip.tsx` — aria-hidden on tiles, remove aria-label
- `src/app/log/LogMosaic.tsx` — onFocus/onBlur tooltip handlers
- `src/components/mosaic/MosaicGlyph.tsx` — aria-hidden on child tiles

## Pages × tests matrix

| Page | Structural checks in e2e |
|---|---|
| `/` | skip link present, `<main>` present |
| `/signin` | skip link present, `<main>` present |
| All pages | skip link navigates to `#main-content` (structural check) |

New file: `apps/e2e/tests/a11y.spec.ts`

Tests:
- Landing page has skip link as first focusable element
- Landing page `<main id="main-content">` exists
- Signin page has skip link
- Skip link is initially off-screen, visible on focus (checked via CSS class)
- Landing page nav has `aria-label`
- Today page: this is auth-gated, so only the redirect is checked via smoke

## Verify gate

```bash
pnpm verify
```

## DoD

- [ ] `pnpm verify` exits 0
- [ ] All pages have `<main id="main-content">`
- [ ] Skip link is first focusable element in layout
- [ ] All `<nav>` elements have `aria-label`
- [ ] Active nav links have `aria-current="page"`
- [ ] DayStrip tiles are `aria-hidden`
- [ ] MosaicGlyph child tiles are `aria-hidden`
- [ ] LogMosaic tiles show tooltip on keyboard focus

## Follow-ups (out of scope for this phase)

- Automated colour-contrast audit (axe-core in CI) — Phase 11 or dedicated
- Focus-ring styles (currently browser default) — candidate for `/iterate`
- `aria-live` region for save-state messages in TodayEntry / SettingsForm — `/iterate`
