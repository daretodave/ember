# Phase 13 — Entry editing

## Outcome

The `/log/[date]` single-entry view gains an edit affordance. Users can edit
the response body, toggle the task-done state, and change the publish flag on
any past entry. No new URL. No new DB columns (updated_at is already tracked).

## Why

Phase 6 shipped the log as read-only with "edit is a v1.5 stretch" deferred.
This phase closes that debt. A published entry stays editable; the public view
always reflects the latest text.

## Scope

- **`EditEntry.tsx`** (client component) — replaces the inline read-only
  rendering inside `/log/[date]/page.tsx`. Manages two modes:
  - **View mode:** entry text (paragraphs), task done indicator, publish status,
    "edit" button.
  - **Edit mode:** textarea pre-filled with response, task done toggle, publish
    toggle, save / cancel buttons, last-saved stamp, inline error.

- **`/log/[date]/page.tsx`** — when `entry` is non-null, renders `<EditEntry>`;
  when no entry, keeps the existing "no entry for this day." fallback.

- **`page.module.css`** — additional styles for edit mode controls (task toggle,
  textarea, meta row, cancel / save buttons, edit button).

- **API** — uses the existing `POST /api/entries` (upsert semantics). No new
  endpoint. Auth guard already enforces author-only writes.

- **Tests** — unit tests for `EditEntry` (view mode render, edit mode render,
  save flow) using `@testing-library/react`; e2e smoke test confirming the
  redirect behavior still holds (existing log.spec.ts extended).

## Decisions (pre-made)

- Edit affordance is shown only when an entry already exists. No-entry days
  keep the "no entry for this day." text; users write new entries via `/today`.
- The "edit" button lives in the entry footer (view mode). Save/cancel live in
  the meta row (edit mode), mirroring the TodayEntry layout.
- On cancel, the form reverts to the last successfully saved state.
- `autoFocus` on the textarea when entering edit mode (single-interaction UX).
- No optimistic update: the display state flips only after a 200 OK from the API.
