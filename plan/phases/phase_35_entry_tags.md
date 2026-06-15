# Phase 35 — Entry tags + themed browsing

> Status: planned
> Experiment: yes

## Outcome

Optional lightweight tags per entry — a comma-separated list stored on the entry — with a tag filter on `/log` that narrows the mosaic and entry list to a chosen tag.

## Why

Entries accumulate with no way to trace a theme across time. Tags give a practitioner a quiet organizational layer: mark recurring threads ("work", "travel", "family") and browse them later. Tags are private in v1 — no cross-user discovery, no counts-as-achievement framing.

## Scope

1. **Migration** — add `tags text[] not null default '{}'::text[]` to the `entries` table with a GIN index for fast array containment queries.

2. **Type layer** — add `tags: string[]` to the `Entry` type in `src/lib/entries.ts`. Add `sanitizeTag` and `sanitizeTags` utility functions: each tag is lowercase, max 30 chars, `[a-z0-9][a-z0-9-]*` pattern; max 5 tags per entry; duplicates dropped.

3. **API** — `/api/entries` POST accepts optional `tags` (string array). Validate per `sanitizeTags`; store the sanitized result. Tags not in the payload leave existing tags unchanged if omitted (or clear them if an empty array is sent).

4. **`/today` entry surface** — a small text input below the check-in row and above the response label. Label: "tags". Placeholder: "word, word." Helper hint: "optional. up to five tags, comma-separated." Tags displayed as a comma list; parsed on blur and on save. Max 5; individual max 30 chars. Never required to save. Included in the save payload. Included in the focus-mode overlay. Draft-store includes the raw tag string.

5. **`/log/[date]` read view** — when `tags` is non-empty, render a quiet chip row below the check-in annotation (before the response body). Each chip reads as a plain lowercase word. Renders nothing when empty.

6. **`/log/[date]` edit view** — a text input pre-filled with comma-joined tags. User can add, remove, reorder. Validated and stored on save.

7. **`/log` tag filter** — the server component reads `searchParams.tag`. When a tag is active: (a) the mosaic tiles use `filtered_state`: a tile is its normal state only if the entry carries the tag, otherwise `empty`; (b) the entry list section shows a list of matching entries by date (links to `/log/[date]`) rather than the single most-recent article. A `LogTagFilter` client component renders the set of distinct tags found in the 60-day window as clickable chips; the active tag is visually indicated; clicking a chip navigates to `?tag=<chip>`, clicking the active chip clears the filter.

8. **Tag browsing voice** — tag chips read as plain lowercase words; no counts, no aggregation, no "most-used" framing. The filter affordance is a quiet row of chips, not a sidebar or panel.

## Decisions

- **Schema**: `text[]` + GIN over a normalized join table — consistent with the FTS index in phase 31, avoids a join for the common read path.
- **Tag rules**: `[a-z0-9][a-z0-9-]*`, max 30 chars, max 5 per entry. Hyphens allowed ("long-distance" is one tag). No Unicode beyond ASCII in v1.
- **Public exposure**: tags are not rendered on `/u/[username]/[date]` in v1. The RLS policy returns the full row; the public page simply does not render the field.
- **Filter scope**: the tag filter operates on the 60-day window (same as the mosaic). Tags from older entries are not browsable from `/log` in v1.
- **No new URL family**: `?tag=<tag>` is a query param on `/log`. No `/log/tag/[tag]` route.

## Files affected

- `supabase/migrations/<timestamp>_entry_tags.sql`
- `src/lib/entries.ts` — type update + tag utilities
- `src/app/api/entries/route.ts` — accept + validate tags
- `src/app/today/TodayEntry.tsx` — tags input
- `src/app/today/page.module.css` — tag styles
- `src/lib/draft-store.ts` — add tags to Draft type
- `src/app/log/page.tsx` — tag filter + filtered mosaic
- `src/app/log/page.module.css` — tag chip styles
- `src/app/log/LogTagFilter.tsx` — new client component
- `src/app/log/log-tag-filter.module.css` — new CSS module
- `src/app/log/[date]/EditEntry.tsx` — show + edit tags
- `src/app/log/[date]/page.module.css` — tag chip styles
- Tests: unit (tag utilities) + e2e (tag filter flow)

## Verify gate

`pnpm verify` (typecheck → test:run → build → e2e) must be green.
