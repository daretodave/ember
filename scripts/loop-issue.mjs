#!/usr/bin/env node
// scripts/loop-issue.mjs
//
// GitHub issue mirroring for the autonomous loop.
//
// Sub-commands:
//   open             Create a loop-finding issue; echo the issue number.
//   close-comment    Post a "fixed in <sha>" comment on an existing issue.
//   phase-open       Idempotent open/reopen a phase mirror issue; echo the number.
//   phase-close      Post a "shipped in <sha> · deployed at <url>" comment.
//
// Failure is always a warning, never a blocker.  Every sub-command exits 0
// unless the sub-command itself is unknown (exit 1 for typo detection).
//
// Auth: GH_TOKEN from env or .env; GH_REPO defaults to daretodave/ember.

import { execSync, execFileSync } from 'node:child_process'
import fs from 'node:fs'

// --- load .env if present (same pattern as deploy-check.mjs) ---
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const GH_TOKEN = process.env.GH_TOKEN
const GH_REPO = process.env.GH_REPO ?? 'daretodave/ember'
const LOOP_LABEL = 'loop:opened'

// ---- arg parsing ----

const [, , subcommand, ...rest] = process.argv

function parseFlags(args) {
  const flags = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      flags[key] = args[i + 1] ?? true
      i++
    }
  }
  return flags
}

// ---- gh wrapper ----

function gh(...args) {
  const env = { ...process.env }
  if (GH_TOKEN) env.GH_TOKEN = GH_TOKEN
  return execFileSync('gh', args, { encoding: 'utf-8', env }).trim()
}

function ghSafe(...args) {
  try {
    return gh(...args)
  } catch (err) {
    return null
  }
}

// ---- label guard ----

function ensureLabel() {
  try {
    gh('label', 'list', '--repo', GH_REPO, '--search', LOOP_LABEL, '--json', 'name', '--jq', '.[0].name')
  } catch {
    // label list failed; try to create it (best-effort)
    ghSafe('label', 'create', LOOP_LABEL, '--repo', GH_REPO, '--color', '0075ca', '--description', 'Opened by the autonomous loop')
    return
  }
  // if label not found, create it
  try {
    const found = gh('label', 'list', '--repo', GH_REPO, '--search', LOOP_LABEL, '--json', 'name', '--jq', '.[0].name')
    if (!found || found === 'null') {
      ghSafe('label', 'create', LOOP_LABEL, '--repo', GH_REPO, '--color', '0075ca', '--description', 'Opened by the autonomous loop')
    }
  } catch {
    // ignore
  }
}

// ---- sub-commands ----

async function cmdOpen(flags) {
  if (!GH_TOKEN) {
    console.error('loop-issue: open: GH_TOKEN not set — skipping mirror')
    return
  }
  if (!flags.title || !flags['body-file']) {
    console.error('loop-issue: open: --title and --body-file are required')
    return
  }

  ensureLabel()

  const args = [
    'issue', 'create',
    '--repo', GH_REPO,
    '--title', flags.title,
    '--body-file', flags['body-file'],
    '--label', LOOP_LABEL,
  ]

  const out = gh(...args)
  // gh returns the issue URL; extract the number
  const match = out.match(/\/issues\/(\d+)/)
  if (match) {
    process.stdout.write(match[1] + '\n')
  } else {
    console.error('loop-issue: open: could not parse issue number from: ' + out)
  }
}

async function cmdCloseComment(flags) {
  if (!GH_TOKEN) {
    console.error('loop-issue: close-comment: GH_TOKEN not set — skipping')
    return
  }
  if (!flags.number) {
    console.error('loop-issue: close-comment: --number is required')
    return
  }

  const sha = flags.commit ?? '(unknown)'
  const url = flags['deploy-url'] ?? ''
  const body = url
    ? `fixed in \`${sha}\` · deployed at ${url}`
    : `fixed in \`${sha}\``

  gh('issue', 'comment', String(flags.number), '--repo', GH_REPO, '--body', body)
}

async function cmdPhaseOpen(flags) {
  if (!GH_TOKEN) {
    console.error('loop-issue: phase-open: GH_TOKEN not set — skipping mirror')
    return
  }
  if (!flags.phase || !flags.title || !flags['body-file']) {
    console.error('loop-issue: phase-open: --phase, --title, and --body-file are required')
    return
  }

  const prefix = `Phase ${flags.phase} — `

  // Search open issues first
  const openJson = ghSafe(
    'issue', 'list',
    '--repo', GH_REPO,
    '--state', 'open',
    '--search', `"${prefix}" in:title`,
    '--json', 'number,title',
    '--limit', '20',
  )

  if (openJson) {
    try {
      const issues = JSON.parse(openJson)
      const match = issues.find((i) => i.title.startsWith(prefix))
      if (match) {
        process.stdout.write(String(match.number) + '\n')
        return
      }
    } catch {
      // parse error — fall through
    }
  }

  // Search closed issues
  const closedJson = ghSafe(
    'issue', 'list',
    '--repo', GH_REPO,
    '--state', 'closed',
    '--search', `"${prefix}" in:title`,
    '--json', 'number,title',
    '--limit', '20',
  )

  if (closedJson) {
    try {
      const issues = JSON.parse(closedJson)
      const match = issues.find((i) => i.title.startsWith(prefix))
      if (match) {
        // reopen it
        ghSafe('issue', 'reopen', String(match.number), '--repo', GH_REPO)
        process.stdout.write(String(match.number) + '\n')
        return
      }
    } catch {
      // parse error — fall through to create
    }
  }

  // Create new
  ensureLabel()

  const out = gh(
    'issue', 'create',
    '--repo', GH_REPO,
    '--title', flags.title,
    '--body-file', flags['body-file'],
    '--label', LOOP_LABEL,
  )

  const match = out.match(/\/issues\/(\d+)/)
  if (match) {
    process.stdout.write(match[1] + '\n')
  } else {
    console.error('loop-issue: phase-open: could not parse issue number from: ' + out)
  }
}

async function cmdPhaseClose(flags) {
  if (!GH_TOKEN) {
    console.error('loop-issue: phase-close: GH_TOKEN not set — skipping')
    return
  }
  if (!flags.phase) {
    console.error('loop-issue: phase-close: --phase is required')
    return
  }

  const prefix = `Phase ${flags.phase} — `

  // Find the issue (open or recently closed by the commit trailer)
  let issueNumber = null

  for (const state of ['open', 'closed']) {
    const json = ghSafe(
      'issue', 'list',
      '--repo', GH_REPO,
      '--state', state,
      '--search', `"${prefix}" in:title`,
      '--json', 'number,title',
      '--limit', '20',
    )
    if (json) {
      try {
        const issues = JSON.parse(json)
        const match = issues.find((i) => i.title.startsWith(prefix))
        if (match) {
          issueNumber = match.number
          break
        }
      } catch {
        // ignore
      }
    }
  }

  if (!issueNumber) {
    console.error(`loop-issue: phase-close: no issue found with prefix "${prefix}"`)
    return
  }

  const sha = flags.commit ?? '(unknown)'
  const url = flags['deploy-url'] ?? ''
  const body = url
    ? `shipped in \`${sha}\` · deployed at ${url}`
    : `shipped in \`${sha}\``

  gh('issue', 'comment', String(issueNumber), '--repo', GH_REPO, '--body', body)
}

// ---- dispatch ----

if (!subcommand || subcommand === '--help' || subcommand === '-h') {
  console.error('Usage: loop-issue.mjs <open|close-comment|phase-open|phase-close> [flags]')
  process.exit(1)
}

const flags = parseFlags(rest)

try {
  if (subcommand === 'open') {
    await cmdOpen(flags)
  } else if (subcommand === 'close-comment') {
    await cmdCloseComment(flags)
  } else if (subcommand === 'phase-open') {
    await cmdPhaseOpen(flags)
  } else if (subcommand === 'phase-close') {
    await cmdPhaseClose(flags)
  } else {
    console.error(`loop-issue: unknown sub-command "${subcommand}". Known: open, close-comment, phase-open, phase-close`)
    process.exit(1)
  }
} catch (err) {
  console.error(`loop-issue: ${subcommand} failed: ${err.message ?? err}`)
  // exit 0 — failure is a warning, not a blocker
}
