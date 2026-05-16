# Phase 12 — Prompt rotation v1.5

## Goal

Let users opt into Anthropic-personalized daily prompts. Behind a settings
toggle ("prompt variety: standard / personalized"). Standard is the default;
personalized calls Claude claude-sonnet-4-6 and caches the result so the
same user sees the same prompt all day.

## Scope

### Database
- Add `use_personalized_prompts boolean NOT NULL DEFAULT false` to `profiles`.
- Add `personalized_prompts(user_id, date, prompt, task)` cache table with RLS.

### Library
- `src/lib/ai-prompt.ts` — `getPersonalizedPrompt(supabase, userId, isoDate, recentResponses)`.
  - Checks cache first; generates via Anthropic API if missing.
  - Returns `PromptEntry | null`; caller falls back to seed prompt on null.
  - Uses recent response texts (up to 5) for light personalization context.

### API
- `POST /api/settings` — handle `use_personalized_prompts: boolean`.

### Settings UI
- `SettingsForm.tsx` — "prompt variety" radio group: standard / personalized.
  - Standard: curated seed list, same for all users on a given day.
  - Personalized: Claude-generated, unique per user per day.

### Today page
- `/today` — when profile has `use_personalized_prompts = true`, call
  `getPersonalizedPrompt`; fall back to seed prompt if it returns null
  (no API key, API error, etc.).

## Out of scope
- Retroactive personalization of past entries.
- Personalized prompts on the anonymous landing preview (seed list stays).
- Personalized prompts on public profiles (always seed-based to avoid
  leaking that a user opted in).

## Verify gate
- `pnpm verify` must be green before commit.
- Tests cover: `getPersonalizedPrompt` (cache hit path, API path, fallback
  on null API key, graceful error handling).
