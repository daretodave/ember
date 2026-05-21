# Phase 17 — On this day

> Surface a single quiet reflection line on `/today` when the user has a prior
> entry on the same calendar day (month + day) in an earlier year.

## Outcome

Below the entry surface on `/today`, a single sentence appears — "a year ago,
you wrote — {opening clause}" — linking to the historical entry. Renders
nothing when no prior same-day entry exists. No new route, no new graphic, no
analytics.

---

## Routes / API endpoints / surface

- **No new route.** Feature lives entirely on `/today`.
- The `onThisDay` entry is fetched server-side in `app/today/page.tsx` and
  passed as a prop to a new `OnThisDay` server component.

---

## Content / data reads

| Helper | Call | Use |
|---|---|---|
| `getOnThisDay` (new) | `entries.ts` | Returns the most recent entry the user wrote on the same MM-DD in a prior year (at most one row). |

### `getOnThisDay` specification

```typescript
export async function getOnThisDay(
  supabase: SupabaseClient,
  userId: string,
  today: string,          // YYYY-MM-DD
): Promise<Entry | null>
```

- Extracts `MM-DD` from `today`.
- Generates candidate year offsets 1–10 (i.e., `(thisYear-1)-MM-DD` down to
  `(thisYear-10)-MM-DD`).
- Queries `entries` with `.in('date', candidateDates).eq('user_id', userId)`.
- Returns the row with the largest date (most recent match), or `null` if
  none.
- No RPC needed; works with the existing PostgREST client.

---

## Components / handlers

| Name | Type | New / reused |
|---|---|---|
| `OnThisDay` | Server component | New (`src/app/today/OnThisDay.tsx`) |
| `getOnThisDay` | Lib function | New (`src/lib/entries.ts`) |
| CSS classes (`onThisDay`, `onThisDayText`, `onThisDayLink`) | Module | New entries in `src/app/today/page.module.css` |

`OnThisDay` receives `entry: Entry | null` and `todayYear: number`. When
`entry` is null it returns `null`. When found it renders a quiet `<aside>`
with one sentence.

---

## Copy

Voice: lower-case, no exclamation, "here is something to attend to" framing
(per `bearings.md`).

| Years back | Copy pattern |
|---|---|
| 1 | `a year ago, you wrote — {clause}` |
| 2 | `two years ago, you wrote — {clause}` |
| 3 | `three years ago, you wrote — {clause}` |
| 4+ | `{N} years ago, you wrote — {clause}` |

`{clause}` = first 80 characters of `entry.response`, trimmed. If the full
response exceeds 80 chars, append `…`. If the response is blank (edge case
where `task_done` was set but no text), the block is suppressed (treat as
null).

The `{clause}` is wrapped in a `<Link href="/log/YYYY-MM-DD">` so the reader
can navigate to the original.

---

## Visual / layout

- One `<aside>` with a hairline `border-top: 1px solid var(--color-border-faint)`.
- Placed below `<TodayEntry>` in `page.tsx`, above `<DayStrip>`.
- Font: `var(--font-serif)` at `var(--type-14)`, color `var(--color-ink-muted)`.
- No icon. No label. No heading. Just the sentence.
- Link color: `var(--color-ink)`, underlined with `border-bottom: 1px solid
  var(--color-border)` (matching the `stripLink` pattern already in use).
- No animation; no shadow; no gradient. Static render.
- Mobile (≤ 480px): same — already single-column, padding inherits from
  `.main` wrapper.

---

## SEO / metadata

No change. Feature is authenticated-only and not crawlable.

---

## Empty / loading / error states

| State | Behavior |
|---|---|
| No prior same-day entry | Component returns `null`; nothing rendered |
| `entry.response` is blank | Treat as null; nothing rendered |
| DB error in `getOnThisDay` | Returns `null` (log error server-side); nothing rendered |
| Loading | `/today/loading.tsx` already covers the page skeleton |

---

## Decisions made upfront — DO NOT ASK

1. **Same MM-DD in prior years only** (not same day-of-month across arbitrary
   months). "On this day" is the anniversary read, not a rolling-30-day one.
   Richer than month-offset; cleaner than arbitrary lookback.

2. **Single result, most recent first.** If the user wrote on May 21 in both
   2025 and 2024, show 2025 only. One line, one link, no list.

3. **10-year lookback cap** (candidate dates `[thisYear-1 … thisYear-10]`).
   Beyond 10 years is edge-case noise; the cap keeps the candidate array tiny.

4. **80-char opening clause.** Enough to convey tone without spoiling the
   entry. Truncation at a word boundary is not guaranteed (trimming at 80
   chars then appending `…` is sufficient for this use).

5. **`<aside>` not `<section>`.** The block is supplementary; it does not
   anchor page structure.

6. **No "on this day" heading.** The copy pattern is self-explanatory. A
   heading would add visual weight that breaks the calm voice.

7. **No animation.** Motion budget is fully consumed (mosaic fade-in +
   tile hover). This block is static.

8. **Suppress if blank response.** A record with `task_done=true` and empty
   `response` has nothing meaningful to surface.

---

## Mobile reflow

No new breakpoint needed. The `<aside>` sits inside the same `max-width: 720px`
column used by the rest of `/today`. The existing `@media (max-width: 480px)`
block in `page.module.css` adjusts padding for the whole column, which covers
this block automatically.

---

## Pages × tests matrix

| Surface | Unit | E2E |
|---|---|---|
| `getOnThisDay` (no match) | yes — returns null | — |
| `getOnThisDay` (1 match) | yes — returns entry | — |
| `getOnThisDay` (multiple matches) | yes — returns most recent | — |
| `OnThisDay` renders null when entry=null | yes (React render test) | — |
| `OnThisDay` renders copy + link when entry provided | yes | — |
| `/today` redirect (unauthenticated) | existing | existing |
| `/today` no horizontal overflow at 375px | existing | existing |

Unit tests live in `src/lib/__tests__/entries.test.ts` (new `getOnThisDay`
cases appended) and `src/app/today/__tests__/OnThisDay.test.tsx` (new file).

---

## Verify gate

```
pnpm verify   # typecheck → test:run → build → e2e
```

All existing e2e tests continue to pass (no new page, no change to redirect
behavior).

---

## Commit body template

```
feat: on this day — phase 17

- adds getOnThisDay() to src/lib/entries.ts; queries same MM-DD in prior years
- new OnThisDay server component in src/app/today/OnThisDay.tsx
- wired into today/page.tsx below TodayEntry, above DayStrip
- renders nothing when no prior same-day entry exists
- copy adapts: "a year ago / two years ago / N years ago, you wrote —"
- opening clause links to /log/YYYY-MM-DD; suppressed if response is blank
- unit tests: getOnThisDay (null, single, multi-year) + OnThisDay component render
- no new route, no new graphic, no analytics

Decisions:
- same MM-DD in prior years (anniversary model, not rolling-30-day)
- single result, most recent match only
- 10-year lookback cap (tiny candidate array, no RPC needed)
- 80-char opening clause with … truncation
- suppressed if entry.response is blank

Closes #<phase-issue>

Cloud-Run: https://github.com/daretodave/ember/actions/runs/26242415122
```

---

## DoD

- [ ] `getOnThisDay` added to `src/lib/entries.ts`
- [ ] Unit tests for `getOnThisDay` passing
- [ ] `OnThisDay.tsx` component created with unit tests
- [ ] Wired into `today/page.tsx`
- [ ] CSS classes added to `page.module.css`
- [ ] `pnpm verify` green
- [ ] Committed + pushed; deploy green

---

## Follow-ups (out of scope)

- Rolling-month lookback (same day-of-month in recent months) — more
  hits for new users but less "anniversary" feel; defer.
- "On this day" for multiple years (carousel) — design work needed; defer.
- Personalized prompt that factors in the historical entry — phase 12
  territory; defer.
