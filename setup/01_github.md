# GitHub setup — Ember

> Repo creation, branch protection, Claude Code App install,
> Actions secrets, repo settings, templates, topics.
>
> **Repo:** `daretodave/ember` (decided in `setup/bootstrap.local.json`)

---

## What Ember needs from GitHub

- A **public** repo (required for free cloud-loop runner on
  Claude Pro/Max OAuth).
- Branch protection on `main` (defer until phase 2; for now
  the loop pushes directly).
- A label set matching what `/triage` produces.
- Actions secrets for the cloud loop (CLAUDE_CODE_OAUTH_TOKEN,
  ACTIONS_PAT, VERCEL_TOKEN, Supabase keys).
- A reasonable issue template (deferred — single-flow site).

## What it is NOT doing

- Private repo (we're public)
- Multi-repo / monorepo
- GitHub Pages (Vercel deploys)
- Discussions (defer)
- Projects/Milestones (the loop owns scheduling)

---

## Automated by `/bootstrap`

- Section A (repo create) — `gh repo create`
- Section B (repo settings) — `gh repo edit`
- Section E (Actions secrets propagation) — `gh secret set`
- Section F (Actions variables) — `gh variable set`
- Section K (topics + description) — `gh repo edit --add-topic`

Handoffs:

- Section D (Claude Code GitHub App install) — pause + verify

---

## Section A — Repository creation

- [ ] Repo: `daretodave/ember`
- [ ] Visibility: public
- [ ] Initialized with: nothing (locally we have spec.md +
      adoption scaffold)
- [ ] Topics: `daily-practice`, `journaling`, `supabase`,
      `nextjs`, `nexus`

## Section B — Branch protection

Defer until phase 2 (after substrate ships). The loop pushes
directly during early phases; protection lands once CI checks
exist for it to require.

## Section C — Labels for `/triage`

Defer until phase 9 (when issue triage matters). Bulk-create
with `gh label create` per the runbook script.

## Section D — Cloud loop: prerequisites

### D.1 — Claude Code GitHub App (HANDOFF)

- [ ] Visit https://github.com/apps/claude
- [ ] Install → "Only select repositories" → `daretodave/ember`

### D.2 — Claude Code OAuth token (HANDOFF)

- [ ] `claude setup-token` in a local terminal
- [ ] Paste output to bootstrap when prompted

## Section E — Actions secrets

To be set by `/bootstrap cloud-loop`:

- [ ] `CLAUDE_CODE_OAUTH_TOKEN` — from D.2
- [ ] `ACTIONS_PAT` — fine-grained PAT (Contents R/W, Issues R/W, Actions R/W, Workflows R/W, etc.)
- [ ] `VERCEL_TOKEN` — from `.env`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_PROJECT_ID`
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`

## Section F — Actions variables

- [ ] `VERCEL_PROJECT_ID`
- [ ] `VERCEL_TEAM_ID`
- [ ] `SUPABASE_REGION`
- [ ] `DEFAULT_BRANCH` = `main`

## Section G — Repo settings

- [ ] Features: Wikis OFF, Issues ON, Discussions OFF, Projects OFF
- [ ] Pull Requests: Squash merge ON, auto-delete branches ON
- [ ] Actions: Read+write permissions ON

## Section K — Topics + description

- [ ] Description: "A calm daily practice. One prompt, one tiny task, a quiet mosaic of your attention."
- [ ] Topics: per Section A
- [ ] Website: `https://ember.vercel.app`

---

## Verification

```bash
gh repo view daretodave/ember --json name,visibility,description,homepageUrl
gh secret list -R daretodave/ember
gh variable list -R daretodave/ember
gh api /repos/daretodave/ember/installation
```

## What requires manual post-launch action

- Rotating `ACTIONS_PAT` and `CLAUDE_CODE_OAUTH_TOKEN` every 90 days.
- Enabling branch protection once CI checks exist (phase 2+).
