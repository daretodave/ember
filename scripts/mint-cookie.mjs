// scripts/mint-cookie.mjs
//
// Mint a Supabase session for the critique bot user and cache the
// @supabase/ssr cookie set at .cache/e2e-cookie.json, so the cloud
// /critique authenticated pass can attach a real logged-in session
// without driving a browser through the magic-link email flow.
//
// ember authenticates with Supabase magic-link — there is no password
// to grant against. So the mint runs fully server-side:
//
//   1. a service-role admin client ensures the bot user exists
//   2. admin.generateLink({ type: 'magiclink' }) returns a token hash
//      (generateLink only RETURNS the link — no email is ever sent)
//   3. a @supabase/ssr server client verifies that token hash; the
//      SAME library the live app uses then writes the session cookies
//      into an in-memory jar through its setAll adapter
//   4. the captured cookie set is cached verbatim
//
// Capturing the cookies THROUGH @supabase/ssr — rather than
// hand-encoding them — means the cookie shape (names, base64
// envelope, chunk boundaries) can never drift from what the live
// app's createServerClient expects: same package version, same
// project ref. See src/lib/supabase/server.ts.
//
// Required env (.env locally, or CI job secrets):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
// Optional:
//   E2E_USER_EMAIL          — bot address; defaults to the constant below
//   E2E_COOKIE_CACHE_PATH   — defaults to .cache/e2e-cookie.json
//
// Usage:  node scripts/mint-cookie.mjs

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

// Re-mint when the session is within this window of expiry, so a
// walk never starts against an about-to-expire cookie.
export const REFRESH_WINDOW_MS = 5 * 60_000

// Bot identity. example.com is IANA-reserved — nothing is ever
// deliverable there — and generateLink does not send mail anyway.
export const DEFAULT_BOT_EMAIL = 'ember-critique-bot@example.com'

const DEFAULT_CACHE_PATH = resolve(REPO_ROOT, '.cache/e2e-cookie.json')

// Best-effort .env loader. Mirrors scripts/migrate.mjs so a bare
// `node scripts/mint-cookie.mjs` works without a wrapper. Never
// overrides an already-set process.env value (CI secrets win).
export function loadDotenv(path = resolve(REPO_ROOT, '.env')) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

// The Supabase project ref is the first label of the API hostname:
// https://<ref>.supabase.co. Used only for cache metadata.
export function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split('.')[0] || null
  } catch {
    return null
  }
}

export function readCache(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

export function writeCache(payload, path) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(payload, null, 2), 'utf8')
}

// A cache is fresh when it holds a non-empty cookie set comfortably
// clear of expiry. Kept in lockstep with critique-walk.mjs's
// isCookieCacheFresh.
export function isFresh(cached, now = Date.now()) {
  if (
    !cached ||
    !cached.expiresAt ||
    !Array.isArray(cached.cookies) ||
    cached.cookies.length === 0
  ) {
    return false
  }
  const exp = Date.parse(cached.expiresAt)
  if (Number.isNaN(exp)) return false
  return exp - now > REFRESH_WINDOW_MS
}

// Create the bot user if absent. Idempotent: an existing user yields
// a benign "already registered" error which is swallowed.
async function ensureBotUser(admin, email) {
  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (error && !/already|registered|exist/i.test(error.message || '')) {
    throw new Error(`createUser failed: ${error.message}`)
  }
}

// Run the server-side mint. Returns { cookies, session, user }.
export async function mintCookies({ url, serviceKey, anonKey, email }) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  await ensureBotUser(admin, email)

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (linkErr) throw new Error(`generateLink failed: ${linkErr.message}`)
  const tokenHash = link?.properties?.hashed_token
  if (!tokenHash) throw new Error('generateLink returned no hashed_token')

  // An in-memory cookie jar standing in for the framework's cookie
  // store. @supabase/ssr writes the session through setAll exactly
  // as it would in src/lib/supabase/server.ts.
  const jar = new Map()
  const ssr = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, c]) => ({ name, value: c.value }))
      },
      setAll(list) {
        for (const c of list) {
          // An empty value is a deletion (a dropped chunk).
          if (c.value === '' || c.value == null) {
            jar.delete(c.name)
          } else {
            jar.set(c.name, { value: c.value, options: c.options ?? {} })
          }
        }
      },
    },
  })

  // The verify type a magic-link token hash expects has shifted
  // across Supabase versions ('magiclink' vs the unified 'email').
  // Try the type generateLink reported, then the known fallbacks.
  const candidates = [link?.properties?.verification_type, 'magiclink', 'email']
  const verifyTypes = [...new Set(candidates.filter(Boolean))]
  let session = null
  let lastErr = null
  for (const type of verifyTypes) {
    const { data, error } = await ssr.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error && data?.session) {
      session = data.session
      break
    }
    lastErr = error
  }
  if (!session) {
    throw new Error(`verifyOtp failed: ${lastErr?.message ?? 'no session returned'}`)
  }

  const cookies = [...jar.entries()].map(([name, c]) => ({
    name,
    value: c.value,
    options: c.options,
  }))
  if (cookies.length === 0) {
    throw new Error('no auth cookies were captured from @supabase/ssr')
  }

  return {
    cookies,
    session,
    user: { id: session.user?.id ?? null, email: session.user?.email ?? email },
  }
}

// Top-level mint: cache-hit short-circuit, else mint and cache.
export async function mint({ cachePath = DEFAULT_CACHE_PATH, now = Date.now(), env = process.env } = {}) {
  const cached = readCache(cachePath)
  if (isFresh(cached, now)) {
    return { status: 'cache-hit', payload: cached }
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const email = env.E2E_USER_EMAIL || DEFAULT_BOT_EMAIL
  for (const [name, value] of Object.entries({ url, serviceKey, anonKey })) {
    if (!value) throw new Error(`mint-cookie: missing env ${name}`)
  }

  const { cookies, session, user } = await mintCookies({ url, serviceKey, anonKey, email })
  const expiresAt = session.expires_at
    ? new Date(session.expires_at * 1000).toISOString()
    : new Date(now + 3600_000).toISOString()

  const payload = {
    mintedAt: new Date(now).toISOString(),
    expiresAt,
    projectRef: projectRefFromUrl(url),
    user,
    cookies,
  }
  writeCache(payload, cachePath)
  return { status: 'minted', payload }
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(__filename)

if (invokedDirectly) {
  loadDotenv()
  const cachePath = process.env.E2E_COOKIE_CACHE_PATH
    ? resolve(REPO_ROOT, process.env.E2E_COOKIE_CACHE_PATH)
    : DEFAULT_CACHE_PATH
  try {
    const result = await mint({ cachePath })
    const { cookies, expiresAt, user } = result.payload
    if (result.status === 'cache-hit') {
      console.log(
        `cookie cache hit (expires ${expiresAt}); ${cookies.length} cookie(s) for ${user.email}.`,
      )
    } else {
      console.log(
        `minted session for ${user.email}; ${cookies.length} cookie(s) cached to ${cachePath} (expires ${expiresAt}).`,
      )
    }
    process.exit(0)
  } catch (err) {
    console.error(`mint-cookie: ${err?.message ?? err}`)
    process.exit(1)
  }
}
