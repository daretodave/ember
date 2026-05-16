#!/usr/bin/env node
/**
 * Apply pending Supabase migrations.
 *
 * Resolution order:
 *   1. SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_ID → npx supabase db push (linked)
 *   2. DATABASE_URL or DIRECT_URL → npx supabase db push --db-url
 *   3. SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_ID → build pooler URL, push
 *   4. No credentials → print SQL and instructions
 *
 * Usage:
 *   pnpm db:migrate
 */

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const migrationsDir = join(root, 'supabase', 'migrations')

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL

function run(cmd, env = {}) {
  execSync(cmd, {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, ...env },
  })
}

function getMigrationFiles() {
  if (!existsSync(migrationsDir)) return []
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
}

function printManualInstructions() {
  const files = getMigrationFiles()
  if (files.length === 0) {
    console.log('No migration files found in supabase/migrations/.')
    return
  }

  console.log('\n--- MANUAL MIGRATION INSTRUCTIONS ---')
  console.log('Open the Supabase SQL Editor for your project:')
  console.log(`  https://supabase.com/dashboard/project/${PROJECT_ID || '<your-project-id>'}/sql/new`)
  console.log('\nRun the following SQL in order:\n')

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    console.log(`-- ${file}`)
    console.log(sql)
    console.log('------')
  }
}

if (ACCESS_TOKEN && PROJECT_ID) {
  console.log('Using SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_ID...')
  run('npx supabase db push --linked --yes', {
    SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN,
  })
} else if (DATABASE_URL) {
  console.log('Using DATABASE_URL for db push...')
  run(`npx supabase db push --db-url "${DATABASE_URL}" --yes`)
} else if (DB_PASSWORD && PROJECT_ID) {
  const encoded = encodeURIComponent(DB_PASSWORD)
  const poolerUrl = `postgresql://postgres.${PROJECT_ID}:${encoded}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
  console.log(`Using pooler URL for project ${PROJECT_ID}...`)
  try {
    run(`npx supabase db push --db-url "${poolerUrl}" --yes`)
  } catch {
    console.error('Pooler connection failed. Falling back to manual instructions.')
    printManualInstructions()
    process.exit(1)
  }
} else {
  console.warn('No Supabase credentials found in environment.')
  printManualInstructions()
  process.exit(1)
}
