# Phase 26 — Evening theme (dark palette)

> Oversight experiment. Wire the existing dark-mode token layer into
> the live app so `prefers-color-scheme: dark` readers see a warm,
> candlelight dark experience.

## Outcome

`design/tokens.css` already carries a full dark-mode custom-property
set in a `@media (prefers-color-scheme: dark)` block (shipped in the
design commission pass). This phase propagates the three signals the
browser still needs:

1. `color-scheme: light dark` on `:root` — unlocks dark native-UI
   elements (scrollbars, form inputs, `<select>` chrome) without any
   per-component changes.
2. `colorScheme: 'light dark'` + media-keyed `themeColor` in the
   Next.js root metadata — browser address bar / status bar pick up
   the correct chrome color on mobile.
3. Dark-mode axe pass — extend the existing `axe.spec.ts` suite to
   run each route in `colorScheme: 'dark'` media emulation so the
   a11y gate covers both palettes.

No per-component color literals. No toggle UI. OS preference decides.

## Routes / surfaces

No new routes. This phase touches:
- `src/app/globals.css` — `color-scheme` CSS property
- `src/app/layout.tsx` — Next.js metadata `colorScheme` + `themeColor`
- `apps/e2e/tests/axe.spec.ts` — dark-mode axe runs

## Components / handlers

No new components. All color switching is handled by the existing
`@media (prefers-color-scheme: dark)` block in `design/tokens.css`
which is already imported by `globals.css`.

## Content / data reads

None.

## Cross-links

None.

## SEO / metadata

`colorScheme: 'light dark'` emits `<meta name="color-scheme" content="light dark">`.
`themeColor` emits two `<meta name="theme-color">` tags (one per scheme).

## Empty / loading / error states

Unchanged — all states use CSS custom properties that already switch.

## Decisions made upfront — DO NOT ASK

- **No toggle UI.** OS preference is the only signal. A user-level
  toggle is explicitly out of scope for this phase.
- **No change to tokens.** The dark palette values in `design/tokens.css`
  are final; this phase does not re-derive or adjust them.
- **Manifest `theme_color` stays light-only.** The Web App Manifest spec
  does not support per-scheme `theme_color`. The `<meta name="theme-color">` 
  media tags in the HTML head are the correct mechanism; manifest stays 
  light-accent (#c2683f) as the fallback.
- **Dark mode axe runs on same ROUTES constant.** No new routes are added
  to the axe suite; existing five routes are run again with dark emulation.
- **`prefers-color-scheme` media emulation only.** No `data-theme` attribute
  toggling in the dark-mode tests; the `@media` path is the shipped path.

## Tests matrix

| File | What it covers |
|---|---|
| `apps/e2e/tests/axe.spec.ts` | All 5 routes × WCAG 2.1 AA in light mode (existing) + dark mode (new) |

Unit tests: none needed — this is a CSS token wiring, not logic.

## Verify gate

`pnpm verify` — typecheck + test:run + build + e2e (includes axe).

## Commit body template

```
feat: evening theme — dark palette wired — phase 26

- add color-scheme: light dark to :root in globals.css
- add colorScheme + media-keyed themeColor to root layout metadata
- extend axe.spec.ts: dark-mode emulation pass for all 5 routes
- no per-component color changes; token layer was already complete

Decisions:
- no toggle UI: OS preference decides
- manifest theme_color stays light; <meta> tags carry the dark value
```

## DoD

- [ ] `color-scheme: light dark` on `:root` in globals.css
- [ ] `colorScheme: 'light dark'` in root layout metadata
- [ ] `themeColor` array with light + dark entries in root layout metadata
- [ ] `axe.spec.ts` dark-mode runs pass for all 5 routes
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- User-level dark/light toggle (would require a React context + cookie/localStorage).
- Per-page media-queried OG images for dark mode.
- Adjusting icon SVGs for dark mode (current light-mode icon looks fine in dark).
