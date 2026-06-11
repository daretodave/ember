# Phase 23 — Data export

## Outcome

`GET /api/export` returns the authenticated user's complete entry history as JSON
(default) or Markdown (`?format=md`). An "export your data" link appears on
`/settings`. No new page routes.

## Why

Users with weeks of practice have no backup or portability path. This closes the
GDPR-adjacent expectation and ships before account-deletion (phase 24) which needs
export as a companion.

## Routes / API endpoints

| Method | Path | Auth | Query | Description |
|---|---|---|---|---|
| GET | `/api/export` | required | `format=json` (default) | Download all entries as JSON |
| GET | `/api/export` | required | `format=md` | Download all entries as Markdown |

Locked from bearings. No new page URL family.

## Content / data reads

| Helper | Call | Use |
|---|---|---|
| `createClient` | `supabase.auth.getUser()` | Auth guard |
| Supabase query | `from('entries').select('*').eq('user_id', uid).order('date', asc)` | Full history |
| `getPromptForDate(date)` from `@/lib/prompts` | Called per entry | Attach prompt + task text to each row |

All entries are returned (no 60-day cap — this is the portability path).

## Components / handlers

New:
- `src/app/api/export/route.ts` — GET handler; format switch; stream via `NextResponse`
- `src/app/api/export/__tests__/route.test.ts` — unit tests

Modified:
- `src/app/settings/page.tsx` — add "export your data" link below the form
- `src/app/settings/page.module.css` — `.exportLink` style (matches `.profileLink` visual register)

## Output shapes

### JSON (`format=json`, default)

```jsonc
{
  "exported_at": "2026-06-11T00:00:00.000Z",
  "entry_count": 42,
  "entries": [
    {
      "date": "2026-05-01",
      "prompt": "...",
      "task": "...",
      "response": "...",
      "task_done": true,
      "is_published": false,
      "created_at": "2026-05-01T08:30:00.000Z",
      "updated_at": "2026-05-01T08:30:00.000Z"
    }
  ]
}
```

Response headers:
```
Content-Type: application/json; charset=utf-8
Content-Disposition: attachment; filename="ember-export-YYYY-MM-DD.json"
```

### Markdown (`format=md`)

```markdown
# ember export — 2026-06-11

## 2026-05-01

**prompt:** ...
**task:** ...

---

...response text...

---

```

Response headers:
```
Content-Type: text/markdown; charset=utf-8
Content-Disposition: attachment; filename="ember-export-YYYY-MM-DD.md"
```

## Cross-links

**In (verified):**
- `/settings` — the only surface that links to export

**Out (ships):**
- "export your data" link on `/settings`, below the form, above the sign-out footer

**Retro-fit:**
- `/settings/page.tsx` — add the export link (scoped; no structural change)

## Empty state

If user has zero entries: JSON returns `{"exported_at":"...","entry_count":0,"entries":[]}`.
Markdown returns `# ember export — DATE\n\n(no entries)`. Both are valid downloads.

## Error states

- 401 Unauthorized → `{"error":"unauthorized"}` 401
- 400 Bad Request (unrecognized format param) → `{"error":"unrecognized format"}` 400
- 500 on DB error → `{"error":"<message>"}` 500

## Decisions made upfront — DO NOT ASK

1. **All entries, not just 60 days.** Export is the portability path; capping at 60 days defeats its purpose.
2. **format param, not Accept header.** Browser `<a href>` can't set Accept headers; a query param is the only link-friendly approach.
3. **No streaming.** Users won't have thousands of entries in this stage of the product; a simple `response.json()` is adequate.
4. **Prompt + task attached to each entry.** A raw DB dump without the prompts is unreadable. Attach via `getPromptForDate`.
5. **entries ordered ASC by date.** Chronological order reads naturally as an export/backup.
6. **No CSV.** JSON and Markdown cover the use cases: JSON for programmatic portability, Markdown for readable archiving. CSV is rarely useful for long-form prose entries.
7. **`format=json` is the default.** A plain GET `/api/export` with no params returns JSON.
8. **Date in filename uses export timestamp (UTC date).** `ember-export-2026-06-11.json` — unambiguous and file-safe.
9. **Settings link placement.** Below the form, above the sign-out footer. Matches the `.profileLink` visual register (same CSS class name pattern).
10. **No rate limiting on export.** Export is a read-only operation; the user can already read all their entries via /log. No new abuse vector.

## Mobile reflow

The "export your data" link on `/settings` follows the existing `.profileLink` pattern — already responsive.

## Pages × tests matrix

| File | Tests |
|---|---|
| `src/app/api/export/__tests__/route.test.ts` | 401 unauth, 200 JSON default, 200 JSON explicit, 200 Markdown, 400 bad format, empty entries |
| `apps/e2e/tests/settings.spec.ts` | Retro-fit: verify "export your data" link present on /settings |

## Verify gate

`pnpm verify` — typecheck → test:run → build → e2e. All hard.

## Commit body template

```
feat: data export — phase 23

- GET /api/export returns full entry history as JSON (default) or Markdown (?format=md)
- prompt + task text attached to each entry in both formats
- Content-Disposition header triggers browser download with dated filename
- "export your data" link added to /settings below the form
- unit tests: 401, 200 JSON, 200 MD, 400 bad format, empty entries
- e2e: settings page retro-fit confirms link presence

Decisions:
- all entries returned (no 60-day cap) — export is the portability path
- format query param over Accept header — required for plain <a href> links
- prompts attached per entry — raw DB dump without prompts is unreadable
- entries ordered ASC by date — chronological reads naturally as a backup
```

## DoD

- [ ] `GET /api/export` returns JSON with `entry_count` + `entries[]` incl. prompt/task
- [ ] `GET /api/export?format=md` returns Markdown download
- [ ] `GET /api/export?format=bad` returns 400
- [ ] Unauthenticated request returns 401
- [ ] `/settings` shows "export your data" link
- [ ] Unit tests pass
- [ ] E2E retro-fit passes
- [ ] `pnpm verify` green

## Follow-ups (out of scope)

- CSV format (not needed; JSON + MD cover portability and readability)
- Incremental / date-range export (future feature)
- Export of deleted entries (impossible by design — deletion is erasure)
