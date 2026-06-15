# Phase 32 — Year in review

## Outcome

On `/log`, during the first seven days of January, a single quiet recap block
appears above the mosaic for the calendar year that just closed: total entries
written and the quietest month. Renders nothing outside that window or when the
prior year has zero entries.

## Why

Extends the month-in-review pattern (phase 27) to the calendar year. A user who
has practiced for a year or more has no passive signal of how that year went. A
single factual line — "in 2025 — 213 entries. the quietest stretch was august."
— honours the practice without streak framing or scoreboard pressure. Derived
entirely from a single query against existing entries; no new schema.

## Scope

- **`src/lib/yearInReview.ts`** — pure function `getYearInReview(entries, today)`
  that accepts a `Map<string, Entry>` of the prior year's entries and the current
  date string; returns `null` when today is not January 1–7 or when the map has
  zero entries; otherwise returns `{ yearLabel: number, count: number,
  quietestMonth: string }`.

- **`src/lib/__tests__/yearInReview.test.ts`** — unit tests covering:
  - Not in January → null
  - January but day > 7 → null
  - January 1–7 but zero prior-year entries → null
  - Single entry → correct label, count 1, quietestMonth is that entry's month
  - Multiple entries → correct count; quietestMonth picks the calendar month
    with the fewest entries (earliest month on ties)
  - All months represented → quietest is the one with fewest entries
  - January year-boundary: today is 2026-01-03, prior year is 2025

- **`src/lib/entries.ts`** — add `getYearEntries(supabase, userId, year)` that
  fetches all entries for the given calendar year (the 60-day mosaic window does
  not cover a full prior year).

- **`src/app/log/page.tsx`** — when today is January 1–7, query prior year
  entries via `getYearEntries`, call `getYearInReview`, render a `<p>` recap
  above the month recap (and the mosaic heading) when non-null.

- **`src/app/log/page.module.css`** — add `.yearRecap` class: same styling as
  `.monthRecap` (Source Serif 4, muted, italic, centered). The year recap sits
  above the month recap; both can appear on the same day only in January 1–7.

- **No e2e change needed** — existing `log.spec.ts` tests the unauthenticated
  redirect; the year-in-review line only appears on January 1–7 and will not be
  present during normal CI runs.

## Voice model

```
in {year} — {count} entries. the quietest stretch was {month}.
```

- `{year}` — four-digit integer (e.g. 2025)
- `{count}` — integer
- `{month}` — lowercase full month name (e.g. "august")

Renders nothing when count is zero. No praise. No streak language. No
exclamation. "Quietest" is the month with the fewest entries in the prior year;
ties resolved by picking the earliest calendar month.

## Decisions (pre-made)

- **Window: January 1–7 only**, matching the month-in-review cadence. The recap
  disappears quietly on day 8. No linkable `/log/[year]` in v1 — inline is the
  lighter touch and avoids a new URL family.
- **Separate query (`getYearEntries`)** because the 60-day mosaic window covers
  only ~Nov–Jan when today is early January, missing most of the prior year.
  Query is conditional (only executed when in the January 1–7 window).
- **"Quietest" = fewest entries among calendar months that have at least one
  entry**, earliest month on ties. Entirely-skipped months (0 entries) are
  excluded — "the quietest stretch was X" implies X was a period of practice,
  just lighter than others. If only one month has entries, that month is
  quietest by default.
- **Ordinal suffix not used for years** — voice is "in 2025" not "the year 2025".
- No `[needs-user-call]` for the case where all 12 months have equal counts:
  January (index 0) wins the tie and the recap still renders.
