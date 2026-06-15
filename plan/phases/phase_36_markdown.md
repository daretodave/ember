# Phase 36 — Markdown rendering in entries

## Outcome

Rendered entry views interpret a safe subset of Markdown — emphasis, lists,
blockquotes, links, headings, code — while storage stays plain text. The compose
textarea on `/today` remains plain. All rendered typography stays within design
tokens. Sanitization is non-negotiable.

## Why

Entries are stored and displayed as plain text. Users who write naturally in
Markdown (emphasis, lists, headers) see literal asterisks and pound signs on the
read view. Phase 36 removes this friction for a pure render-layer improvement —
no schema change, fully reversible.

## Scope

### Surfaces that render Markdown

| Surface | Component |
|---|---|
| `/log/[date]` — read view | `EditEntry.tsx` view-mode response block |
| `/log` — most-recent entry | `log/page.tsx` inline article |
| `/u/[username]/[date]` — public entry | `u/[username]/[date]/page.tsx` response block |

The `/today` compose textarea stays plain (no preview toggle in v1).

### New component

**`src/components/entry/EntryMarkdown.tsx`** — `'use client'` component wrapping
`react-markdown` with `rehype-sanitize`. Props: `{ content: string; className?: string }`.

Why client component: `react-markdown` v9 uses internal React rendering that
requires the client context in the version installed. The component is SSR'd
by Next.js so public entry pages still receive server-rendered HTML; hydration
picks up the client component on load. Bundle weight impact ~30KB uncompressed
(~10KB gzipped) — acceptable for a content app that renders rich text.

**`src/components/entry/entry-markdown.module.css`** — scoped CSS for rendered
Markdown content. All values from design tokens; no raw color or size literals.
Element mapping:

- `p` → serif 17px, prose line-height, `--color-ink`
- `h1`, `h2` → serif 20px, semibold, `--color-ink` (h1 in user content capped to section-head scale; cannot conflict with page h1)
- `h3`, `h4`, `h5`, `h6` → serif 17px, semibold, `--color-ink`
- `ul`, `ol` → standard indented list
- `li` → `--space-2` bottom margin
- `blockquote` → 2px left border in `--color-accent`, `--color-ink-muted` text
- `code` (inline) → `--font-mono`, 0.9em, `--color-border` background
- `pre` → `--font-mono`, 14px, `--color-border` background, `--radius-1`
- `a` → `--color-accent`, underline, `rel="ugc nofollow"` (via components override)
- `em` → italic
- `strong` → weight 600
- `hr` → 1px `--color-border` border-top

No `text-transform: uppercase` (lint gate).

### Sanitization

`rehype-sanitize` with default schema. Links get `rel="ugc nofollow"` via the
`components` prop override in `react-markdown` (not via schema mutation — simpler
and explicit). `javascript:` and `data:` hrefs are stripped by default schema.

### Files to modify

- `src/app/log/[date]/EditEntry.tsx` — replace `response.split('\n\n')...map(p => <p>)` view block with `<EntryMarkdown content={response} className={styles.entryResponse} />`
- `src/app/log/page.tsx` — replace same pattern in `<article>` most-recent block
- `src/app/u/[username]/[date]/page.tsx` — replace same pattern in response block

The `.entryResponse` CSS class stays (used for max-width + margin context); the
inner element typography is now owned by `EntryMarkdown` via the scoped module.

### CSS adjustment

In each CSS module that defines `.entryResponse p { ... }` — those rules remain
and apply to the new component's `<p>` elements (scoping works because the
className is passed through). No change needed.

Actually: the inner CSS is now in `entry-markdown.module.css`. Remove the inner
`p` rules from the host modules and let `EntryMarkdown` own its own typography.
The host `.entryResponse` class contributes only `max-width: 600px` and the
outer `font-family`/`font-size` defaults (which EntryMarkdown resets with its
own scoped styles). This prevents style conflicts.

## Tests

### Unit — `src/components/entry/__tests__/EntryMarkdown.test.tsx`

- Renders plain text as a paragraph
- Renders `**bold**` as `<strong>`
- Renders `_italic_` as `<em>`
- Renders `# Heading` as an `h1` element
- Renders `- list item` as a `<li>` inside `<ul>`
- Renders `[link](https://example.com)` with `rel="ugc nofollow"`
- Strips `<script>` tags (XSS guard)
- Renders inline `` `code` `` in a `<code>` element
- Renders fenced code block in a `<pre><code>` element

### E2E — `apps/e2e/tests/markdown.spec.ts`

Anonymous smoke test only (no auth in e2e suite for this phase):
- Public entry page at `/u/[username]/[date]` renders without JS errors (anonymous, so only if a public entry exists; skip gracefully if none)
- `/log` and `/log/[date]` redirect to `/signin` (confirms auth guard intact)

## Decisions (pre-decided — DO NOT ASK)

1. **`'use client'` on EntryMarkdown.** react-markdown requires client context.
   Server-rendering happens via Next.js SSR; no purely-static-RSC approach was
   chosen because EditEntry (client component) also needs this component. One
   shared component beats two parallel implementations.
2. **No preview toggle on `/today` compose textarea.** The brief specifies "the
   /today compose textarea stays plain (optionally a low-key preview toggle)".
   Decision: omit the preview toggle in v1. Simpler, and the feature value is
   in the rendered read view, not the compose editor.
3. **Heading scale: h1/h2 → type-20, h3+ → type-17.** Page h1 is rendered by
   the page component itself (the prompt). User Markdown h1 would compete — cap
   it to section-head scale (20px). This is explicit in the CSS.
4. **rehype-sanitize default schema.** It allows all standard prose elements and
   strips scripts, event handlers, and unsafe URL schemes. No custom allowlist
   additions beyond `rel` on anchors (handled via `components` override, not
   schema).
5. **Links open in same tab.** No `target="_blank"` override; user content
   links should stay in the user's control. They already have `rel="nofollow"`.

## Verify gate

```bash
pnpm verify
```

## DoD

- [ ] `pnpm verify` exits 0
- [ ] `EntryMarkdown` renders `**bold**`, lists, headings, links with sanitization
- [ ] Links carry `rel="ugc nofollow"`
- [ ] `/log/[date]` read view renders via `EntryMarkdown`
- [ ] `/log` most-recent entry renders via `EntryMarkdown`
- [ ] `/u/[username]/[date]` renders via `EntryMarkdown`
- [ ] No raw size or color literals in `entry-markdown.module.css`
- [ ] `pnpm verify` (includes `lint:no-uppercase-css`, typecheck, tests, build, e2e)

## Follow-ups (out of scope)

- Preview toggle on `/today` compose textarea
- Footnotes support (needs `remark-footnotes` plugin)
- Image embeds (explicitly excluded — the mosaic is the only graphic; images in
  user content would conflict with the visual law)
