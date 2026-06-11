import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('@/lib/prompts', () => ({
  getPromptForDate: vi.fn().mockReturnValue({
    prompt: 'test prompt text',
    task: 'test task text',
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

const SAMPLE_ENTRIES = [
  {
    id: 'e1',
    date: '2026-05-01',
    response: 'first entry',
    task_done: true,
    is_published: false,
    created_at: '2026-05-01T08:00:00.000Z',
    updated_at: '2026-05-01T08:00:00.000Z',
  },
  {
    id: 'e2',
    date: '2026-05-02',
    response: 'second entry',
    task_done: false,
    is_published: true,
    created_at: '2026-05-02T09:00:00.000Z',
    updated_at: '2026-05-02T09:00:00.000Z',
  },
]

describe('GET /api/export', () => {
  let GET: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()

    mockOrder.mockResolvedValue({ data: SAMPLE_ENTRIES, error: null })
    mockEq.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })

    const mod = await import('../route')
    GET = mod.GET
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new Request('http://localhost/api/export')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('unauthorized')
  })

  it('returns JSON by default with entry_count and entries array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/export')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/json')
    expect(res.headers.get('Content-Disposition')).toMatch(/attachment; filename="ember-export-\d{4}-\d{2}-\d{2}\.json"/)
    const body = await res.json()
    expect(body.entry_count).toBe(2)
    expect(body.entries).toHaveLength(2)
    expect(body.entries[0].date).toBe('2026-05-01')
    expect(body.entries[0].prompt).toBe('test prompt text')
    expect(body.entries[0].task).toBe('test task text')
    expect(body.entries[0].response).toBe('first entry')
    expect(body.exported_at).toBeDefined()
  })

  it('returns JSON when format=json is explicit', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/export?format=json')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/json')
  })

  it('returns Markdown when format=md', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/export?format=md')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/markdown')
    expect(res.headers.get('Content-Disposition')).toMatch(/attachment; filename="ember-export-\d{4}-\d{2}-\d{2}\.md"/)
    const text = await res.text()
    expect(text).toContain('# ember export —')
    expect(text).toContain('## 2026-05-01')
    expect(text).toContain('**prompt:** test prompt text')
    expect(text).toContain('first entry')
  })

  it('returns 400 for unrecognized format', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/export?format=csv')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('unrecognized format')
  })

  it('returns empty entries when user has no entries', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockOrder.mockResolvedValue({ data: [], error: null })
    const req = new Request('http://localhost/api/export')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.entry_count).toBe(0)
    expect(body.entries).toHaveLength(0)
  })

  it('returns empty markdown when user has no entries', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockOrder.mockResolvedValue({ data: [], error: null })
    const req = new Request('http://localhost/api/export?format=md')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('(no entries)')
  })
})
