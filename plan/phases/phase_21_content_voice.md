# Phase 21 — Content voice alignment

## Outcome

All ~101 task entries in `content/prompts.json` rewritten from
second-person imperative form to gerund/participial form, closing
the documented voice-guide compliance gap on `/today` and in the
landing 7-day preview.

## Why

`design/CLAUDE.md` § "Copy and voice rules" bans second-person
imperative copy: "Copy must not instruct the user." The current
task entries all use the imperative ("drink a glass of water",
"sit somewhere different for two minutes") — the exact form the
voice guide prohibits. The rewrite brings content into compliance
with the visual law without touching any code.

## Scope

- `content/prompts.json` — all `task` values rewritten to gerund
  or participial form ("drinking a glass of water before opening
  any app.", "sitting somewhere different for two minutes.")
- No code changes. `src/lib/prompts.ts` reads the JSON without
  format assumptions; the shape (array of `{prompt, task}`)
  is unchanged.
- The verify gate (typecheck → test → build → e2e) must pass on
  content-only changes.

## Voice model

"The task marked if it happened" — the text describes the action
as something that occurred, so the user marks it rather than being
commanded to do it. Gerund lead ("drinking", "sitting",
"writing") is the default form. Noun phrases without a lead verb
are acceptable where they read more naturally ("a glass of water
before opening any app.").

## Out of scope

- `prompt` values — voice already suits the observational framing.
- Any code changes.
- New routes, new tests (schema unchanged; existing tests pass).

## Definition of done

- All `task` strings in `content/prompts.json` use gerund or
  participial form (no second-person imperative verbs).
- `pnpm verify` exits 0.
- Commit pushed; deploy green.
