# Phase 25 — Loop issue mirroring

## Outcome

`scripts/loop-issue.mjs` exists and is callable by the autonomous loop. The four
sub-commands (`open`, `close-comment`, `phase-open`, `phase-close`) reconnect the
public GitHub timeline that 81 AUDIT.md `[mirror-failed]` entries show has been dark
since bootstrap. Script-only — no app code changes.

## Why

The `/iterate` and `/ship-a-phase` skills call `node scripts/loop-issue.mjs` to open
and close GitHub issues as the loop ships work. The script was never written; every
call has failed silently and left `[mirror-failed]` markers in `plan/AUDIT.md`. This
phase writes it.

## Interface

### `open` — called by `/iterate` §2.5

```
node scripts/loop-issue.mjs open \
  --severity <high|med|low> \
  --category <bug|enhancement|content|a11y|seo|perf> \
  --source <user|reader|audit|external> \
  --title "<≤70 char summary>" \
  --body-file <path>
```

Creates a GitHub issue via `gh issue create`. Applies the `loop:opened` label.
Prints **only the issue number** on stdout. Exits 0 on success or on any non-fatal
failure (warnings to stderr; never exits non-zero — failure is a warning).

### `close-comment` — called by `/iterate` §2.5 after fix ships

```
node scripts/loop-issue.mjs close-comment \
  --number <N> \
  --commit <sha> \
  --deploy-url <url>
```

Posts a comment on issue `#N`: "fixed in `<sha>` · deployed at `<url>`". Does not
close the issue (GitHub auto-closes via `Closes #N` trailer in the commit). Exits 0
always.

### `phase-open` — called by `/ship-a-phase` §2.5 and `/plan-a-phase` §5.5

```
node scripts/loop-issue.mjs phase-open \
  --phase "<N>" \
  --title "Phase <N> — <topic>" \
  --body-file <path>
```

Idempotent. Searches for an open OR closed issue whose title starts with
`Phase <N> — ` (exact prefix match). If found open: reuse (print number). If found
closed: reopen then print number. If not found: create then print number. Applies
`loop:opened` label. Prints **only the issue number** on stdout. Exits 0 always.

### `phase-close` — called by `/ship-a-phase` §12.5

```
node scripts/loop-issue.mjs phase-close \
  --phase "<N>" \
  --commit <sha> \
  --deploy-url <url>
```

Finds the open issue whose title starts with `Phase <N> — `. Posts a comment:
"shipped in `<sha>` · deployed at `<url>`". Does not close the issue (the
`Closes #N` commit trailer already did). Exits 0 always.

## Auth + config

Load `GH_TOKEN` and `GH_REPO` from the environment first; fall back to `.env` via the
same manual parser used in `scripts/deploy-check.mjs`. `GH_REPO` defaults to
`daretodave/ember`. If `GH_TOKEN` is absent: log warning to stderr, exit 0 (failure
is non-blocking).

Use `gh` CLI for all GitHub API calls (`gh issue create`, `gh issue comment`,
`gh issue list`, `gh issue reopen`). The `GH_TOKEN` env var is picked up by `gh`
automatically — no explicit `--token` flag needed as long as the env var is set.

## Label contract

- `loop:opened` — applied on every `open` and `phase-open` call.
- The label may not yet exist in the repo. On label-not-found: create it first via
  `gh label create loop:opened --color 0075ca` then retry. Non-fatal if label creation
  fails too.

## Error handling

Every sub-command wraps its logic in a try/catch. On any error:
- Write to stderr: `loop-issue: <subcommand> failed: <error message>`
- Exit 0 (never non-zero — the caller treats this as a warning and continues)

The only exit 1 case: unrecognised sub-command (so the caller can detect typos during
dev; in prod, all sub-commands are hardcoded in the skills).

## Files

New:
- `scripts/loop-issue.mjs` — the script

No existing files modified.

## Decisions made upfront — DO NOT ASK

1. **`gh` CLI, not raw fetch.** `deploy-check.mjs` uses `fetch` because it needs
   to poll repeatedly; `loop-issue.mjs` makes one-shot calls. `execSync('gh ...')`
   is simpler and self-documenting. `gh` is pre-installed in the GitHub Actions
   runner and available locally via Homebrew.
2. **Exit 0 always (except unknown sub-command).** The loop must never be blocked
   by a GitHub API hiccup. The caller's explicit contract is "failure is a warning".
3. **Idempotent `phase-open` by title prefix.** The phase number is the stable key.
   `gh issue list --search "Phase <N> — in:title"` plus client-side exact-prefix
   filter handles both open and closed states.
4. **Only the issue number is printed on stdout.** No decorative output. The caller
   does `N=$(node scripts/loop-issue.mjs ...)` — anything else on stdout breaks
   the capture.
5. **`--body-file` not `--body`.** Avoids shell escaping nightmares with multi-line
   issue bodies. The caller always writes the body to a temp file first.
6. **No retries inside the script.** The next tick retries automatically.
7. **`loop:opened` is the only label applied.** `/triage` applies further
   classification labels; `loop-issue.mjs` only marks "this was opened by the loop".

## Pages × tests matrix

| File | Tests |
|---|---|
| `scripts/loop-issue.mjs` | No unit tests — script calls `gh` CLI; tested via smoke-check in e2e or manually |

No test file is added in this phase. The script's correctness is verified by the
first loop tick that calls it successfully (the next `/ship-a-phase` or `/iterate`
tick will call `phase-open`; observe the issue on GitHub).

## Verify gate

`pnpm verify` — typecheck → test:run → build → e2e. The script is plain JS; no
typecheck target touches it. All existing checks remain green. The script itself is
not exercised by the verify gate.

## Commit body template

```
feat: loop issue mirroring — phase 25

- scripts/loop-issue.mjs: open, close-comment, phase-open, phase-close
- open: gh issue create + loop:opened label, prints issue number on stdout
- phase-open: idempotent find-or-create-or-reopen keyed on "Phase N — " prefix
- phase-close / close-comment: post deploy-URL comment (Closes trailer handles close)
- failure is always a warning: exits 0, logs to stderr
- GH_TOKEN / GH_REPO from env or .env (same pattern as deploy-check.mjs)

Decisions:
- gh CLI over fetch: one-shot calls don't need the poll loop
- exit 0 always: loop must never block on GitHub API hiccups
- stdout = issue number only: caller uses $(node ...) capture
```

## DoD

- [ ] `scripts/loop-issue.mjs` exists
- [ ] `node scripts/loop-issue.mjs open --help` does not crash
- [ ] `node scripts/loop-issue.mjs phase-open --help` does not crash
- [ ] `pnpm verify` green
- [ ] Script is plain ESM (`.mjs`); no TypeScript compile step needed

## Follow-ups (out of scope)

- Back-filling the 81 `[mirror-failed]` AUDIT.md entries (those rows will be
  retried naturally as `/iterate` addresses them in future ticks)
- Unit tests with a `gh` stub (lower priority; script logic is thin)
