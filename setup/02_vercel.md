# Vercel setup — Ember

> Production hosting + deploy gate. Project config, env-var
> propagation, region alignment with Supabase us-west-1,
> build settings.
>
> **Project:** `ember` (decided in `setup/bootstrap.local.json`)

---

## What Ember needs from Vercel

- Auto-deploy on push to `main` (Production)
- Auto-deploy on PRs (Preview)
- ~14 env vars propagated across Production + Preview + Development
- Function region **pdx1** (Portland, closest to Supabase us-west-1)
- Edge runtime support for middleware (session cookie issuance)
- Deploy Gate API access (the loop polls Vercel for HEAD's state)
- Speed Insights for performance signal

## What it is NOT doing

- Custom domain (defer to v1.5; `ember.vercel.app` is fine)
- Vercel Postgres (Supabase owns DB)
- Vercel Blob (no images in v1)
- Vercel Cron (cloud loop runs on GitHub Actions)
- Web Analytics (defer for privacy posture)

---

## Automated by `/bootstrap`

- Section A (account check) — `vercel whoami`
- Section B (project create + link) — `vercel link`
- Section C (build settings) — auto-detected by framework preset
- Section D (env-var propagation) — `vercel env add`

Handoffs:

- Section E (custom domain — deferred, no work in v1)
- Section F (region selection — dashboard-only in current CLI)
- Section H (Speed Insights toggle — dashboard click)

---

## Section A — Account + team

- [ ] vercel.com account
- [ ] Team membership (empty in `bootstrap.local.json` → personal)

## Section B — Project creation

- [ ] Project name: `ember`
- [ ] Linked to `daretodave/ember`
- [ ] Framework preset: Next.js

## Section C — Build & development settings

- [ ] Framework Preset: Next.js
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `pnpm install --frozen-lockfile`
- [ ] Node.js Version: 22.x

## Section D — Environment Variables

To be populated by `/bootstrap vercel` after Supabase setup:

| Variable | Production | Preview | Development |
|---|:-:|:-:|:-:|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✓ | ✓ | ✓ |
| `SUPABASE_PROJECT_ID` | ✓ | ✓ | ✓ |
| `SUPABASE_REGION` | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | |
| `SUPABASE_DB_PASSWORD` | ✓ | ✓ | |
| `DATABASE_URL` | ✓ | ✓ | |
| `DIRECT_URL` | ✓ | ✓ | |
| `ANTHROPIC_API_KEY` (v1.5+) | ✓ | ✓ | |

## Section E — Domains

- [ ] `ember.vercel.app` (auto-assigned)
- Custom domain — defer

## Section F — Function regions (HANDOFF)

- [ ] Region: `pdx1` — set in Vercel dashboard Settings → Functions
      (the CLI does not yet support region pinning)

## Section G — Deploy hooks

- Defer (not needed in v1)

## Section H — Speed Insights (HANDOFF)

- [ ] Enable Speed Insights in Vercel dashboard

## Section I — Notifications

- [ ] Production deployment failures: ON
- [ ] Preview deployment failures: ON

## Section J — Deploy gate

For `scripts/deploy-check.mjs` (added in phase 1):

- [ ] `VERCEL_TOKEN` in `.env`
- [ ] `VERCEL_PROJECT_ID` in `.env`
- [ ] `VERCEL_TEAM_ID` in `.env` (if applicable)
- [ ] `DEPLOY_PROVIDER=vercel` in `.env`

---

## Verification

```bash
vercel whoami
vercel ls
vercel env ls production
vercel inspect ember.vercel.app
```

## What requires manual post-launch action

- Custom domain purchase + DNS (v1.5)
- Region pin to pdx1 in dashboard
- Speed Insights enablement
