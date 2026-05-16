import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const signInWithOtp = vi.fn()
const mockSupabase = { auth: { signInWithOtp } }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
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
    const mod = await import('../../api/auth/signin/route')
    POST = mod.POST
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('calls signInWithOtp with the submitted email', async () => {
    signInWithOtp.mockResolvedValueOnce({ error: null })
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledOnce()
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' }),
    )
  })

  it('passes emailRedirectTo using NEXT_PUBLIC_SITE_URL when set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://ember-rust-sigma.vercel.app'
    signInWithOtp.mockResolvedValueOnce({ error: null })
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'https://ember-rust-sigma.vercel.app/auth/callback',
        }),
      }),
    )
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL when NEXT_PUBLIC_SITE_URL is absent', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'ember-rust-sigma.vercel.app'
    signInWithOtp.mockResolvedValueOnce({ error: null })
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'https://ember-rust-sigma.vercel.app/auth/callback',
        }),
      }),
    )
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
  })

  it('returns 400 when email is missing', async () => {
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(signInWithOtp).not.toHaveBeenCalled()
  })

  it('returns 400 when Supabase returns an error', async () => {
    signInWithOtp.mockResolvedValueOnce({ error: { message: 'rate limited' } })
    const req = new Request('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('rate limited')
  })
})
