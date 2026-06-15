# Phase 33 — Daily reminder

> Opt-in daily email nudge to write today's entry.

## Outcome

Users who enable the setting receive one plain-text email per day at their
chosen local time (e.g. 8am). The email is never sent if they have already
written today. Turning the toggle off in /settings is instant unsubscribe.
Voice is calm, zero-pressure, no streak framing.

## Why

The spec deferred daily reminders as a v1.5 experiment. This phase ships it
as opt-in-off-by-default so it cannot affect users who don't ask for it, while
giving motivated practitioners a gentle nudge without requiring them to build
a habit of checking the site.

## Routes / API endpoints

No new public routes. Changes are:
- `POST /api/settings` — already exists; extended to accept `reminder_opt_in`
  (boolean) and `reminder_hour` (integer 0–23).
- `scripts/remind.mjs` — standalone Node script invoked by GitHub Actions
  hourly; not a Next.js route. Uses native `fetch()` only — no pnpm install
  needed in the workflow.

## Data reads

| Helper | Call | Use |
|---|---|---|
| profiles (REST) | `GET /rest/v1/profiles?reminder_opt_in=eq.true` | opt-in users not yet reminded today |
| entries (REST) | `GET /rest/v1/entries?user_id=eq.X&date=eq.YYYY-MM-DD` | check if today's entry exists |
| auth admin (REST) | `GET /auth/v1/admin/users/:id` | get user email |

## Schema (migration)

`supabase/migrations/20260616000000_reminder_columns.sql`:
```sql
alter table public.profiles
  add column if not exists reminder_opt_in boolean not null default false,
  add column if not exists reminder_hour smallint not null default 8
    check (reminder_hour >= 0 and reminder_hour <= 23),
  add column if not exists last_reminder_sent_at timestamptz;
```

## Components / handlers

New:
- `src/lib/reminder.ts` — pure functions: `todayInTimezone`, `currentHourInTimezone`,
  `buildReminderText`, `buildReminderSubject`
- `src/lib/__tests__/reminder.test.ts` — unit tests
- `scripts/remind.mjs` — hourly runner; native fetch; graceful no-op if RESEND_API_KEY absent
- `.github/workflows/remind.yml` — hourly GH Actions cron

Modified:
- `src/lib/profile.ts` — add `reminder_opt_in`, `reminder_hour`, `last_reminder_sent_at` to ProfileRow
- `src/app/settings/SettingsForm.tsx` — add reminder toggle + hour picker
- `src/app/api/settings/route.ts` — accept reminder fields in PATCH payload
- `src/app/settings/page.tsx` — pass reminder fields from profile
- `src/app/settings/__tests__/SettingsForm.test.tsx` — update save-payload tests

## Email content (voice per bearings.md)

Subject: `today's prompt is waiting.`
Body (plain text):
```
today's prompt is waiting.

https://ember-rust-sigma.vercel.app/today

---
to stop these reminders, visit https://ember-rust-sigma.vercel.app/settings and turn off daily reminder.
```

No HTML email in v1 — plain text only. No salutation, no name, no praise, no
streak copy. One line, one link, one unsubscribe path.

## Cross-links

- In: /settings (existing, extended)
- Out: /today (linked in email)
- Retro-fit: none needed — the setting lives on existing /settings

## SEO / metadata

None — no new routes.

## Empty / error states

- RESEND_API_KEY absent → log `remind: mail not configured — skipping.`, exit 0
- RESEND_FROM_EMAIL absent → same
- Supabase unreachable → log error, exit 1 (workflow shows as failure; does not affect app)
- User has already written today → skip silently
- last_reminder_sent_at set today → skip silently (deduplication)
- `currentHourInTimezone` falls back to UTC hour on bad timezone string

## Decisions made upfront — DO NOT ASK

1. **Mail provider: Resend (free tier).** No existing transactional mail path.
   Resend's free tier (3k emails/month) is not paid infra. Uses Resend REST API
   directly via Node native `fetch()` — no new npm dependency. Requires
   `RESEND_API_KEY` + `RESEND_FROM_EMAIL` GitHub secrets. Graceful no-op if absent.
2. **Delivery mechanism: GitHub Actions hourly cron.** Simpler than pg_cron +
   pg_net. The remind workflow installs nothing — script uses only native Node 22
   APIs (`fetch`, `Intl`). Light on resources.
3. **Deduplication: `last_reminder_sent_at` on profiles.** Skip if already set
   to today (UTC). Avoids sending twice if the workflow fires twice in the same
   hour window. Set atomically after a successful send via PATCH.
4. **`reminder_hour` default: 8.** 8am local time is a sensible default for a
   "before the day swallows you" product.
5. **UI: reuse radio-button pattern.** Same `off / on` pair as prompt variety,
   followed by a conditional hour `<select>` using the existing `.select` CSS
   class. No new CSS classes.
6. **Unsubscribe: settings toggle only.** No separate unsubscribe URL in v1.
   The email links to /settings where the toggle is immediately visible. Adequate
   for a personal single-user app at this stage.
7. **No REMIND_SECRET.** The remind script connects directly to Supabase with
   the service role key. No Next.js API endpoint needed.

## Mobile reflow

Settings page already tested at 375px. The hour select uses the existing
`.select` class which is already responsive. No new CSS needed.

## Pages × tests matrix

| Surface | Unit | E2E |
|---|---|---|
| `src/lib/reminder.ts` | `reminder.test.ts` | — |
| `SettingsForm` | `SettingsForm.test.tsx` (updated) | existing auth-redirect spec |

No new e2e spec — the only testable anonymous surface is the settings redirect,
already covered by `settings.spec.ts`.

## Verify gate

```bash
pnpm verify   # typecheck → test:run → build → e2e
```

## Commit body template

```
feat: daily reminder — phase 33

- add reminder_opt_in / reminder_hour / last_reminder_sent_at to profiles (migration)
- settings form: off/on toggle + hour picker, included in save payload
- src/lib/reminder.ts: pure helpers (todayInTimezone, currentHourInTimezone, buildReminderText)
- scripts/remind.mjs: hourly sender via Resend REST API; graceful no-op if RESEND_API_KEY absent
- .github/workflows/remind.yml: runs remind.mjs at the top of every hour

Decisions:
- mail provider: Resend free tier (native fetch — no new npm dep; RESEND_API_KEY + RESEND_FROM_EMAIL required)
- delivery: GitHub Actions hourly cron; script uses Node 22 native APIs only
- deduplication: last_reminder_sent_at on profiles; skip if already sent today UTC
- unsubscribe: settings toggle only; email links to /settings

Closes #53
```

## DoD

- [ ] Migration adds 3 columns to profiles
- [ ] ProfileRow type includes new fields
- [ ] SettingsForm shows reminder toggle; hour picker conditionally visible
- [ ] API settings route handles reminder_opt_in + reminder_hour
- [ ] `pnpm verify` green
- [ ] scripts/remind.mjs sends via Resend when key present; skips gracefully when absent
- [ ] remind.yml workflow created

## Follow-ups (out of scope)

- HTML email template with brand type
- Unsubscribe URL (`/unsubscribe?token=...`) for email-only unsubscribe
- Delivery analytics (sent count, open rate) — explicitly out of scope per no-analytics rule
- pg_cron alternative path
