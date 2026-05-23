# Phase 20 — Searchable timezone combobox

## Outcome

Replace the flat `<select>` on `/settings` with a bespoke, keyboard-navigable,
type-to-filter combobox. The underlying IANA tz string value format and the
`/api/settings` contract are unchanged — pure UI swap.

## Why

The flat select currently exposes 200+ raw IANA timezone strings with no
filtering. On mobile this means scrolling through a long native picker.
Type-to-filter solves the discoverability problem. The combobox is the
priority surface fix for mobile.

## Scope

- New component: `src/components/timezone/TimezoneCombobox.tsx`
- Styles: `src/components/timezone/TimezoneCombobox.module.css`
- Unit tests: `src/components/timezone/__tests__/TimezoneCombobox.test.tsx`
- Modify: `src/app/settings/SettingsForm.tsx` — swap `<select>` for `<TimezoneCombobox>`
- No API changes. No DB changes. No new URL.

## Combobox behavior

- Input shows the currently selected timezone value.
- Clicking or focusing the input opens the listbox.
- Typing filters by substring match (case-insensitive) against the full tz string.
- When the query is empty, zones are grouped by region (same regions as the old
  `<optgroup>` structure, sorted A-Z).
- When a query is present, regions are hidden; matching zones render as a flat list.
- Arrow Down / Arrow Up navigate among visible options.
- Enter or click selects the highlighted option, updates the value, closes the list.
- Escape closes the list without changing the selection; input reverts to the
  currently selected value.
- Clicking outside closes the list.
- The list appears above or below based on available viewport space (CSS-only
  preference: below by default, but the component clamps to stay in viewport).

## ARIA contract

- The text input carries `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`,
  `aria-autocomplete="list"`, `aria-controls="<listbox-id>"`,
  `aria-activedescendant="<highlighted-option-id>"`.
- The dropdown carries `role="listbox"`.
- Each region group carries `role="group"` + `aria-label="<Region>"`.
- Each option carries `role="option"`, `aria-selected`, and a unique `id`.

## Design constraints

- No shadows, no gradients (bearings.md hard rule).
- Border-bottom on the trigger input mirrors the existing `.select` underline style.
- Dropdown: `--color-paper` background, `--color-border` outline, `--radius-1`
  corners, `--font-sans` text, `--type-14` size.
- Highlighted / hovered option: `--color-paper-sunk` background.
- Selected option: `--color-accent` left indicator (1px inset-left or left-border).
- Max-height ~320px with overflow-y auto.
- No icons (hard rule), no external icon libraries.

## Dependency decision

Bespoke component — no Radix, no Downshift. The interaction surface is narrow
(one field, one list, standard keyboard contract). A 150-line bespoke component
keeps the bundle untouched and the ARIA contract explicit.
