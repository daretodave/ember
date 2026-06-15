# Phase 38 — Prompt Packs

> Status: pending

## Outcome

A user can select a themed prompt collection on `/settings` ("prompt source: standard / <pack>"), and their daily prompt will draw from that pack's curated entries instead of the default seed list.

## Why

Today's daily prompt comes from one ~101-entry seed list. A practitioner with months of practice may want a specific register — grief, craft, gratitude, or stoic inquiry — rather than the mixed-register default. Packs let the ritual take a chosen shape.

## Scope

### Content
Four themed packs (one JSON per pack, same shape as `content/prompts.json`):
- `content/packs/gratitude.json` — noticing, appreciating, acknowledging
- `content/packs/craft.json` — making things, attention to process, quality
- `content/packs/stoic.json` — what's in/out of control, equanimity, what matters
- `content/packs/grief.json` — loss, change, carrying, remembering

~30 entries per pack. Voice per `design/CLAUDE.md` (lower-case, no exclamation, observational, participial/gerund tasks).

### Schema
Migration: `prompt_pack text not null default 'standard'` on `profiles`.

### Code
- `src/lib/prompts.ts` — `getPromptForDate(isoDate, pack?)` reads from the chosen pack; falls back to standard if pack not found.
- `src/lib/profile.ts` — add `prompt_pack` to `ProfileRow`.
- `src/app/api/settings/route.ts` — accept and persist `prompt_pack`.
- `src/app/settings/SettingsForm.tsx` — "prompt source" radio/select control (standard / gratitude / craft / stoic / grief).
- `src/app/settings/page.tsx` — pass `promptPack` to form.
- `src/app/today/page.tsx` — pass pack when selecting seed prompt.

### Precedence
Personalized prompts (phase 12) take precedence over packs: if `use_personalized_prompts=true`, the Anthropic-generated prompt wins. Otherwise the chosen pack's prompts are used. Documented in commit body.

### Tests
- Unit: `src/lib/__tests__/prompts.test.ts` — test pack selection, fallback to standard.
- E2e: `apps/e2e/tests/settings.spec.ts` — anonymous redirect only (no new authenticated assertions needed; pack setting is a settings-form concern covered by unit + API tests).

### No new routes
Pack selection is a settings preference; no new public URL family.

## Decisions
- Pack precedence: personalized > pack > standard (pack is the seed pool, personalized overrides the pool entirely).
- 30 entries per pack is sufficient for deterministic date-cycling.
- Pack keys are lowercase strings matching the JSON filename (e.g. `"gratitude"`, `"craft"`, `"stoic"`, `"grief"`).
- Unknown pack key falls back to standard — no runtime error.
