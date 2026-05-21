# Phase 19 — Installable PWA + offline draft persistence

## Outcome
Make ember installable on mobile and resilient when offline. Complete the web app manifest
(`display: standalone`, 192×192 and 512×512 PNG icons), add a service worker for app-shell
caching and offline navigation, and persist in-progress `/today` entries to IndexedDB so
a draft is never lost to a dropped connection.

## Routes / API endpoints / CLI surface
No new routes. Changes are infrastructure only: `public/sw.js`, manifest updates, a new
`'use client'` registrar in the root layout, and draft persistence wired into `TodayEntry`.

## Content / data reads
No new server reads. The draft store is client-only (IndexedDB).

## Files to create / modify

| File | Action | Notes |
|---|---|---|
| `src/app/manifest.ts` | modify | `display: 'standalone'`; add 192×192 + 512×512 icon entries |
| `src/app/icon-192.tsx` | create | Next.js dynamic image route — 192×192 PNG, same visual as apple-icon |
| `src/app/icon-512.tsx` | create | Next.js dynamic image route — 512×512 PNG, same visual as apple-icon |
| `public/sw.js` | create | Service worker: app-shell install/activate; network-first nav, cache-first assets; offline fallback to cached shell |
| `src/components/pwa/ServiceWorkerRegistrar.tsx` | create | `'use client'` component; registers `/sw.js` in `useEffect`; renders null |
| `src/app/layout.tsx` | modify | Import + render `<ServiceWorkerRegistrar />` |
| `src/lib/draft-store.ts` | create | IndexedDB draft utilities: `getDraft`, `saveDraft`, `clearDraft` |
| `src/app/today/TodayEntry.tsx` | modify | Load draft on mount; debounce-save on change; online/offline detection; "saved locally — will sync" indicator; clear draft on successful server save |
| `src/lib/__tests__/draft-store.test.ts` | create | Unit tests for draft-store (jsdom environment, fake-indexeddb not available — test with real jsdom IndexedDB or mock at IDB boundary) |
| `src/app/today/__tests__/OfflineDraft.test.tsx` | create | Unit tests: draft loaded on mount; draft cleared on server save; offline indicator text |
| `apps/e2e/tests/brand.spec.ts` | modify | Add: manifest display:standalone; `/sw.js` returns 200 |

## Service worker spec

**Cache name:** `ember-shell-v1`

**Install:** cache `['/', '/signin', '/today', '/log', '/settings']`. Call `self.skipWaiting()`.

**Activate:** delete all caches with names ≠ `ember-shell-v1`. Call `self.clients.claim()`.

**Fetch handler:**
- Skip non-GET and any request whose pathname starts with `/api/` or `/auth/`.
- Navigation requests (`request.mode === 'navigate'`): network-first; on network success,
  update the cache entry; on network failure, serve cached match or fall back to cached `/`.
- All other eligible GETs: cache-first.

## IndexedDB draft-store spec

DB name: `ember-drafts` | Object store: `drafts` | Version: 1  
Key: ISO date string `YYYY-MM-DD` | Value: `{ response: string; taskDone: boolean }`

Functions (all exported from `src/lib/draft-store.ts`):
- `getDraft(date: string): Promise<Draft | null>` — returns stored draft or null; swallows
  errors (SSR / private-browsing environments may throw).
- `saveDraft(date: string, draft: Draft): Promise<void>` — upserts; swallows errors.
- `clearDraft(date: string): Promise<void>` — deletes; swallows errors.

## TodayEntry modifications

**Mount:** if `initialEntry` is null, call `getDraft(date)` and hydrate `response` +
`taskDone` state. Show save-state `'draft'` if a draft was found.

**On change:** debounce 500ms; call `saveDraft(date, { response, taskDone })`.

**Online/offline detection:** `useState` for `isOnline` seeded from `navigator.onLine`.
In `useEffect` subscribe to `window` `online`/`offline` events; update `isOnline`.

**Save indicator text (priority order):**
1. `saveState === 'saving'` → "saving..."
2. `saveState === 'error'` → shown via existing `saveError` element
3. `!isOnline && saveState !== 'saved'` → "saved locally — will sync"
4. `saveState === 'saved'` → `formatSavedTime(savedAt)`
5. `saveState === 'draft'` → "draft restored"
6. else → "not yet saved"

**On successful server save:** call `clearDraft(date)` (fire-and-forget).

**On reconnect (`online` event):** if `response` is non-empty and `saveState !== 'saved'`,
auto-trigger `handleSave()`.

## Decisions made upfront — DO NOT ASK

1. **No `next-pwa` dependency.** Manual service worker in `public/` keeps the dependency
   surface zero and gives full control. The SW is static JS — no build-step needed.

2. **Network-first for navigation, cache-first for assets.** Navigation routes must
   reflect fresh server-rendered content when online. Static assets are stable between
   deploys and benefit from cache-first.

3. **API and auth routes are excluded from SW caching.** `/api/*` and `/auth/*` must
   always hit the server; caching auth or entry writes would corrupt state.

4. **IndexedDB errors are swallowed.** Safari private browsing and some SSR contexts throw
   on IDB access. The draft is a resilience layer, not the primary store; silent failure
   is the right posture.

5. **Draft loaded only when `initialEntry` is null.** A server-confirmed entry takes
   precedence. If the user already saved, we never overwrite with a local draft.

6. **Auto-retry on reconnect only when `saveState !== 'saved'`.** If the entry was
   successfully saved before going offline, no retry needed.

7. **Debounce 500ms for IndexedDB writes.** Aggressive-enough to catch all keystrokes
   without thrashing IDB on every character.

8. **No `idb` or `localforage` dependency.** Raw IndexedDB wrapped in promises is sufficient
   for the narrow interface we need.

9. **Icon routes at `/icon-192` and `/icon-512`.** Next.js image routes (same pattern as
   `apple-icon.tsx`) keep everything colocated in `src/app/`; no `public/` static PNGs
   needed.

10. **`ServiceWorkerRegistrar` renders null.** It's a side-effect component; returning null
    avoids any DOM footprint.

11. **SW version strategy: single `ember-shell-v1` cache.** When the SW ships a new version,
    the cache name changes. For v1 this is sufficient; cache-busting strategy is a v2 concern.

## Mobile reflow
No new rendered UI beyond the save indicator text variants in `TodayEntry`. All already
responsive.

## Pages × tests matrix

| Surface | Unit | E2E |
|---|---|---|
| `draft-store.ts` | `draft-store.test.ts` — getDraft/saveDraft/clearDraft round-trip (jsdom IDB) | — |
| `TodayEntry` offline | `OfflineDraft.test.tsx` — draft load on mount; auto-clear on save; offline indicator | `today.spec.ts` — existing tests unchanged |
| `manifest.ts` | — | `brand.spec.ts` — display:standalone assertion |
| `public/sw.js` | — | `brand.spec.ts` — GET /sw.js returns 200 |

## Verify gate
`pnpm verify` — typecheck + test:run + build + e2e. All green before commit.

## Commit body template
```
feat: installable PWA + offline draft persistence — phase 19

- manifest: display:standalone, add 192×192 and 512×512 PNG icon routes
- public/sw.js: app-shell service worker (network-first nav, cache-first assets)
- ServiceWorkerRegistrar: client component registers /sw.js in root layout
- draft-store: IndexedDB utilities (getDraft / saveDraft / clearDraft)
- TodayEntry: load draft on mount, debounce-save on keystroke, clear on server save
- Save indicator: "saved locally — will sync" when offline
- Auto-retry save on reconnect when entry is unsaved
- Unit tests: draft-store round-trip, TodayEntry offline behavior
- E2E: manifest display:standalone + /sw.js endpoint assertions

Decisions:
- Manual SW, no next-pwa: zero new dependencies, full control
- IDB errors swallowed: resilience layer must not crash the entry surface
- Draft only when initialEntry is null: server truth always takes precedence

Closes #<phase-issue>

Cloud-Run: https://github.com/daretodave/ember/actions/runs/26253541568
```

## DoD
- [ ] `manifest.ts` has `display: 'standalone'` and 192/512 icon entries.
- [ ] `/icon-192` and `/icon-512` routes return 200 with image/png.
- [ ] `/sw.js` returns 200 with correct MIME.
- [ ] SW is registered in root layout via `ServiceWorkerRegistrar`.
- [ ] `draft-store.ts` unit tests pass.
- [ ] `TodayEntry` offline unit tests pass.
- [ ] E2E: manifest standalone + sw.js tests pass.
- [ ] `pnpm verify` green.
- [ ] Committed, pushed, deploy green.

## Follow-ups (out of scope)
- Cache-busting strategy when deploying new SW (bump `CACHE_NAME`).
- Background sync API for deferred save (requires HTTPS + advanced SW support).
- Push notification groundwork (explicitly out of scope per bearings.md).
- Offline indicator visible outside the entry surface (e.g. in the nav).
