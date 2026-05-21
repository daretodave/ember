import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  analyzeCapture,
  buildPlaywrightCookies,
  isCookieCacheFresh,
  resolveSessionCookies,
} from '../../../scripts/critique-walk.mjs'
import { isFresh, projectRefFromUrl } from '../../../scripts/mint-cookie.mjs'

const future = () => new Date(Date.now() + 60 * 60_000).toISOString()
const past = () => new Date(Date.now() - 60 * 60_000).toISOString()
const oneCookie = [{ name: 'sb-ref-auth-token', value: 'abc' }]

describe('buildPlaywrightCookies', () => {
  it('anonymous mode attaches no cookies', () => {
    expect(buildPlaywrightCookies('anonymous', oneCookie, 'https://x.dev')).toEqual([])
  })

  it('authenticated mode with cookies returns Playwright cookie objects', () => {
    const out = buildPlaywrightCookies('authenticated', oneCookie, 'https://x.dev')
    expect(out).toHaveLength(1)
    expect(out?.[0]).toMatchObject({
      name: 'sb-ref-auth-token',
      value: 'abc',
      url: 'https://x.dev',
      secure: true,
    })
  })

  it('authenticated mode with no cookies signals auth-failed (null)', () => {
    expect(buildPlaywrightCookies('authenticated', [], 'https://x.dev')).toBeNull()
    expect(buildPlaywrightCookies('authenticated', null, 'https://x.dev')).toBeNull()
  })

  it('rejects a malformed cookie record', () => {
    expect(
      buildPlaywrightCookies('authenticated', [{ name: '', value: 'v' }], 'https://x.dev'),
    ).toBeNull()
  })

  it('marks the cookie insecure on an http base', () => {
    const out = buildPlaywrightCookies('authenticated', oneCookie, 'http://localhost:3000')
    expect(out?.[0].secure).toBe(false)
  })

  it('throws on an unknown mode', () => {
    expect(() => buildPlaywrightCookies('sideways', oneCookie, 'https://x.dev')).toThrow()
  })
})

describe('isCookieCacheFresh', () => {
  it('true for a non-empty cache well clear of expiry', () => {
    expect(isCookieCacheFresh({ expiresAt: future(), cookies: oneCookie })).toBe(true)
  })

  it('false for an expired cache', () => {
    expect(isCookieCacheFresh({ expiresAt: past(), cookies: oneCookie })).toBe(false)
  })

  it('false when the cache holds no cookies', () => {
    expect(isCookieCacheFresh({ expiresAt: future(), cookies: [] })).toBe(false)
  })

  it('false for a missing or malformed cache', () => {
    expect(isCookieCacheFresh(null)).toBe(false)
    expect(isCookieCacheFresh({ cookies: oneCookie })).toBe(false)
    expect(isCookieCacheFresh({ expiresAt: 'not-a-date', cookies: oneCookie })).toBe(false)
  })
})

describe('resolveSessionCookies', () => {
  let dir = ''
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
  })

  it('returns cookies from a fresh cache file', () => {
    dir = mkdtempSync(join(tmpdir(), 'ember-critique-'))
    const p = join(dir, 'cookie.json')
    writeFileSync(p, JSON.stringify({ expiresAt: future(), cookies: oneCookie }))
    expect(resolveSessionCookies({ cachePath: p })).toEqual(oneCookie)
  })

  it('returns [] for a stale cache file', () => {
    dir = mkdtempSync(join(tmpdir(), 'ember-critique-'))
    const p = join(dir, 'cookie.json')
    writeFileSync(p, JSON.stringify({ expiresAt: past(), cookies: oneCookie }))
    expect(resolveSessionCookies({ cachePath: p })).toEqual([])
  })

  it('returns [] when the cache file is absent', () => {
    expect(
      resolveSessionCookies({ cachePath: join(tmpdir(), 'ember-no-such-cookie.json') }),
    ).toEqual([])
  })
})

describe('analyzeCapture', () => {
  const clean = {
    url: '/',
    viewport: 'desktop',
    authState: 'anonymous',
    status: 200,
    finalUrl: 'https://x.dev/',
    bodyTextLength: 800,
    hasH1: true,
    title: 'ember',
    description: 'a description',
    consoleErrors: [],
    failedRequests: [],
  }

  it('a clean desktop capture yields no findings', () => {
    expect(analyzeCapture(clean)).toEqual([])
  })

  it('flags a failed navigation as high infra', () => {
    const f = analyzeCapture({
      url: '/x',
      viewport: 'desktop',
      authState: 'anonymous',
      error: 'timeout',
    })
    expect(f).toHaveLength(1)
    expect(f[0]).toMatchObject({ category: 'infra', severity: 'high' })
  })

  it('flags an HTTP 5xx status', () => {
    const f = analyzeCapture({ ...clean, status: 500 })
    expect(f.some((x) => x.category === 'infra' && x.severity === 'high')).toBe(true)
  })

  it('flags a near-empty body', () => {
    const f = analyzeCapture({ ...clean, bodyTextLength: 10 })
    expect(f.some((x) => x.observation.includes('blank'))).toBe(true)
  })

  it('flags a missing h1', () => {
    const f = analyzeCapture({ ...clean, hasH1: false })
    expect(f.some((x) => x.category === 'a11y')).toBe(true)
  })

  it('flags horizontal scroll on mobile', () => {
    const f = analyzeCapture({
      url: '/',
      viewport: 'mobile',
      authState: 'anonymous',
      status: 200,
      bodyTextLength: 800,
      hasH1: true,
      scrollWidth: 520,
      innerWidth: 375,
      consoleErrors: [],
      failedRequests: [],
    })
    expect(f.some((x) => x.category === 'mobile' && x.severity === 'high')).toBe(true)
  })

  it('flags an authenticated walk redirected to /signin', () => {
    const f = analyzeCapture({
      ...clean,
      url: '/today',
      authState: 'authenticated:critique-bot',
      finalUrl: 'https://x.dev/signin',
    })
    expect(f.some((x) => x.observation.includes('sign-in'))).toBe(true)
  })

  it('returns a finding for a null capture', () => {
    expect(analyzeCapture(null)).toHaveLength(1)
  })
})

describe('mint-cookie helpers', () => {
  it('projectRefFromUrl extracts the project ref', () => {
    expect(projectRefFromUrl('https://ohrbbhrodpxhdtjhbsmy.supabase.co')).toBe(
      'ohrbbhrodpxhdtjhbsmy',
    )
  })

  it('projectRefFromUrl returns null on garbage', () => {
    expect(projectRefFromUrl('not a url')).toBeNull()
  })

  it('isFresh true for a future-dated cache with cookies', () => {
    expect(isFresh({ expiresAt: future(), cookies: oneCookie })).toBe(true)
  })

  it('isFresh false for an expired or empty cache', () => {
    expect(isFresh({ expiresAt: past(), cookies: oneCookie })).toBe(false)
    expect(isFresh({ expiresAt: future(), cookies: [] })).toBe(false)
    expect(isFresh(null)).toBe(false)
  })
})
