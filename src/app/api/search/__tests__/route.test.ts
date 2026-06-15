import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

describe('GET /api/search', () => {
  let GET: (req: Request) => Promise<Response>

  function makeChain(result: { data: unknown; error: unknown }) {
    const limit = vi.fn().mockResolvedValue(result)
    const order = vi.fn().mockReturnValue({ limit })
    const textSearch = vi.fn().mockReturnValue({ order })
    const eq = vi.fn().mockReturnValue({ textSearch })
    const select = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ select })
    return { select, eq, textSearch, order, limit }
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../route')
    GET = mod.GET
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    makeChain({ data: [], error: null })
    const req = new Request('http://localhost/api/search?q=test')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns empty results for empty query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    makeChain({ data: [], error: null })
    const req = new Request('http://localhost/api/search?q=')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { results: unknown[] }
    expect(body.results).toEqual([])
  })

  it('returns empty results for whitespace-only query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    makeChain({ data: [], error: null })
    const req = new Request('http://localhost/api/search?q=   ')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { results: unknown[] }
    expect(body.results).toEqual([])
  })

  it('returns formatted results on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const rows = [{ id: 'e1', date: '2026-05-01', response: 'today I reflected on morning light' }]
    makeChain({ data: rows, error: null })
    const req = new Request('http://localhost/api/search?q=morning')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { results: Array<{ date: string; excerpt: string }> }
    expect(body.results).toHaveLength(1)
    expect(body.results[0].date).toBe('2026-05-01')
    expect(body.results[0].excerpt).toContain('morning')
  })

  it('returns 500 when both FTS and ILIKE fail', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // FTS chain returns error
    const ftsLimit = vi.fn().mockResolvedValue({ data: null, error: { message: 'fts error' } })
    const ftsOrder = vi.fn().mockReturnValue({ limit: ftsLimit })
    const ftsTextSearch = vi.fn().mockReturnValue({ order: ftsOrder })
    const ftsEq = vi.fn().mockReturnValue({ textSearch: ftsTextSearch })
    const ftsSelect = vi.fn().mockReturnValue({ eq: ftsEq })

    // ILIKE chain returns error
    const ilikeLimit = vi.fn().mockResolvedValue({ data: null, error: { message: 'ilike error' } })
    const ilikeOrder = vi.fn().mockReturnValue({ limit: ilikeLimit })
    const ilikeIlike = vi.fn().mockReturnValue({ order: ilikeOrder })
    const ilikeEq = vi.fn().mockReturnValue({ ilike: ilikeIlike })
    const ilikeSelect = vi.fn().mockReturnValue({ eq: ilikeEq })

    mockFrom.mockReturnValueOnce({ select: ftsSelect }).mockReturnValueOnce({ select: ilikeSelect })

    const req = new Request('http://localhost/api/search?q=test')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
