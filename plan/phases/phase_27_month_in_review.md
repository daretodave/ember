# Phase 27 — Month in review

## Outcome

On `/log`, during the first seven days of a new month, a single quiet recap
line appears above the mosaic for the month that just closed: entry count and
one observational clause. Renders nothing when the prior month has zero entries.

## Why

After weeks of practice users have no passive signal of how a full month went.
A single factual line — "in may — 14 entries. the longest sat on the 12th." —
gives that without streaks, praise, or pressure. Derived entirely from the
entries already fetched for the mosaic; no new query, no new route, no schema
change.

## Scope

- **`src/lib/monthInReview.ts`** — pure function `getMonthInReview(entries,
  today)` that returns `null` if today is not day 1–7 of the month, or if the
  prior month has zero entries in the window; otherwise returns
  `{ monthLabel: string, count: number, longestDate: string }`.

- **`src/lib/__tests__/monthInReview.test.ts`** — unit tests covering:
  - Not within first 7 days → null
  - Within first 7 days, zero prior-month entries → null
  - Within first 7 days, one entry → correct label + longestDate
  - Within first 7 days, multiple entries → correct count, longestDate picks
    the entry with the most response characters

- **`src/app/log/page.tsx`** — call `getMonthInReview(entries, today)`, pass
  result into the JSX. Render a `<p>` recap line above the mosaic when non-null.
  No new component file needed (single `<p>` inline).

- **`src/app/log/page.module.css`** — add `.monthRecap` class: Source Serif 4,
  same muted color as the mosaic count line, no additional spacing beyond the
  existing section rhythm.

- **No e2e change needed** — existing `log.spec.ts` already checks the page
  renders without error; the month-in-review line only appears on specific
  calendar days and is absent in the CI test date window.

## Voice model

```
in {month} — {count} entries. the longest sat on the {ordinal}.
```

- `{month}` — lowercase full month name (e.g. "may")
- `{count}` — integer
- `{ordinal}` — day-of-month as ordinal (1st, 2nd, 3rd, 12th…)

Renders nothing when count is zero. No praise. No streak language. No
exclamation.

## Decisions (pre-made)

- "Longest" is measured by response character count. Ties go to the earliest
  date in the month (stable, deterministic).
- The 60-day window always covers the full prior month when today is day 1–7
  (a 31-day prior month + 7 days current = 38 days; the window is 60 days).
- No `[needs-user-call]` for the edge case where today is day 8+: the recap
  simply renders nothing — clean disappearance, no flash of content.
- Ordinal suffix is computed in TypeScript, not via a library.
