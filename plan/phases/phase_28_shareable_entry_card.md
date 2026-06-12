# Phase 28 — Shareable entry card

## Outcome

Public entry pages (`/u/[username]/[date]`) serve a dynamic OG image that
carries the entry's opening clause, the author's display name, the date, and
the mosaic motif on warm cream — so a shared link shows the content instead
of the generic site card.

## Why

Sharing a published entry currently shows the root ember OG image (mosaic +
wordmark). A per-entry card makes shares richer without changing the publish
model or exposing private data. Published entries are already public; this
only improves how they look when linked.

## Scope

- **`src/lib/og-utils.ts`** — pure helper `openingClause(response, maxLen)`
  that extracts the opening clause from the first paragraph of an entry response,
  truncated at `maxLen` characters (default 80) at a word boundary.

- **`src/lib/__tests__/og-utils.test.ts`** — unit tests covering short text
  (no truncation), exact-boundary, over-boundary (word-boundary truncation),
  multi-paragraph input (first para only), and empty string.

- **`src/app/u/[username]/[date]/opengraph-image.tsx`** — Next.js file-based
  image route. Fetches profile + published entry via the Supabase anon client.
  Renders: ember wordmark (top-left), entry excerpt (serif, 36px), display name
  + formatted date (attribution, bottom-left), mosaic motif (right). Falls back
  to the generic ember layout (wordmark + tagline + mosaic) when the entry is
  not found, not published, or a fetch error occurs. `force-dynamic`; caches
  at Vercel CDN edge per standard Next.js image-route semantics.

- **`src/app/u/[username]/[date]/page.tsx`** — update `generateMetadata` to
  remove the explicit `openGraph.images` and `twitter.images` arrays so the
  file-based `opengraph-image.tsx` is the sole source. No other page change.

- **`apps/e2e/tests/brand.spec.ts`** — add two tests: (1) the per-entry OG
  image route returns 200 + `image/png` for a non-existent entry (fallback
  path); (2) the `<meta property="og:image">` tag on a real-looking (404)
  public entry page URL is absent or well-formed (no broken reference).

## Decisions (pre-made)

- `force-dynamic` on the image route — entries change after publish toggles;
  Vercel CDN handles edge caching.
- Fallback to generic ember layout rather than returning an error — prevents
  broken image previews when a link is shared after an entry is unpublished.
- Font loading reuses the same Google Fonts + TTF pattern as the root
  `opengraph-image.tsx`. Module-level cache warms across serverless container
  reuse.
- `openingClause` lives in `src/lib/og-utils.ts` (not inside the image route
  file) so it can be unit-tested without pulling in the Next.js OG runtime.
