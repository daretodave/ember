import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { FullConfig } from '@playwright/test'

const REPO_ROOT = resolve(__dirname, '../..')
const CACHE_PATH = resolve(REPO_ROOT, '.cache/e2e-cookie.json')
const AUTH_DIR = resolve(__dirname, '.auth')
const STORAGE_STATE_PATH = resolve(AUTH_DIR, 'user.json')

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] }, null, 2)

function capitaliseSameSite(v: unknown): 'Strict' | 'Lax' | 'None' | undefined {
  if (typeof v !== 'string') return 'Lax'
  const s = v.toLowerCase()
  if (s === 'strict') return 'Strict'
  if (s === 'none') return 'None'
  return 'Lax'
}

export default async function globalSetup(_config: FullConfig) {
  mkdirSync(AUTH_DIR, { recursive: true })

  const hasSecrets =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!hasSecrets) {
    console.log('globalSetup: no Supabase secrets — writing empty auth state; auth tests will skip')
    writeFileSync(STORAGE_STATE_PATH, EMPTY_STATE)
    return
  }

  try {
    execFileSync('node', [resolve(REPO_ROOT, 'scripts/mint-cookie.mjs')], {
      stdio: 'inherit',
      env: process.env,
    })
  } catch (err) {
    console.warn(`globalSetup: mint-cookie failed — ${(err as Error).message ?? err}`)
    console.warn('Auth tests will skip.')
    writeFileSync(STORAGE_STATE_PATH, EMPTY_STATE)
    return
  }

  if (!existsSync(CACHE_PATH)) {
    console.warn('globalSetup: no cookie cache after mint — writing empty auth state')
    writeFileSync(STORAGE_STATE_PATH, EMPTY_STATE)
    return
  }

  let cached: { cookies: Array<{ name: string; value: string; options?: Record<string, unknown> }> }
  try {
    cached = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    console.warn('globalSetup: could not parse cookie cache — writing empty auth state')
    writeFileSync(STORAGE_STATE_PATH, EMPTY_STATE)
    return
  }

  const pwCookies = (cached.cookies ?? []).map((c) => ({
    name: c.name,
    value: c.value,
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: Boolean(c.options?.httpOnly),
    secure: false,
    sameSite: capitaliseSameSite(c.options?.sameSite),
  }))

  const state = JSON.stringify({ cookies: pwCookies, origins: [] }, null, 2)
  writeFileSync(STORAGE_STATE_PATH, state)
  console.log(`globalSetup: ${pwCookies.length} auth cookie(s) written to .auth/user.json`)
}
