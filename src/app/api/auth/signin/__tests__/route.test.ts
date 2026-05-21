// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignInWithOtp = vi.fn()
const mockCheckRateLimit = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { signInWithOtp: mockSignInWithOtp },
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  rollingWindow24h: vi.fn().mockReturnValue('2026-05-21T00:00:00.000Z'),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

describe('POST /api/auth/signin', () => {
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockCheckRateLimit.mockResolvedValue(true)
    const mod = await import('../route')
    POST = mod.POST
  })

  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('returns 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue(false)
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBe('rate limit exceeded')
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })

  it('returns 400 when email is missing', async () => {
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('email is required')
  })

  it('returns 400 for non-JSON body', async () => {
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('email is required')
  })

  it('returns 400 when Supabase returns an error', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: { message: 'rate limit exceeded' } })
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('rate limit exceeded')
  })

  it('returns 200 with ok:true on success', async () => {
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('uses NEXT_PUBLIC_SITE_URL for the redirect URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://ember.example.com')
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    await POST(req)
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'https://ember.example.com/auth/callback',
        }),
      }),
    )
  })

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL when NEXT_PUBLIC_SITE_URL is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined as unknown as string)
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'ember-rust-sigma.vercel.app')
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    await POST(req)
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'https://ember-rust-sigma.vercel.app/auth/callback',
        }),
      }),
    )
  })
})
