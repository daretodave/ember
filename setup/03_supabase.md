# Supabase setup — Ember

> Auth (magic-link) + Postgres (entries, profiles). Region
> aligned with Vercel pdx1 — both in us-west.
>
> **Project:** `ember` (decided in `setup/bootstrap.local.json`)

---

## What Ember needs from Supabase

- A Postgres project in `us-west-1`
- Supabase Auth with **magic-link only** (no social, no
  password)
- Email template tuned to Ember's voice
- RLS policies on every table (users can only read/write
  their own entries; public entries readable by anyone)
- Pooler + direct DB URLs for runtime + migrations
- Storage: not in v1; entries are text only

## What it is NOT doing

- Social login (Google, GitHub, etc.) — magic-link only
- Password auth — magic-link only
- Storage — text entries only in v1
- Realtime — pull-based site, no live updates
- Edge Functions — server actions handle our needs
- Vector / pgvector — no AI features in v1

---

## Automated by `/bootstrap`

- Section A (project create) — `supabase projects create`
- Section B (project link) — `supabase link`
- Section H (env-var propagation to .env) — auto

Handoffs:

- Section C (Auth config — magic-link only) — dashboard
- Section D (email template tuning) — dashboard
- Section E (RLS policies) — landed via migrations in
  phase 4+, not in bootstrap

---

## Section A — Project creation

- [ ] Org: per `bootstrap.local.json` (empty = personal)
- [ ] Project name: `ember`
- [ ] Region: `us-west-1` (matches Vercel pdx1)
- [ ] DB password: bootstrap generates 32-char random
      (stored in `.env` as `SUPABASE_DB_PASSWORD`; you cannot
      retrieve it from Supabase later)

## Section B — Project link (local CLI)

- [ ] `supabase link --project-ref <id>` — done by bootstrap

## Section C — Auth config (HANDOFF)

Path: **Authentication → Providers → Email**

- [ ] **Enable Email**: ON
- [ ] **Confirm email**: OFF (magic-link bypasses confirm step)
- [ ] **Secure email change**: ON
- [ ] **Magic Link**: ON
- [ ] **Email password**: OFF

Path: **Authentication → URL Configuration**

- [ ] **Site URL**: `https://ember.vercel.app`
- [ ] **Redirect URLs:** add
      `http://localhost:3000/auth/callback`,
      `https://ember.vercel.app/auth/callback`,
      `https://*.vercel.app/auth/callback` (for preview deploys)

## Section D — Email templates (HANDOFF)

Path: **Authentication → Email Templates → Magic Link**

- [ ] **Subject**: "Sign in to ember"
- [ ] **Body**: short, plain, no exclamation points

Default template works at v1; tune in phase 4 when auth lands.

## Section E — RLS policies (LANDED VIA MIGRATIONS)

Tables (defined in phase 4–8 migrations):

- `profiles` — one row per auth.user; columns: id, username, display_name, timezone
- `entries` — one row per (user_id, date); columns: user_id, date, prompt_id, text, task_done, published
- `prompts` — global seed list; columns: id, text, task

RLS shape:

- `entries`: users can read+write their own; published entries are readable by anyone
- `profiles`: users can read+write their own; public usernames are readable by anyone
- `prompts`: anyone can read; no writes from app (seeded via migration)

## Section F — Indexes (LANDED VIA MIGRATIONS)

- `entries(user_id, date desc)` — log view
- `entries(published) where published = true` — public profile
- `profiles(username) where username is not null` — public profile lookup

## Section G — Connection URLs

`.env` after `/bootstrap supabase`:

- `NEXT_PUBLIC_SUPABASE_URL` — `https://<project>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public anon key (HANDOFF — paste from dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only (HANDOFF — paste from dashboard)
- `SUPABASE_PROJECT_ID` — project ref
- `SUPABASE_REGION` — `us-west-1`
- `SUPABASE_DB_PASSWORD` — auto-generated
- `DATABASE_URL` — pooler URL (HANDOFF — paste from dashboard)
- `DIRECT_URL` — direct URL (HANDOFF — paste from dashboard)

## Section H — Env propagation to Vercel

Handled by `/bootstrap vercel` after Supabase is wired. The
above 8 keys land in Vercel env (prod + preview + dev as
appropriate).

---

## Verification

```bash
supabase projects list
supabase status
psql "$DATABASE_URL" -c "select 1"
```

## What requires manual post-launch action

- Configure custom SMTP (defer until phase 4 if Supabase
  dev SMTP rate-limits become a problem)
- Tune email template copy (in phase 4)
- Set up scheduled DB backups (defer)
