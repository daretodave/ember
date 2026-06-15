# Phase 34 — One-word check-in

> Status: planned
> Experiment: yes

## Outcome

An optional single-word check-in captured alongside the day's writing — a mood or weather word ("steady", "rain", "frayed") — with no mandatory field and no aggregation UI in v1.

## Why

The entry surface captures prose response to a prompt, but there is no lightweight signal for how the day actually felt. A one-word note to self fills that gap with minimal friction: it is skippable, private, and surfaces only as a quiet annotation on the log view.

## Scope

1. **Migration** — add nullable `checkin_word varchar(30)` column to the `entries` table. Default null. No index needed in v1.

2. **Type layer** — add `checkin_word: string | null` to the `Entry` type in `src/lib/entries.ts`. Update `EntryRow` alias accordingly.

3. **API** — `/api/entries` POST accepts optional `checkin_word`. Validation: strip leading/trailing whitespace; reject if longer than 30 chars after trim; reject if it contains whitespace (must be a single word); allow letters, numbers, hyphens, underscores, and Unicode letters. Null or undefined → stored as null.

4. **`/today` entry surface** — small text input below the task section and above the response label. Placeholder: "one word." Label (visually hidden or inline): "check-in". Never required to save. Included in the save payload. Included in the focus-mode overlay (same tabIndex logic as other controls). Draft-store includes it in the local draft.

5. **`/log/[date]` read view** — when `checkin_word` is non-null, render a quiet annotation line below the task row: `— {checkin_word}` in muted mono type. Renders nothing when null.

6. **`/log/[date]` edit view (EditEntry)** — show the check-in word as an editable text input in edit mode; display-only when not editing.

7. **Public profile view** — `checkin_word` is private by default. Do not surface it on `/u/[username]/[date]` in v1. The existing RLS returns the full row for published entries; the public page simply does not render the field.

## Decisions

- **Validation:** single-word, max 30 chars, no whitespace. Unicode letters allowed (the field is expressive). Hyphens allowed ("wiped-out" is one compound word).
- **Public exposure:** not shown on public profile in v1. The column is readable by the public RLS policy on published entries, but the public page renders only response + task — no checkin_word rendering.
- **No aggregation / trends / counts** in v1 per the brief.
- **Draft store:** the existing `DraftData` shape in `src/lib/draft-store.ts` gets a `checkinWord` field; old drafts (without it) initialize to `''`.

## Files affected

- `supabase/migrations/<timestamp>_checkin_word.sql`
- `src/lib/entries.ts` — type update
- `src/app/api/entries/route.ts` — accept + validate checkin_word
- `src/app/today/TodayEntry.tsx` — check-in input
- `src/app/today/page.module.css` — check-in input style
- `src/app/log/[date]/EditEntry.tsx` — show + edit checkin_word
- `src/app/log/[date]/page.module.css` — annotation style
- `src/lib/draft-store.ts` — add checkinWord to DraftData
- Tests: unit + e2e

## Verify gate

`pnpm verify` (typecheck → test:run → build → e2e) must be green.
