# Phase 18 — Focus mode

## Outcome
Add a distraction-free writing toggle to `/today`. A quiet "focus" button expands
the entry surface to the full viewport, hides all nav and page chrome, leaving only
the prompt, textarea, and save controls. `Esc` or a low-key "done" text control exits.
State is ephemeral. One 200ms fade — no other animation.

## Routes / API endpoints / CLI surface
No new routes. `/today` only. No API changes.

## Content / data reads
No new reads. `prompt` text is already resolved by `page.tsx` before it reaches
`TodayEntry`; we simply thread it down as a new prop.

## Components / handlers

| File | Change |
|---|---|
| `src/app/today/TodayEntry.tsx` | Add `prompt: string` prop; add `isFocus` state; render fixed overlay when active; Esc key handler; focus management on open/close. |
| `src/app/today/page.module.css` | Add focus overlay + trigger CSS (see spec below). |
| `src/app/today/page.tsx` | Pass `prompt={prompt}` to `<TodayEntry>`. |

## Focus mode UI spec

**Trigger:** A text button labelled "focus" in the entry meta row (right-hand side,
alongside "publish" and "save"). Styled: Inter 12px, UPPERCASE, letter-spacing 0.08em,
`var(--color-ink-muted)`. Hover: `var(--color-ink)`. No icon.

**Overlay:**
- `position: fixed; inset: 0; z-index: 100; background: var(--color-paper)`
- Flex column, centered, `max-width: 720px` content column with `var(--space-8)` padding.
- Transition: `opacity 200ms var(--easing)` only. Inactive state: `opacity: 0; pointer-events: none`. Active: `opacity: 1; pointer-events: all`.
- Overlay is always in the DOM; toggled via class, not conditional rendering, so the
  fade-out plays before the element is hidden.

**Overlay content (top → bottom):**
1. Prompt text — Source Serif 4, `var(--type-32)`, ink, `var(--tracking-tight)`, 1.25 line-height.
2. Entry label — "your response", Inter 12px uppercase.
3. Textarea — same styles as the main page textarea (reuse `.entry` class).
4. Entry meta row — last saved indicator + publish toggle + save button (same as page).
5. "done" exit text button — below meta row, Inter 12px uppercase, ink-muted. Right-aligned.

**Exit:**
- `Esc` key calls `exitFocus()`.
- "done" button calls `exitFocus()`.
- On open: focus moves to the focus-mode textarea.
- On close: focus returns to the "focus" trigger button (after 200ms to let fade finish).

**Motion:** `transition: opacity 200ms var(--easing)` on the overlay. Nothing else.

## Cross-links
- In: `/today` page (only surface affected).
- Out: none.
- Retro-fit: none (no new route family).

## SEO / metadata
No change.

## Empty / loading / error states
Focus mode overlay shows whatever state the textarea currently holds. Save/error
states inside the overlay behave identically to the page surface — they share the
same component state.

## Decisions made upfront — DO NOT ASK

1. **Overlay vs. CSS data-attribute on page:** Overlay inside `TodayEntry` keeps the
   change self-contained. The server component `page.tsx` doesn't need restructuring.
   Downside: the overlay doesn't physically hide the page header (it covers it).
   Acceptable — the visual result is identical and the implementation is simpler.

2. **No scroll-lock:** The overlay is `position: fixed; inset: 0` and opaque — it
   visually covers scroll position. Locking `body` scroll via `overflow: hidden` adds
   complexity for negligible UX gain at these content lengths. Decision: omit.

3. **Prompt as new prop on TodayEntry:** Minimal interface change. The alternative
   (a context or a new wrapper component) is heavier for no benefit.

4. **Always in DOM (not conditional):** `{isFocus && <overlay>}` would skip the
   fade-out. CSS class toggle gives the opacity transition on both open and close.

5. **Motion budget:** CLAUDE.md prohibits all animation except the mosaic fade-in and
   tile hover. The Phase 18 build plan brief explicitly allocates "a single 200ms fade"
   for focus mode. This is the only animation in the overlay. No other transitions added.

6. **"focus" / "done" labels are lowercase** (per bearings.md voice — lower-case where
   typographic restraint reads better).

7. **Aria:** Overlay gets `role="dialog"` and `aria-modal="true"` when active.
   `aria-hidden={!isFocus}` when inactive. Title announced via `aria-labelledby`
   pointing at a visually hidden heading.

## Mobile reflow
- Overlay is `position: fixed; inset: 0` — by definition full-screen on all widths.
- Prompt font-size at ≤480px: `var(--type-24)` (same responsive rule as `.prompt`).
- Padding: `var(--space-6) var(--space-4)` at ≤480px.

## Pages × tests matrix

| Surface | Unit | E2E |
|---|---|---|
| Focus toggle | `FocusMode.test.tsx` — click focus → overlay visible; click done → overlay hidden; Esc → overlay hidden; aria-hidden updates | `today.spec.ts` — existing redirect test unchanged; no new authenticated path needed (no auth in e2e suite) |

## Verify gate
`pnpm verify` — typecheck + test:run + build + e2e. All green before commit.

## Commit body template
```
feat: focus mode — phase 18

- Add "focus" text button to TodayEntry entry meta row
- Fixed overlay (opacity fade 200ms) covers viewport in focus mode
- Shows prompt, textarea, save controls; hides nav and page chrome
- Esc key and "done" button both exit focus mode
- Focus managed: textarea focused on enter, trigger on exit
- prompt prop threaded from page.tsx into TodayEntry

Decisions:
- Overlay approach (not data-attr): keeps server component untouched
- No scroll-lock: fixed inset-0 overlay is sufficient
- Always in DOM: opacity toggle gives fade-out on close
- Single opacity 200ms transition — the one fade the phase brief allocates

Closes #<phase-issue>

Cloud-Run: https://github.com/daretodave/ember/actions/runs/26247983068
```

## DoD
- [ ] `TodayEntry` renders focus overlay (always in DOM, opacity-toggled).
- [ ] "focus" trigger in entry meta row.
- [ ] `Esc` exits focus mode.
- [ ] "done" exits focus mode.
- [ ] Focus moves to textarea on open, back to trigger on close.
- [ ] ARIA: `role="dialog"`, `aria-modal`, `aria-hidden` wired.
- [ ] Unit tests pass.
- [ ] `pnpm verify` green.
- [ ] Committed, pushed, deploy green.

## Follow-ups (out of scope)
- Persisting focus-mode preference across sessions.
- Keyboard shortcut to enter focus mode directly.
- A full-screen API integration.
