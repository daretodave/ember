# agents.md

> The entry point for any AI agent landing in this repo
> cold. Read top-to-bottom; rules at the top are
> non-negotiable.

## Standing rules

### 1. Commit and push. Always. As a single atomic act.

Shipped work that isn't committed is rolled-back work
waiting to happen. Shipped work that's committed but not
pushed is invisible to Vercel and to future loop ticks.
The autonomous loop assumes `origin/main` is the source
of truth.

Every shipping skill ends with `git commit` **immediately
followed by** `git push origin main`.

### 2. No `Co-Authored-By:` trailers. No emojis.

Plain commit message bodies. **Never** add a
`Co-Authored-By:` line, a "🤖 Generated with…" footer,
or any emoji — in commits, in code, in content, in design
notes.

**One carve-out:** commits shipped from the cloud loop
(`.github/workflows/march.yml`) MUST end with a single
trailer: `Cloud-Run: <run-url>`. The cloud ceiling check
uses this trailer to distinguish cloud-shipped commits
from local work.

### 3. The verify gate is non-negotiable.

`pnpm verify` runs **before** every commit:

```
typecheck → test:run → build → e2e
```

Every check is a hard gate. Never `--no-verify`. Fix the
root cause.

### 4. The deploy gate runs after every push.

`pnpm deploy:check` polls Vercel for the deploy matching
the just-pushed commit. Prints state transitions. Exits
non-zero on `error` / `failed` / timeout.

A red deploy is treated identically to a red verify gate.

### 5. No `--no-verify`. No force-push. No destructive resets.

If a hook fails, fix the underlying issue. Tests alongside
code; never "add tests later."

### 6. Pull-based always.

Ember never sends unsolicited email or push notifications.
This is a hard product rule, not just a v1 choice.

### 7. No streak-shaming, no per-user analytics, no per-entry
       social signals.

The mosaic shows what is, not what isn't. No "you broke
your streak" UI. No likes/comments/follows.

---

## Project

**Ember** — a calm daily-practice site. One prompt + one
tiny task per day. Lives at https://ember-rust-sigma.vercel.app (once
deployed).

The spec is `spec.md` at the repo root. Read it once.

## Repo shape

```
ember/
├── spec.md                # product spec
├── plan/                  # bearings + build plan + queues
├── setup/                 # external service runbooks
├── skills/                # autonomous-loop skills
├── scripts/               # bootstrap + deploy-check
├── src/                   # app code (added in phase 1)
└── tests/                 # unit + e2e (added in phase 1)
```

## Sub-agents

(To be authored after phase 1.)

- `scout` — open-web research
- `reader` — live-site observer (used by `/critique`)
- `prompt-curator` — domain specialist for prompt + task
  selection

---

## Where to look

| If you need… | Read |
|---|---|
| What Ember is | `spec.md` |
| Stack, voice, URL contract | `plan/bearings.md` |
| What ships next | `plan/steps/01_build_plan.md` |
| External services | `setup/00_files.md` |
| How `/bootstrap` works | `../nexus/customization/bootstrap-automation.md` |
