#!/usr/bin/env node
// Playwright-driven critique walk (reader.md Path A2 — CI / cloud).
//
// Drives the headless chromium already installed + cached in
// apps/e2e to walk a URL set in a *fresh isolated browser context*
// (browser.newContext()). Because the context starts clean there is
// no operator profile to inherit — the shared-profile contamination
// that keeps a Chrome-MCP critique local-only cannot occur here. The
// session is whatever `--mode` deterministically sets, nothing else.
//
// Emits the reader finding shape (.claude/agents/reader.md "Finding
// format") plus the raw captures[] the reader agent assesses
// qualitatively:
//
//   { meta, captures: [...], findings: [...] }
//
// Usage:
//   node scripts/critique-walk.mjs \
//     --mode anonymous|authenticated \
//     --base https://ember-rust-sigma.vercel.app \
//     --urls /,/today,/log,/settings \
//     [--cookie-cache .cache/e2e-cookie.json] \
//     [--out path.json] [--timeout 20000]
//
// In authenticated mode the Supabase session is resolved from the
// cookie cache scripts/mint-cookie.mjs writes (.cache/e2e-cookie.json)
// — /critique Step 0 runs the mint right before the walk. A missing,
// stale, or empty cache emits a single auth-failed finding and walks
// NOTHING: no silent fallback to anonymous (reader.md Step 0 hard
// rule 1).

import { createRequire } from 'node:module'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 800 },
}

export const DEFAULT_BASE = 'https://ember-rust-sigma.vercel.app'
export const COOKIE_CACHE_PATH = resolve(REPO_ROOT, '.cache/e2e-cookie.json')

// Mirror of mint-cookie.mjs's REFRESH_WINDOW_MS — a cache within
// 5 min of expiry is treated as absent so a stale session never
// produces a silently-signed-out (and false-finding) walk.
const COOKIE_REFRESH_WINDOW_MS = 5 * 60_000

// True when the cache holds a non-empty cookie set comfortably clear
// of expiry. Kept in lockstep with mint-cookie.mjs#isFresh.
export function isCookieCacheFresh(cached, now = Date.now()) {
  if (
    !cached ||
    !Array.isArray(cached.cookies) ||
    cached.cookies.length === 0 ||
    !cached.expiresAt
  ) {
    return false
  }
  const exp = Date.parse(cached.expiresAt)
  if (Number.isNaN(exp)) return false
  return exp - now > COOKIE_REFRESH_WINDOW_MS
}

function readCookieCache(path) {
  try {
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

// Resolve the authenticated-pass cookie records from the mint cache.
// Returns the cookies[] array on a fresh cache, or [] when the cache
// is absent / stale / malformed — the caller turns [] into a single
// auth-failed finding.
export function resolveSessionCookies({ cachePath = COOKIE_CACHE_PATH, now = Date.now() } = {}) {
  const cached = readCookieCache(cachePath)
  if (cached && isCookieCacheFresh(cached, now)) {
    return cached.cookies
  }
  return []
}

// Build the cookie array handed to context.addCookies().
//   anonymous            → []     (no session attached)
//   authenticated + ok   → [ ...Playwright cookie objects ]
//   authenticated + none → null   (signals auth-failed; walk nothing)
export function buildPlaywrightCookies(mode, cookieRecords, baseUrl) {
  if (mode === 'anonymous') return []
  if (mode !== 'authenticated') throw new Error(`unknown mode: ${mode}`)
  if (!Array.isArray(cookieRecords) || cookieRecords.length === 0) return null

  let secure = false
  try {
    secure = new URL(baseUrl).protocol === 'https:'
  } catch {
    return null
  }

  const out = []
  for (const rec of cookieRecords) {
    if (
      !rec ||
      typeof rec.name !== 'string' ||
      typeof rec.value !== 'string' ||
      rec.name.length === 0 ||
      rec.value.length === 0
    ) {
      return null
    }
    out.push({
      name: rec.name,
      value: rec.value,
      url: baseUrl,
      httpOnly: rec.options?.httpOnly ?? false,
      secure,
      sameSite: 'Lax',
    })
  }
  return out
}

function finding(capture, category, severity, observation, evidence, suggestedFix) {
  return {
    url: capture.url,
    viewport: capture.viewport,
    auth_state: capture.authState,
    category,
    severity,
    observation,
    evidence,
    suggested_fix: suggestedFix,
    source: 'browser',
  }
}

// Derive the mechanically-detectable findings from one capture.
// Qualitative findings (comprehension / voice / navigation) are the
// reader agent's job from capture.text; this flags only hard, citable
// defects. A malformed / errored capture yields a finding, never a
// throw.
export function analyzeCapture(capture) {
  if (!capture || typeof capture !== 'object') {
    return [
      {
        url: '(unknown)',
        viewport: '(unknown)',
        auth_state: 'auth-failed',
        category: 'infra',
        severity: 'high',
        observation: 'walk produced no capture for a URL',
        evidence: String(capture),
        suggested_fix: 'inspect critique-walk.mjs navigation for this URL',
        source: 'browser',
      },
    ]
  }

  const out = []

  if (capture.error) {
    out.push(
      finding(
        capture,
        'infra',
        'high',
        'page failed to load',
        String(capture.error),
        'investigate the route — navigation threw or timed out',
      ),
    )
    return out
  }

  // An authenticated walk that lands on /signin means the attached
  // session was not recognized — the whole authed pass is suspect.
  if (
    typeof capture.authState === 'string' &&
    capture.authState.startsWith('authenticated') &&
    typeof capture.finalUrl === 'string' &&
    /\/signin(?:[/?#]|$)/.test(capture.finalUrl) &&
    !/\/signin/.test(capture.url)
  ) {
    out.push(
      finding(
        capture,
        'infra',
        'high',
        'authenticated walk was redirected to the sign-in page',
        `requested ${capture.url}, landed on ${capture.finalUrl}`,
        're-mint the critique session cookie; the attached session was not recognized',
      ),
    )
  }

  if (typeof capture.status === 'number' && capture.status >= 400) {
    out.push(
      finding(
        capture,
        'infra',
        'high',
        `page returned HTTP ${capture.status}`,
        `status ${capture.status} at ${capture.url}`,
        'fix the route or remove it from the critique set',
      ),
    )
  }

  if (typeof capture.bodyTextLength === 'number' && capture.bodyTextLength < 50) {
    out.push(
      finding(
        capture,
        'infra',
        'high',
        'page rendered blank or near-empty',
        `body text length ${capture.bodyTextLength}`,
        'check SSR/hydration — the page has no readable content',
      ),
    )
  }

  if (capture.hasH1 === false) {
    out.push(
      finding(
        capture,
        'a11y',
        'medium',
        'page has no <h1>',
        'no level-1 heading found in the rendered DOM',
        'add a single descriptive <h1> to the page',
      ),
    )
  }

  if (
    capture.viewport === 'mobile' &&
    typeof capture.scrollWidth === 'number' &&
    typeof capture.innerWidth === 'number' &&
    capture.scrollWidth - capture.innerWidth > 1
  ) {
    out.push(
      finding(
        capture,
        'mobile',
        'high',
        'horizontal scroll at 375px',
        `scrollWidth ${capture.scrollWidth} > innerWidth ${capture.innerWidth}`,
        'find the overflowing element and constrain it to the viewport',
      ),
    )
  }

  if (Array.isArray(capture.consoleErrors) && capture.consoleErrors.length > 0) {
    out.push(
      finding(
        capture,
        'performance',
        'medium',
        `${capture.consoleErrors.length} console error(s)`,
        capture.consoleErrors[0],
        'resolve the JS console error',
      ),
    )
  }

  if (Array.isArray(capture.failedRequests) && capture.failedRequests.length > 0) {
    out.push(
      finding(
        capture,
        'performance',
        'medium',
        `${capture.failedRequests.length} failed first-party request(s)`,
        capture.failedRequests[0],
        'fix the broken asset/endpoint or stop requesting it',
      ),
    )
  }

  if (capture.viewport === 'desktop') {
    if (!capture.title) {
      out.push(
        finding(
          capture,
          'seo',
          'medium',
          'missing <title>',
          'no document title in <head>',
          'add a descriptive <title> via generateMetadata',
        ),
      )
    }
    if (!capture.description) {
      out.push(
        finding(
          capture,
          'seo',
          'medium',
          'missing meta description',
          'no <meta name="description"> in <head>',
          'add a meta description via generateMetadata',
        ),
      )
    }
  }

  return out
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) {
        args[key] = true
      } else {
        args[key] = next
        i += 1
      }
    }
  }
  return args
}

function sameOrigin(reqUrl, baseUrl) {
  try {
    return new URL(reqUrl).origin === new URL(baseUrl).origin
  } catch {
    return false
  }
}

async function walk({ chromium, base, authState, cookies, urls, timeout }) {
  const captures = []
  const browser = await chromium.launch({ headless: true })
  try {
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ viewport: vp })
      if (cookies.length > 0) {
        await context.addCookies(cookies)
      }
      for (const path of urls) {
        const page = await context.newPage()
        const consoleErrors = []
        const failedRequests = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300))
        })
        page.on('requestfailed', (req) => {
          const errorText = req.failure()?.errorText ?? 'failed'
          // ERR_ABORTED is almost always an in-flight Next.js <Link>
          // RSC prefetch cancelled at page teardown — not a real
          // failure, and a user never sees it. Don't count it.
          if (errorText.includes('ERR_ABORTED')) return
          if (sameOrigin(req.url(), base)) {
            failedRequests.push(`${req.url()} — ${errorText}`)
          }
        })
        page.on('response', (res) => {
          if (res.status() >= 400 && sameOrigin(res.url(), base)) {
            failedRequests.push(`${res.url()} — HTTP ${res.status()}`)
          }
        })
        const target = new URL(path, base).href
        const capture = { url: path, viewport: vpName, authState }
        try {
          const resp = await page.goto(target, { waitUntil: 'load', timeout })
          capture.status = resp ? resp.status() : null
          // ember (Next.js App Router) streams route content inside
          // Suspense boundaries that can resolve after the load
          // event. Wait for the network to settle so innerText
          // reflects the full page, not just the layout shell.
          await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {})
          capture.finalUrl = page.url()
          const meta = await page.evaluate(() => {
            const m = (sel) =>
              document.querySelector(sel)?.getAttribute('content') ?? null
            return {
              title: document.title || null,
              description: m('meta[name="description"]'),
              hasH1: !!document.querySelector('h1'),
              bodyTextLength: (document.body?.innerText ?? '').trim().length,
              text: (document.body?.innerText ?? '').trim().slice(0, 4000),
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: window.innerWidth,
            }
          })
          Object.assign(capture, meta)
        } catch (err) {
          capture.error = err instanceof Error ? err.message : String(err)
        }
        capture.consoleErrors = consoleErrors
        capture.failedRequests = failedRequests
        captures.push(capture)
        await page.close()
      }
      await context.close()
    }
  } finally {
    await browser.close()
  }
  return captures
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const mode = args.mode === 'authenticated' ? 'authenticated' : 'anonymous'
  const base = String(args.base || DEFAULT_BASE).replace(/\/$/, '')
  const urls = String(args.urls || '/')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
  const timeout = Number(args.timeout || 20000)
  const cachePath = args['cookie-cache']
    ? resolve(REPO_ROOT, String(args['cookie-cache']))
    : COOKIE_CACHE_PATH

  const cookieRecords = mode === 'authenticated' ? resolveSessionCookies({ cachePath }) : []
  const cookies = buildPlaywrightCookies(mode, cookieRecords, base)
  const authState = mode === 'anonymous' ? 'anonymous' : 'authenticated:critique-bot'

  const emit = (payload) => {
    const json = JSON.stringify(payload, null, 2)
    if (args.out) {
      writeFileSync(resolve(REPO_ROOT, String(args.out)), json)
    } else {
      process.stdout.write(`${json}\n`)
    }
  }

  if (cookies === null) {
    // Authed handshake unusable. One auth-failed finding, no walk.
    emit({
      meta: {
        base,
        mode,
        authState: 'auth-failed',
        generatedAt: new Date().toISOString(),
        urlCount: 0,
      },
      captures: [],
      findings: [
        {
          url: '(pass)',
          viewport: 'n/a',
          auth_state: 'auth-failed',
          category: 'infra',
          severity: 'high',
          observation:
            'authenticated critique pass requested but no valid Supabase session cookie was available',
          evidence:
            'the .cache/e2e-cookie.json mint artifact is missing, stale, or holds no cookies',
          suggested_fix: 'run `node scripts/mint-cookie.mjs` to refresh the session and retry',
          source: 'browser',
        },
      ],
    })
    return
  }

  const require = createRequire(resolve(REPO_ROOT, 'apps/e2e/package.json'))
  const { chromium } = require('@playwright/test')

  const captures = await walk({ chromium, base, authState, cookies, urls, timeout })
  const findings = captures.flatMap(analyzeCapture)

  emit({
    meta: {
      base,
      mode,
      authState,
      generatedAt: new Date().toISOString(),
      urlCount: urls.length,
    },
    captures,
    findings,
  })
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  main().catch((err) => {
    process.stderr.write(`critique-walk: ${err?.stack || err}\n`)
    process.exitCode = 1
  })
}
