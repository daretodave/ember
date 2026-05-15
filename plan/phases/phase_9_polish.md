# Phase 9 — Polish

## Outcome

All pages render cleanly at 375px with no horizontal overflow. The 404 page
uses the design system. Runtime errors are surfaced in a styled boundary.
The `/settings` page links to the user's public profile when a username is set.

## Why

Phases 1–8 built the full feature surface. Phase 9 closes the fit-and-finish
gaps: pages without mobile breakpoints, a bare-HTML 404, no error boundary,
and the follow-up "view your public profile" link promised in the phase 8 brief.

## Scope

### Error pages

**`src/app/not-found.tsx`** — replace the bare fallback with a styled page:
- Same header lockup as every other page (MosaicGlyph + "ember" wordmark)
- Centered card: mono "404" label + "try again" link to `/`
- No friendly euphemisms per bearings

**`src/app/error.tsx`** — new global runtime error boundary (must be `'use client'`):
- Same header lockup
- Centered card: "something went wrong." + "try again" button (calls `reset`)
- Falls back to a link to `/` if reset isn't useful

### Mobile CSS additions

Add `@media (max-width: 480px)` blocks to pages that currently lack them.
Pattern: reduce header/main padding from `space-6/7/8` to `space-4/5/6`;
reduce large heading font sizes.

- **`src/app/page.module.css`** (landing):
  - `.pitch` → `var(--type-32)` (from 40)
  - `.ctaInner` → column layout; `.ctaCopy` hides on mobile (too cramped
    beside the button in a single row)
  - `.day` grid col → `72px 1fr` (from `120px 1fr`)
- **`src/app/log/page.module.css`**
- **`src/app/log/[date]/page.module.css`**
- **`src/app/u/[username]/page.module.css`**
- **`src/app/u/[username]/[date]/page.module.css`**

### Settings profile link

In `src/app/settings/page.tsx` (server component): if `profile.username` is
set, render a "view your public profile →" link below the `<SettingsForm>`
pointing to `/u/[username]`.

Add `.profileLink` to `settings/page.module.css`.

### Tests

**`apps/e2e/tests/polish.spec.ts`**:
- `/doesnotexist` returns 404 status
- Not-found page has a link to `/`
- Not-found page has no horizontal overflow at 375px

## Decisions (pre-decided — DO NOT ASK)

1. **CTA copy hidden on mobile.** The sticky bottom CTA has copy ("a sign-in
   link is the only thing you'll receive") that wraps awkwardly at 375px.
   Decision: hide `.ctaCopy` at ≤480px, keep the button full-width. The
   button copy ("sign in to start") is self-explanatory.
2. **No separate mobile error page.** The error + not-found pages are simple
   enough that they fit a single layout at all widths with just padding tweaks.
3. **"view your public profile" is a server-side link, not a client hint.**
   The settings page already has the profile from the server. No need to echo
   the client-side form state back; the link reflects the saved username.

## Verify gate

```bash
pnpm verify
```

## DoD

- [ ] `pnpm verify` exits 0
- [ ] `/doesnotexist` returns 404 with a link to `/`
- [ ] All pages have no horizontal overflow at 375px in E2E
- [ ] `/settings` shows "view your public profile" when username is set
- [ ] Error boundary (`error.tsx`) renders without crashing
