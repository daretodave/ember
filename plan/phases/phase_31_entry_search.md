# Phase 31 — Entry search

> Brief generated autonomously; all decisions resolved upfront.

## Outcome

A quiet search input on `/log` that full-text-searches the authenticated user's
own past entries. Results list links to `/log/[date]` with a short excerpt.
Own entries only; no public search; no new URL family.

## Why

Users with weeks of practice have no way to find a past entry except by
scrolling the mosaic or guessing a date. Search is the spec's only deferred
capability that materially grows the usefulness of the log.

---

## Routes / API surface

| Surface | Method | Auth |
|---|---|---|
| `GET /api/search?q=<query>` | GET | required |
| `/log` (existing, extended) | — | existing |

`/api/search` returns `{ results: Array<{ date: string; excerpt: string }> }`.
Empty `q` returns `{ results: [] }`. Limit: 20 results.

No new page URL. `/log` gains a client component that calls the route.

---

## Data reads

| Helper | Call | Use |
|---|---|---|
| `supabase.from('entries').select(…).textSearch('response', q, …)` | `GET /api/search` | FTS primary |
| `.ilike('response', …)` | `GET /api/search` | ILIKE fallback if FTS errors |

FTS uses `websearch_to_tsquery('english', q)` via Supabase's `.textSearch(…, { type: 'websearch', config: 'english' })`.
ILIKE used only if FTS call returns an error (e.g., Postgres rejects the FTS syntax).

---

## Components / handlers

**New**

- `src/app/api/search/route.ts` — GET handler; auth check; sanitize q; textSearch with ILIKE fallback; 20-row limit
- `src/lib/search.ts` — `sanitizeSearchQuery(q)`, `excerptAround(text, query)` utilities
- `src/app/log/LogSearch.tsx` — `'use client'` component; debounced input (300ms); fetch `/api/search?q=`; result list; quiet states
- `src/app/log/log-search.module.css` — styles for search wrap, input, label, result list, excerpt

**Modified**

- `src/app/log/page.tsx` — import + render `<LogSearch />` between the divider and the entry section

---

## Search spec

- **Query sanitization**: trim whitespace; cap at 200 chars; reject empty
- **FTS**: `textSearch('response', q, { type: 'websearch', config: 'english' })` — uses Postgres `websearch_to_tsquery` (lenient; handles operators, quotes, hyphens gracefully)
- **Fallback**: `.ilike('response', '%q%')` on FTS error
- **Results**: newest-first; fields `date` + `response.slice(0, 120)` excerpt
- **Excerpt** computation: find first occurrence of the first query token in the response; take ~120 chars centered around it; prepend/append `…` if truncated. Falls back to `response.slice(0, 120)`.
- **Result count**: at most 20; no pagination; no count shown (no gamification)
- **Empty query**: `{ results: [] }` — nothing rendered in UI
- **No results**: one quiet line: "nothing found."
- **Error**: one quiet line: "search unavailable."
- **Loading**: no explicit spinner; debounce hides latency

---

## Migration (performance optimization)

`supabase/migrations/20260615000000_entries_fts.sql` — adds a generated
`tsvector` column + GIN index. This is a performance optimization, not a
correctness requirement: `textSearch` works against a `text` column via
`to_tsvector(…)` on-the-fly; the index just prevents seq-scans at scale.

Apply manually via `pnpm db:migrate` after this phase ships.

---

## UI composition (within `/log`)

```
<section aria-label="log entries">          ← existing
  <LogSearch />                             ← inserted here (client component)
  {recentEntry && …}                        ← existing most-recent article
</section>
```

`LogSearch` renders:
1. A `<label>` + `<input type="search">` — 100% width of the content column
2. Results `<ul aria-label="search results">` — each `<li>` is a link to `/log/[date]`
3. Quiet text ("nothing found." / "search unavailable.") when warranted
4. Nothing when query is empty

---

## SEO / metadata

No change — search results are dynamic client-side; no `generateMetadata` impact.

---

## Empty / error states (copy locked)

| State | Copy |
|---|---|
| No results | `nothing found.` |
| Search error | `search unavailable.` |
| Empty query | (nothing) |

---

## Decisions made upfront — DO NOT ASK

1. **Location on /log**: between the divider and the most-recent entry article. Placing it above the mosaic would push the main visual down; placing it in the mosaic section conflicts with the mosaic heading. Below the divider is the natural "browse" area.
2. **No result count**: voice rule — no gamification of discovery.
3. **Excerpt strategy**: JS-side, no `ts_headline` (avoids extra DB round-trip). First-token approach is good enough for the scale.
4. **FTS type**: `websearch` (not `plain` or `phrase`). Handles natural queries gracefully; users don't know FTS syntax.
5. **ILIKE fallback**: silent — the API switches without telling the user. The UX is identical.
6. **Debounce 300ms**: balances responsiveness with API request volume.
7. **20-row limit**: sufficient for a personal log; no pagination for simplicity.
8. **Prompt not searched**: the prompt text isn't stored in the DB; searching only `response` covers the user's own words, which is the useful surface.
9. **'use client' component**: search is interactive; RSC would require page reloads.
10. **No search results on SSR**: the server-rendered `/log` never prefetches search results; the search input starts empty.
11. **Migration is optional for gate pass**: textSearch against a text column works without the generated tsvector column; the migration is shipped for production performance but need not be applied before the verify gate.

---

## Mobile reflow

At 375px: search input stays 100% width (same as existing content column). Results list reads comfortably at `--type-17` serif. No horizontal overflow.

---

## Tests matrix

| File | Tests |
|---|---|
| `src/lib/__tests__/search.test.ts` | `sanitizeSearchQuery`: trim, cap 200, empty → ''; `excerptAround`: hit at start, mid, end, no match → first 120 chars |
| `src/app/api/search/__tests__/route.test.ts` | 401 unauthenticated; 200 empty q → empty results; 200 with results; 500 fallback |
| `src/app/log/__tests__/LogSearch.test.tsx` | renders search input; empty query → no results rendered; renders result list; no-results copy |
| `apps/e2e/tests/auth-flow.spec.ts` | search input present on /log; typing known content (WRITE_CONTENT) → result with matching date appears |

---

## Verify gate

`pnpm verify` (lint:no-uppercase-css → typecheck → test:run → build → e2e)

The search API and component are new; no existing tests are touched except the
auth-flow e2e which is extended (not modified). Verify must be green.

---

## Commit body template

```
feat: entry search on /log — phase 31

- GET /api/search?q= returns FTS-matched entries (websearch_to_tsquery, ILIKE fallback)
- LogSearch client component on /log: debounced input, result list, quiet states
- src/lib/search.ts: sanitizeSearchQuery + excerptAround utilities
- supabase/migrations/20260615000000_entries_fts.sql: generated tsvector + GIN index (apply separately via pnpm db:migrate)
- unit tests for lib/search, api/search, LogSearch component
- e2e: search input visible on /log; search for known entry text returns result

Decisions:
- textSearch primary / ILIKE fallback — FTS works without generated column, migration is optional for gate pass
- search placed between divider and entry article, not in mosaic section
- prompt text not searched (not stored in DB; user's own words are the useful surface)
- 300ms debounce, 20 results, no count shown

Closes #<phase-issue>
```

---

## DoD

- [ ] `src/lib/search.ts` written + tested
- [ ] `GET /api/search` route written + tested
- [ ] `LogSearch` component written + tested
- [ ] `/log` page integrates `<LogSearch />`
- [ ] Migration file committed
- [ ] `pnpm verify` green
- [ ] DoD rows ticked in `01_build_plan.md`
