#!/usr/bin/env node
// scripts/remind.mjs
//
// Daily reminder sender for ember.
//
// Invoked hourly by .github/workflows/remind.yml. Queries Supabase for users
// who opted in to daily reminders, have not yet written today's entry, and are
// at their chosen reminder hour in their local timezone. Sends one plain-text
// email via the Resend API.
//
// Required env vars:
//   NEXT_PUBLIC_SUPABASE_URL        — e.g. https://xyz.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY       — service-role secret key
//   RESEND_API_KEY                  — Resend free-tier API key
//   RESEND_FROM_EMAIL               — verified sender address (e.g. reminder@yourdomain.com)
//
// Optional:
//   EMBER_URL                       — defaults to https://ember-rust-sigma.vercel.app
//
// If RESEND_API_KEY or RESEND_FROM_EMAIL is absent the script exits 0 with a
// warning — the feature is not yet configured but should not fail CI.

import fs from 'node:fs'

// --- load .env if present ---
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL
const EMBER_URL = process.env.EMBER_URL ?? 'https://ember-rust-sigma.vercel.app'

// Guard: mail credentials not configured yet — skip gracefully
if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
  console.log('remind: RESEND_API_KEY or RESEND_FROM_EMAIL not set — mail not configured, skipping.')
  process.exit(0)
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('remind: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing.')
  process.exit(1)
}

// ---- pure helpers (mirrors src/lib/reminder.ts) ----

function todayInTimezone(timezone) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

function currentHourInTimezone(timezone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(new Date())
    const h = parts.find((p) => p.type === 'hour')
    const val = parseInt(h?.value ?? '0', 10)
    return val === 24 ? 0 : val
  } catch {
    return new Date().getUTCHours()
  }
}

function buildReminderText() {
  return [
    "today's prompt is waiting.",
    '',
    `${EMBER_URL}/today`,
    '',
    '---',
    `to stop these reminders, visit ${EMBER_URL}/settings and turn off daily reminder.`,
  ].join('\n')
}

// ---- Supabase REST helpers ----

const SUPA_HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

async function supaGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: { ...SUPA_HEADERS, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Supabase GET ${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function supaAdminGet(path) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Supabase admin GET ${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function supaPatch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: 'PATCH',
    headers: { ...SUPA_HEADERS, Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Supabase PATCH ${path} → ${res.status}: ${await res.text()}`)
}

// ---- Resend ----

async function sendEmail(to) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject: "today's prompt is waiting.",
      text: buildReminderText(),
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
}

// ---- main ----

async function main() {
  const utcToday = new Date().toISOString().slice(0, 10)

  // Fetch all opted-in profiles not yet reminded today.
  // PostgREST `or` filter handles the NULL case.
  const orFilter = encodeURIComponent(`(last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${utcToday}T00:00:00Z)`)
  const profiles = await supaGet(
    `/profiles?reminder_opt_in=eq.true&or=${orFilter}&select=user_id,display_name,timezone,reminder_hour`,
  )

  console.log(`remind: ${profiles.length} opted-in profile(s) eligible for today`)

  let sent = 0
  let skipped = 0

  for (const profile of profiles) {
    try {
      // Check if it is the user's reminder hour right now
      const currentHour = currentHourInTimezone(profile.timezone)
      if (currentHour !== profile.reminder_hour) {
        skipped++
        continue
      }

      // Check if they have already written today
      const userToday = todayInTimezone(profile.timezone)
      const entries = await supaGet(
        `/entries?user_id=eq.${profile.user_id}&date=eq.${userToday}&select=date`,
      )
      if (entries.length > 0) {
        skipped++
        continue
      }

      // Get the user's email from the auth admin API
      const userRecord = await supaAdminGet(`/auth/v1/admin/users/${profile.user_id}`)
      const email = userRecord?.email
      if (!email) {
        console.warn(`remind: no email for user ${profile.user_id} — skipping`)
        skipped++
        continue
      }

      // Send the reminder
      await sendEmail(email)

      // Mark as sent (deduplication for subsequent hourly runs today)
      await supaPatch(`/profiles?user_id=eq.${profile.user_id}`, {
        last_reminder_sent_at: new Date().toISOString(),
      })

      console.log(`remind: sent to ${email.replace(/@.*/, '@...')}`)
      sent++
    } catch (err) {
      console.error(`remind: error for user ${profile.user_id}: ${err.message}`)
      skipped++
    }
  }

  console.log(`remind: done. sent=${sent} skipped=${skipped}`)
}

main().catch((err) => {
  console.error('remind: fatal:', err.message)
  process.exit(1)
})
