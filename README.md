# Ember

> Ten minutes of intention before the day swallows you.

A calm daily-practice site. One small prompt and one tiny
task per day; your responses accumulate into a quiet
mosaic of attention.

See [`spec.md`](./spec.md) for the full product spec.

## Getting started (one-time setup)

```bash
pnpm install
pnpm bootstrap:status   # read-only state report
pnpm bootstrap          # walks every gap interactively
```

`pnpm bootstrap` is the executor for the nexus
`bootstrap-automation` layer. It takes the project from
nothing to a green deploy + a ticking cloud loop by
orchestrating provider CLIs (`gh`, `vercel`, `supabase`).

See `setup/00_files.md` for the per-service runbooks, and
`../nexus/customization/bootstrap-automation.md` for the
full contract.

## Daily

```bash
pnpm dev
```

Then visit http://localhost:3000.

## Project layout

```
ember/
├── spec.md                # the product spec — read first
├── agents.md              # standing rules for any AI agent
├── plan/
│   ├── bearings.md        # stack, voice, URL contract
│   └── steps/01_build_plan.md   # phases to ship
├── setup/                 # external service runbooks
└── scripts/
    └── bootstrap.mjs      # the executor (see nexus customization)
```
