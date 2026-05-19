import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { signOut: mockSignOut },
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

describe('auth/signout', () => {
  let POST: (req: Request) => Promise<Response>
  let GET: () => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({})
    const mod = await import('../route')
    POST = mod.POST
    GET = mod.GET
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('POST signs out and redirects to /', async () => {
    const req = new Request('http://localhost/auth/signout', { method: 'POST' })
    const res = await POST(req)
    expect(mockSignOut).toHaveBeenCalledOnce()
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('GET returns 405', async () => {
    const res = await GET()
    expect(res.status).toBe(405)
  })
})
