# ember

> *ember* /ˈem.bər/ — *n.* a small piece of burning or glowing coal or wood in a dying fire; a quiet, persistent thing that lasts long after the flame.

[![march](https://github.com/daretodave/ember/actions/workflows/march.yml/badge.svg?branch=main)](https://github.com/daretodave/ember/actions/workflows/march.yml)
[![site](https://img.shields.io/website?url=https%3A%2F%2Fember-rust-sigma.vercel.app&label=ember-rust-sigma.vercel.app&up_message=live)](https://ember-rust-sigma.vercel.app)
[![built with](https://img.shields.io/badge/built%20with-claude%20code-d97757)](https://claude.com/claude-code)
[![methodology: nexus](https://img.shields.io/badge/methodology-nexus-lightgrey)](https://github.com/daretodave/nexus)

A calm daily-practice site. **Ten minutes of intention before the day swallows you.** Lives at [ember-rust-sigma.vercel.app](https://ember-rust-sigma.vercel.app).

Each morning, ember offers one small prompt and one tiny task. You write a few sentences in response, optionally mark the task done, and move on. Over weeks, your responses accumulate into a quiet 60-day mosaic of the things you've been attending to. Not journaling (too open), not habit tracking (too quantified) — something in between. Pull-based always: no email, no push, no streak-shaming.

**This site is always being worked on.** An autonomous loop ships improvements 24/7 through a small set of slash commands — substrate, auth, the daily prompt feed, the mosaic, public-profile polish, a11y, perf. The cloud half ticks every 2h via [GitHub Actions](https://github.com/daretodave/ember/actions/workflows/march.yml); the local half runs on my laptop. No human in the per-commit loop, but every commit is gated by a hermetic verify (`typecheck → test → build → e2e`) and a post-push deploy gate.

ember was bootstrapped end-to-end via [`/bootstrap`](https://github.com/daretodave/nexus/blob/main/customization/bootstrap-automation.md) — a single command that took it from "spec + tokens" to "deployed app + ticking cloud loop." That layer is part of [**nexus**](https://github.com/daretodave/nexus), a portable kit that turns any repo into an autonomous-loop project. If you want to do the same to your own repo, start there.

The product spec is in [`spec.md`](./spec.md). The autonomous build loop is documented below.

---

## Skills

This project is shipped by a small set of autonomous skills, each invoked as a Claude Code slash command. Skills are **source-of-truth** files (under `skills/`) — the slash commands are thin pointers. Other AI clients can follow the skill files directly.

### `/bootstrap`

Take the project from "tokens in hand" to "deployed + cloud loop ticking" by orchestrating provider CLIs (`gh`, `vercel`, `supabase`) and propagating secrets. State-aware, idempotent, never destructive. The first slash command run on a fresh repo.

```
/bootstrap status                   # read-only state report
/bootstrap                          # walk every gap interactively
/bootstrap with manifest            # use setup/bootstrap.local.json
/bootstrap <service>                # one service slice
/bootstrap rotate <service>         # re-propagate one token
/bootstrap cloud-loop               # cloud-loop slice only
```

Source: [`skills/bootstrap.md`](./skills/bootstrap.md)

### `/ship-a-phase`

Ship the next pending phase of the [build plan](./plan/steps/01_build_plan.md) end-to-end: code, unit tests, e2e tests, commit, push. The Vercel deploy follows automatically.

```
/ship-a-phase                       # next [ ] phase
/ship-a-phase phase 5               # specific phase by number
/ship-a-phase phase 5 dry-run       # plan + emit brief, no code commit
/loop 30m /ship-a-phase             # autonomous, every 30 min
```

Source: [`skills/ship-a-phase.md`](./skills/ship-a-phase.md)

### `/ship-data`

Ship one self-contained update to the Supabase data layer — write a versioned SQL migration, add an RLS policy, tune an index, add or drop an RPC. The autonomous loop has full destructive authority on the v1 experiment; git is the audit trail and Supabase's 7-day backups are the safety net.

```
/ship-data                          # next data backlog row, or audit→fix
/ship-data add migration <slug>     # specific migration
/ship-data audit                    # audit-only; emit a queue row
/ship-data rls <table>              # tighten / repair RLS
```

Source: [`skills/ship-data.md`](./skills/ship-data.md)

### `/plan-a-phase`

A thinking pass — refines the next phase brief without shipping code. Useful before a long autonomous run so `/ship-a-phase` has zero ambiguity.

```
/plan-a-phase                       # refine next pending phase
/plan-a-phase phase 5               # refine a specific phase
```

Source: [`skills/plan-a-phase.md`](./skills/plan-a-phase.md)

### `/iterate`

The post-build loop. Audit the site for the highest-impact weakness (broken interaction, voice slip, mobile reflow regression, a11y gap, missing OG, stale prompt rotation, etc.) and ship one improvement. Designed to run forever once the planned phases are done.

```
/iterate                            # audit + ship the top finding
/iterate audit                      # audit-only; no fix shipped
/iterate a11y                       # bias toward accessibility
/iterate copy                       # bias toward voice fidelity
/loop 1h /iterate                   # autonomous improvement loop
```

Source: [`skills/iterate.md`](./skills/iterate.md)

### `/critique`

The **external-observer** pass. Spawns the `reader` sub-agent to visit https://ember-rust-sigma.vercel.app as a first-time reader would, take notes (visual, voice fidelity, mobile reflow, comprehension, navigation honesty, calm-tone discipline), self-assess what was returned, and append the surviving findings to [`plan/CRITIQUE.md`](./plan/CRITIQUE.md). `/iterate` reads CRITIQUE.md as one of its audit sources — that's the **feedback address loop**.

Two passes per invocation — anonymous + authenticated — so member-only paths get observed too. Rate-limited: only fires when there's a green deploy + ≥12 commits or ≥24h since the last pass. Caps at 6 filed findings per pass.

```
/critique                           # full pass — visits ~6 representative URLs
/critique <url>                     # focused pass on one URL
/critique mobile                    # 375x800 only
```

Source: [`skills/critique.md`](./skills/critique.md)

### `/triage`

The **issue review** loop. Reads open unlabeled issues at github.com/daretodave/ember, classifies each (bug, feature, content, data, docs, a11y, etc.), applies a label, posts a short comment, and routes actionable issues into the right backlog (`plan/AUDIT.md` or build plan). When there are zero unlabeled issues, exits in <1s — the loop hums on.

```
/triage                             # all unlabeled open issues
/triage <issue-number>              # focused pass
/triage all                         # re-evaluate every open issue
/triage dry-run                     # classify + report, no labels/comments
```

Source: [`skills/triage.md`](./skills/triage.md)

### `/expand`

The **plan-expansion** pass. Reads accumulated signals (audit findings, critique findings, GH issues, spec drift, design landings) and proposes new phase candidates to [`plan/PHASE_CANDIDATES.md`](./plan/PHASE_CANDIDATES.md). `/oversight` reviews and promotes — the build plan grows when reality demands it, but never without a human gate.

Posture is set to **bold** in `bearings.md`. Rate-limited (≥20 commits or ≥48h between passes). Caps at 3 candidates per pass — boldness is not flooding.

```
/expand                             # full pass — read signals, file candidates
/expand audit | spec | design       # bias toward one signal source
/expand dry-run                     # report candidates; do not commit
```

Source: [`skills/expand.md`](./skills/expand.md)

### `/jot`

The user-input quickfire. Append a one-line observation directly to [`plan/CRITIQUE.md`](./plan/CRITIQUE.md) so the next `/iterate` tick acts on it. No questions back, no autonomy — just capture-and-go.

```
/jot the mosaic tiles need more breathing room on mobile
/jot rename "task" to "small thing" in the prompt UI
```

Source: [`skills/jot.md`](./skills/jot.md)

### `/march`

The outer dispatcher. Picks the right thing to do automatically:

- unlabeled issues exist → behaves as `/triage`
- critique due (rate-limited) → behaves as `/critique`
- pending phase → behaves as `/ship-a-phase`
- pending data → behaves as `/ship-data`
- expand due + bold posture → behaves as `/expand`
- else → behaves as `/iterate`

Use this with `/loop` for the autonomous-beast endgame.

```
/march                              # one tick: dispatch + execute
/loop /march                        # self-paced autonomous loop
/loop 30m /march                    # autonomous, every 30 min
```

Source: [`skills/march.md`](./skills/march.md)

### `/oversight`

The **user-in-the-loop** command. Pause autonomy, get a tight briefing on current state (shipping velocity, pending phases, open audits, deploy state, working-tree state), answer a targeted questionnaire generated from what was found, and the skill applies your answers as plan adjustments — drop a stuck phase, bias the iterate loop, refresh a brief in light of new design, prune findings, promote `/expand` candidates.

The only skill that asks you anything (alongside `/bootstrap`). Everything else decides and ships.

```
/oversight                          # full audit + general questionnaire
/oversight phase                    # bias toward phase progress
/oversight a11y                     # bias toward accessibility audit
/oversight deploy                   # bias toward Vercel / CI/CD
/oversight reset                    # bias toward scope reduction
```

Source: [`skills/oversight.md`](./skills/oversight.md)

---

## Sub-agents

Each skill delegates aggressively to specialist sub-agents (definitions in [`.claude/agents/`](./.claude/agents/), authored as ember matures):

| Agent | When invoked |
|---|---|
| `scout` | Open-web research — prompt-set inspiration, mosaic UI patterns, daily-practice prior art. Citations required. |
| `reader` | Fresh-eyes external observer of the live site (used by `/critique`). Anonymous + authenticated passes. |
| `prompt-curator` | Voice-disciplined prompt + task drafting for the daily rotation. Calm, plain, slightly bookish. No exclamation points. |

---

## Repo orientation

For any agent landing cold: read [`agents.md`](./agents.md) first. It points you to everything else in the right order.
