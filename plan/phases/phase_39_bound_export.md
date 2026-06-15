# Phase 39 — Bound export ("your book")

## Outcome

A practitioner can open `/export/book` to see all their entries rendered as a clean, typeset, chronological compilation — then use the browser's native print dialog to save a PDF. The page is branded, readable, and self-contained.

---

## Route / URL surface

| Route | Auth | Purpose |
|---|---|---|
| `/export/book` | required | Full print-ready compilation of all entries |

Bearings URL contract locked — `/export/book` is the new URL family.

---

## Content / data reads

| Helper | Call | Use |
|---|---|---|
| `createClient` (server) | `supabase.auth.getUser()` | auth gate, redirect if unauthenticated |
| `supabase.from('entries').select(...)` | `.eq('user_id', ...).order('date', ascending)` | all entries chronological |
| `getPromptForDate` from `@/lib/prompts` | per entry date | include prompt + task with each entry |
| `getProfile` from `@/lib/profile` | profile row | display name on title page |

No new schema queries. Derives entirely from existing tables.

---

## Components

**New:**
- `src/app/export/book/page.tsx` — RSC, auth gate, data fetch, renders all sections
- `src/app/export/book/page.module.css` — screen + print styles in one file

**Reused:**
- `MosaicGlyph` — mosaic motif on the cover page (the only graphic)
- `EntryMarkdown` — renders entry bodies with the existing sanitized markdown pipeline (phase 36)

No new primitives needed.

---

## Page composition

### Screen view (pre-print)
- Simple centered layout, `max-width: 720px`
- Header with nav (hidden on print)
- Print button: `<button onclick="window.print()">print your book</button>`
- A11y note below: "prints as a typeset PDF from the browser print dialog."
- Then the book content below

### Book content
1. **Title page block** — `MosaicGlyph` + "ember" wordmark, display name, generated date line ("a record of practice")
2. **Entry sections** — grouped by month with `<h2>` month headers (e.g. "june 2026")
3. **Each entry** — `<article>` with:
   - Date in JetBrains Mono (`<time>` element)
   - Prompt in Source Serif 4 italic, muted
   - Entry body via `EntryMarkdown`
   - Hairline separator between entries
4. **No pagination on screen** — all entries flow on one page, browser handles print pagination

### Print CSS (`@media print`)
- Hide: header nav, print button, footer, any site chrome
- Show: book content only
- `@page` rule: `margin: 1in` (US letter comfortable)
- `font-size: 11pt`, `line-height: 1.6` for print
- `break-inside: avoid` on each entry article
- Month headers get `break-before: avoid` to stay with their first entry
- Title page `break-after: page` to start entries on a new page
- All design tokens are CSS custom properties — print inherits them; accent color prints reduced (browser default for color pages)
- Links get `display: none` on print (or show URL if `a[href]::after` pattern preferred — decision: hide, cleaner)

---

## Empty state

If the user has zero entries:
- Screen: "no entries yet. your book will appear here once you have written at least one entry."
- Print: same line in centered print-safe style
- No redirect, no error — render the empty state quietly

---

## SEO / metadata

```ts
export const metadata = {
  title: 'ember · your book',
  description: 'a typeset compilation of all your entries.',
  robots: { index: false },   // private page — no indexing
}
```

No OG image needed (authenticated private route).

---

## Cross-links

- **Settings page** (`src/app/settings/page.tsx`) — add a `<Link href="/export/book">print your book</Link>` below the existing "export your data" link.
- **In:** settings page links to `/export/book`
- **Out:** none (book page is a terminal destination)

---

## Decisions made upfront — DO NOT ASK

1. **Route is `/export/book`**, not a settings action or modal. Cleaner URL, direct link.
2. **Print-only PDF** — no server-side PDF generation. `window.print()` is the v1 path. Flag in commit if cross-browser print fidelity proves fragile.
3. **All entries** — not the 60-day window. This is the full historical record. For large entry sets, browser handles scroll; print paginates naturally.
4. **Month grouping** — entries grouped by `YYYY-MM` with lowercase month+year header ("june 2026"). Clean chronological reading.
5. **EntryMarkdown reused** — if phase 36 is shipped (it is), entries render with markdown. Print renders whatever the screen renders.
6. **MosaicGlyph on title page** — the only graphic. Per visual law rule 1: "the 60-day mosaic is the only graphic."
7. **Print button is `<button onClick="window.print()">` client component** — isolated to a small `PrintButton.tsx` client component. RSC page stays server-rendered.
8. **A11y: `role="button"` not needed** — it's already a `<button>`. Print button has descriptive text.
9. **No axe scan added** — `/export/book` is not in the axe gate (phase 15 specified fixed routes). No change to axe spec.
10. **Checkin word** — if present, show as a subtle annotation after the date in mono (`"steady"`).
11. **Tags** — not shown in the book. They're organizational metadata, not content.

---

## Pages × tests matrix

| Surface | Unit | E2E |
|---|---|---|
| `BookPage` (no entries) | empty-state snapshot | — |
| `BookPage` (with entries) | entry count, month grouping | `/export/book` redirects to `/signin` unauthenticated (anonymous) |
| Print button | renders, has type="button" | — |
| Settings page link | — | link present on `/settings` (anonymous redirect only) |

E2E: anonymous `/export/book` returns redirect to `/signin` — mirrors `settings.spec.ts` pattern.

---

## Verify gate

```bash
pnpm verify   # typecheck → test:run → build → e2e
```

No new env vars. No new dependencies — `react-markdown` + `rehype-sanitize` already installed (phase 36). `MosaicGlyph` already exists.

---

## Commit body template

```
feat: bound export ("your book") — phase 39

- new authenticated /export/book page renders all entries
  chronologically, grouped by month
- title page: mosaic glyph + display name + "a record of practice"
- each entry: date (mono), prompt (italic), body (EntryMarkdown)
- print CSS: @media print hides chrome, @page sets 1in margins,
  break-inside:avoid per entry, title page break-after:page
- PrintButton client component: window.print() trigger
- empty state when user has no entries
- settings page: "print your book" link below "export your data"
- no new schema, no new deps

Decisions:
- route is /export/book (not a modal/action) for direct linking
- print-only PDF: window.print() v1 path
- all entries fetched (not 60-day cap)
- MosaicGlyph on title per visual law (only graphic allowed)
- tags omitted from book (metadata, not content)

Closes #<PHASE_ISSUE>

Cloud-Run: https://github.com/daretodave/ember/actions/runs/27580543025
```

---

## DoD

- [ ] `/export/book` renders for authenticated user with entries
- [ ] `/export/book` redirects unauthenticated users to `/signin`
- [ ] Print view hides nav, shows only book content
- [ ] Title page has mosaic glyph + display name
- [ ] Entries grouped by month with lowercase headers
- [ ] Each entry shows date, prompt, body (markdown-rendered)
- [ ] Empty state renders without error
- [ ] Settings page has "print your book" link
- [ ] `pnpm verify` passes

---

## Follow-ups (out of scope)

- Server-side PDF via headless Chrome / Puppeteer (future)
- Cover image using the mosaic tile grid (would require the brander agent)
- Table of contents (future, if entry count grows large)
- Per-year chapters (future)
