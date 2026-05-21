# Phase 14 — Brand assets

## Outcome

Favicon set (served at `/icon`, `/apple-icon`, and `public/favicon.ico`), OG
image (1200×630 mosaic grid on warm cream, at `/opengraph-image`), and a web
app manifest (`/manifest.webmanifest`). Metadata blocks in the root layout and
public profile are wired to the new images.

## Why

Phase 0–13 shipped a fully functional app with no brand assets. Every share
shows a blank Twitter card; installing to a home screen shows no icon. This
phase closes that gap. It is purely additive — no app logic changes.

## Scope

### Asset routes (Next.js App Router conventions)

| File | Served at | Size |
|---|---|---|
| `src/app/opengraph-image.tsx` | `/opengraph-image` | 1200×630 |
| `src/app/icon.tsx` | `/icon` (favicon) | 32×32 |
| `src/app/apple-icon.tsx` | `/apple-icon` | 180×180 |
| `src/app/manifest.ts` | `/manifest.webmanifest` | — |

All four use Next.js built-in file conventions (App Router special files).
No new packages required — `next/og`'s `ImageResponse` is bundled with
Next.js 15.

### OG image design (`opengraph-image.tsx`)

- Background: warm cream `#f8f5ef` (`--color-paper`)
- Left column: wordmark "ember" at 48px serif, tagline below at 20px; both
  in `#2a2620` (`--color-ink`)
- Right column: 6×10 mosaic grid, 16px tiles, 4px gaps, some tiles filled
  with `#c2683f` (`--color-accent`), empty tiles have `#b8b2a8` border
  (`--color-ink-faint`)
- Font: load Source Serif 4 from Google Fonts at edge runtime for the text;
  fall back to Georgia if the fetch fails (non-fatal, log warning)
- No tagline truncation; fits on one line at 20px Inter
- `runtime = 'edge'`

### Icon design (`icon.tsx` and `apple-icon.tsx`)

- Square, warm cream background
- Lowercase "e" in Source Serif 4 / Georgia at roughly 60% of height,
  ember accent color `#c2683f`
- `icon.tsx`: 32×32, `contentType = 'image/x-icon'` not available → use
  `image/png`, Next.js routes it as favicon
- `apple-icon.tsx`: 180×180, same design, slightly larger padding

### Manifest (`manifest.ts`)

```ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ember',
    short_name: 'ember',
    description: 'ten minutes of intention before the day swallows you',
    start_url: '/',
    display: 'browser',
    background_color: '#f8f5ef',
    theme_color: '#c2683f',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
```

`display: 'browser'` (not `standalone`) — Phase 19 upgrades this to
`standalone` with full PWA treatment. This manifest is Phase 14's minimal
footprint; Phase 19 completes it.

### Root layout updates (`layout.tsx`)

Add `icons` and `manifest` to the existing `metadata` export:

```ts
icons: {
  icon: '/icon',
  apple: '/apple-icon',
},
manifest: '/manifest.webmanifest',
openGraph: {
  ...existing,
  images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }],
},
twitter: {
  card: 'summary_large_image',
  ...existing,
  images: ['/opengraph-image'],
},
```

### Public profile metadata update (`u/[username]/page.tsx`)

Update `generateMetadata` to include images pointing to the global OG route:

```ts
openGraph: {
  ...existing,
  images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }],
},
twitter: {
  card: 'summary_large_image',
  ...existing,
  images: ['/opengraph-image'],
},
```

## Decisions (pre-made)

- **Next.js ImageResponse, not static PNGs.** App Router's built-in file
  conventions (`opengraph-image.tsx`, `icon.tsx`, etc.) are the preferred
  path per the brander spec. No satori/resvg/sharp packages needed.
- **Global OG image only.** Per-user or per-entry dynamic images are a
  follow-up (Phase N+). The global mosaic grid is a valid brand-consistent
  share image for all routes.
- **`display: 'browser'` in manifest.** Phase 19 owns PWA (`standalone` +
  service worker + offline). Phase 14 only needs the manifest to exist so
  the browser icon and theme color work.
- **Twitter card upgraded to `summary_large_image`.** The current root layout
  uses `summary` (no image). Since we now have a 1200×630 image, the richer
  card is correct.
- **Font fetch at edge runtime.** Source Serif 4 fetched from fonts.gstatic.com
  in `opengraph-image.tsx`. If the fetch fails, the render proceeds with
  Georgia. This is the standard next/og pattern.
- **No `favicon.ico` static file.** Modern browsers use the `/icon` PNG route.
  For legacy `favicon.ico` requests, Next.js App Router falls through to the
  `app/favicon.ico` convention — since we're using `icon.tsx` instead, the
  browser gets a 404 for `favicon.ico` which is acceptable (it will use the
  PNG link tag). If a static ICO is needed later, it goes in `public/`.

## Tests

- **Unit:** none needed — these are file-convention routes with no branch logic.
- **E2E:** extend `tests/e2e/landing.spec.ts` (or add `brand.spec.ts`) to:
  - GET `/opengraph-image` → 200, content-type image/png
  - GET `/icon` → 200, content-type image/png
  - GET `/manifest.webmanifest` → 200, JSON with `name: 'ember'`
  - Root page `<head>` contains `<link rel="manifest">` and `<link rel="icon">`

## Verify gate

```bash
pnpm verify
# typecheck → test:run → build → e2e
```

TypeScript will flag any `ImageResponse` API misuse at `typecheck` time.
Build validates the manifest export type. E2E confirms HTTP responses.

## Commit body template

```
feat: brand assets — favicon, OG image, manifest — phase 14

- opengraph-image.tsx: 1200×630 mosaic grid on warm cream for all routes
- icon.tsx: 32×32 "e" favicon in ember accent
- apple-icon.tsx: 180×180 apple touch icon
- manifest.ts: web app manifest (display: browser; Phase 19 adds standalone)
- layout.tsx: icons + manifest + OG image wired into root metadata
- u/[username]/page.tsx: OG image added to public profile metadata
- e2e: brand.spec.ts asserts all four asset routes return 200

Decisions:
- next/og ImageResponse (no new deps) over static PNG generation
- global OG image only; per-entry dynamic cards deferred to follow-up
- summary_large_image replaces summary for the twitter card type
```

## DoD

- [ ] `/opengraph-image` returns 1200×630 PNG with mosaic grid
- [ ] `/icon` returns 32×32 PNG
- [ ] `/apple-icon` returns 180×180 PNG
- [ ] `/manifest.webmanifest` returns JSON with `name: ember`
- [ ] Root layout `<head>` includes manifest link and icon link tags
- [ ] Public profile `<head>` includes OG image meta tags
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- Per-user or per-entry dynamic OG images (would need DB access at edge)
- Static `favicon.ico` in `public/` for legacy clients
- Phase 19 upgrades manifest to `standalone` + service worker
