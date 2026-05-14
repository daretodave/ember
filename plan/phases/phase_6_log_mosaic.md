# Phase 6 — Log + mosaic

## Outcome

`/log` renders the authenticated user's 60-day mosaic with hover tooltips and
entry counts. `/log/[date]` shows a single past entry (read-only). Every tile
in the mosaic links to its date.

## Why

The mosaic is ember's primary identity artifact. Without it, `/today` is a
write-only box with no sense of accumulation. The log closes the loop: you
write today, you see all sixty days as a quiet record of attention.

## Scope

### Pages
- `/log` — auth-required server component; 60-day mosaic + most-recent entry
- `/log/[date]` — auth-required server component; single entry view (read-only)

### Lib
- `src/lib/entries.ts` — add `get60DayEntries(supabase, userId)` and
  `getEntryByDate(supabase, userId, date)`
- `src/lib/prompts.ts` — add `getPromptForDate(isoDate)` for per-date lookup

### Components
- `src/app/log/LogMosaic.tsx` — client component; 60-tile interactive grid
  with hover tooltip (date + 80-char excerpt), staggered fade-in animation,
  each tile a link to `/log/[date]`

## Design reference

`design/Ember · Log.html` — the authoritative spec. Port exactly.

Key elements:
- **Header:** lockup (glyph + wordmark) + nav with "log" marked current
- **Mosaic section:** "your past sixty days" caption, `mosaic mosaic--lg`
  (32px tiles, 8px gap), interactive tooltip in mono on hover
- **Count line:** "52 days written. 8 quiet. 4 published." — Source Serif 4
  20px; muted italic for the second half
- **Divider:** 1px border hairline
- **Most-recent entry:** mono date header, prompt at 24px serif (h1), task row
  with check mark, prose response at 17px serif
- **Entry footer:** "showing the most recent." + privacy status text
- **`/log/[date]`:** same header; date stamp, prompt, task, response (or quiet
  empty state if no entry for that day); back link to `/log`

## Tile states (from design tokens)

| state | appearance |
|---|---|
| `empty` | transparent, 1px ink-faint border |
| `filled` | solid accent fill |
| `today` | accent fill + 2px paper ring + 1px accent halo |
| `published` | accent fill + 4px accent-2 inset |

Tile ordering: oldest first (60 days ago at top-left, today near
bottom-right).

## Decisions (pre-decided)

- **Publish action:** not in this phase. The entry footer shows privacy status
  as text only ("private" / "published"). The interactive publish toggle ships
  in phase 8.
- **Edit action:** not in v1. The design explicitly calls this a v1.5 stretch.
  Show entries read-only.
- **Future dates:** if `/log/[date]` receives a future date, return 404.
- **Invalid date format:** return 404.
- **No entry on a past date:** show prompt + task + empty response note
  ("no entry for this day") rather than a hard 404 — the URL is valid even
  if the user didn't write that day.

## Tests

### Unit (Vitest)
- `src/lib/__tests__/log.test.ts`
  - `get60DayEntries` — returns map keyed by date; empty map on error
  - `getEntryByDate` — returns entry or null; null on error
  - `getPromptForDate` — deterministic: same date always returns same prompt

### E2E (Playwright)
- `apps/e2e/tests/log.spec.ts`
  - `/log` redirects unauthenticated users to `/signin`
  - `/log/2026-01-01` redirects unauthenticated users to `/signin`
  - No horizontal overflow at 375px on `/signin` redirect

## Cross-link retrofits

None required. Nav links to `/log` are already present in the `/today` header.
The DayStrip on `/today` already links "see all sixty" to `/log`.
