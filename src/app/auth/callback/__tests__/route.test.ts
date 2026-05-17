import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockExchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

describe('GET /auth/callback', () => {
  let GET: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../route')
    GET = mod.GET
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('redirects to /signin?error=auth when code is missing', async () => {
    const req = new Request('http://localhost/auth/callback')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/signin?error=auth')
  })

  it('redirects to /signin?error=auth when Supabase returns an error', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: { message: 'invalid code' } })
    const req = new Request('http://localhost/auth/callback?code=bad-code')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/signin?error=auth')
  })

  it('redirects to /today on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })
    const req = new Request('http://localhost/auth/callback?code=valid-code')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/today')
  })
})
