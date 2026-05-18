// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()
const mockCreateServerClient = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}))

describe('middleware', () => {
  let middleware: typeof import('../middleware').middleware

  beforeEach(async () => {
    vi.clearAllMocks()
    mockCreateServerClient.mockReturnValue({ auth: { getUser: mockGetUser } })
    const mod = await import('../middleware')
    middleware = mod.middleware
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('unauthenticated requests', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
    })

    it.each(['/today', '/log', '/settings', '/log/2026-05-14'])(
      'redirects %s to /signin',
      async (path) => {
        const req = new NextRequest(`http://localhost${path}`)
        const res = await middleware(req)
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost/signin')
      },
    )

    it.each(['/', '/signin', '/u/alice', '/u/alice/2026-01-01'])(
      'passes through %s without redirect',
      async (path) => {
        const req = new NextRequest(`http://localhost${path}`)
        const res = await middleware(req)
        expect(res.headers.get('location')).toBeNull()
      },
    )
  })

  describe('authenticated requests', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    })

    it('redirects /signin to /today for authenticated user', async () => {
      const req = new NextRequest('http://localhost/signin')
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost/today')
    })

    it.each(['/today', '/log', '/settings'])(
      'passes authenticated user through %s without redirect',
      async (path) => {
        const req = new NextRequest(`http://localhost${path}`)
        const res = await middleware(req)
        expect(res.headers.get('location')).toBeNull()
      },
    )
  })
})
