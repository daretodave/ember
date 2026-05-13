# Ember — external service setup index

> One runbook per external service. Pre-flighted upfront so
> `/march` can run unattended without hitting a "configure
> this in the dashboard" wall.
>
> Convention: `00_files.md` is this index. Each service gets
> a numbered runbook (`NN_<service>.md`). Numbers reflect
> setup dependency order — top to bottom on a fresh machine.

See `../../nexus/customization/external-services.md` for the
runbook convention and `../../nexus/customization/bootstrap-automation.md`
for the executor (`/bootstrap`).

---

## Status legend

- **`OK`** — runbook complete, all dashboard config done, all env vars wired
- **`PARTIAL`** — runbook complete, some dashboard config pending
- **`STUB`** — runbook stubbed, not yet written
- **`—`** — not yet planned

---

## Bootstrap automation

Each row below is provisioned by `/bootstrap` (or its
slice `/bootstrap <service>`). Sections that require a
human (DNS, OAuth approvals, billing) appear as handoffs
during the bootstrap run and as `[needs-user-call]` rows in
`plan/AUDIT.md` if deferred.

`/bootstrap status` is the read-only diagnostic — safe to
run any time, including inside `/oversight`.

---

## Index

| # | Service | Runbook | Status | Phases that touch it |
|---|---|---|---|---|
| 01 | GitHub | `01_github.md` | `PARTIAL` | substrate, all (push), `/triage` (issues), cloud loop |
| 02 | Vercel | `02_vercel.md` | `PARTIAL` | phase 1 (deploy gate), all (deploys), Preview env |
| 03 | Supabase | `03_supabase.md` | `PARTIAL` | phase 4 (auth), 5 (entries), 6 (mosaic), 8 (publish) |

---

## Per-service quick reference

### 01 — GitHub `PARTIAL`
**Runbook:** [`01_github.md`](./01_github.md)
**Covers:** repo creation, branch protection, triage labels,
Claude Code App install, OAuth token, Actions secrets +
variables, repo settings, templates, topics.
**`.env`:** `GH_TOKEN` (optional — `gh` CLI auth is the primary path)
**Status:** repo `daretodave/ember` created (public) ✓ — topics +
description + homepage URL set ✓ — 8 Actions secrets pushed
(CLAUDE_CODE_OAUTH_TOKEN, VERCEL_TOKEN, all 6 Supabase keys)
✓ — 4 Actions variables pushed ✓ — `.github/workflows/march.yml`
landed ✓. Pending: install the Claude Code GitHub App
(https://github.com/apps/claude); upgrade to user-author
identity via `ACTIONS_PAT` (currently bot-author).
Branch protection deferred (loop pushes direct until
CI checks exist).

### 02 — Vercel `PARTIAL`
**Runbook:** [`02_vercel.md`](./02_vercel.md)
**Covers:** project + team, build settings, env-var
propagation across Production + Preview + Development,
pdx1 region (closest to Supabase us-west-1), deploy hooks,
Speed Insights.
**`.env`:** `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`
**Status:** project `snapshot-app/ember` created ✓ — linked
to `daretodave/ember` for auto-deploy ✓ — 5 public env vars
+ 2 sensitive env vars set across Production + Preview ✓
(development env vars: public 5/5, sensitive 0/2 intentional).
Pending: pin function region to `pdx1` in dashboard
(CLI doesn't expose region setting); enable Speed Insights
in dashboard.

### 03 — Supabase `PARTIAL`
**Runbook:** [`03_supabase.md`](./03_supabase.md)
**Covers:** CLI install + link, project provisioning,
migrations layout, RLS policies for entries + profiles,
magic-link Auth config, JWT settings, email templates,
connection URLs.
**`.env`:** `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`,
`SUPABASE_REGION`, `SUPABASE_DB_PASSWORD`,
`SUPABASE_SERVICE_ROLE_KEY`
**Status:** project `ember` created in org `ember`
(`ohrbbhrodpxhdtjhbsmy`, us-west-1, ACTIVE_HEALTHY) ✓ — local
CLI linked ✓ — 6 keys in `.env` + Vercel env + GH Actions ✓.
Pending: Auth provider config (magic-link only, redirect
URLs) — Section C; email template tuning — Section D; RLS
policies + indexes — land via migrations in phase 4-8.

---

## Loop interaction

When `/oversight` runs, it should:

1. Read this index.
2. For each row, confirm the env vars listed actually exist
   in `.env` (and in the deploy platform's env table for
   cloud environments).
3. For `PARTIAL` rows, surface a flag: "service N is
   partially configured; verify Section X is done before
   phase Y ships."
4. For `STUB` rows whose phase is in the next 3 pending
   phases, surface as `[needs-user-call]` in `plan/AUDIT.md`.

---

## Pre-flight before unattended runs

- [ ] Every service touching the next 5 pending phases is `OK`.
- [ ] Each `OK` service's verification checklist passes.
- [ ] Every env var in every Section H is present in every
      deploy environment.
- [ ] Every runbook's "manual post-launch action" list is empty.
