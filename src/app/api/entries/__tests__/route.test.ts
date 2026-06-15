import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockCheckRateLimit = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  utcDayStart: vi.fn().mockReturnValue('2026-05-21T00:00:00.000Z'),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// Build a mock for from('entries').select().eq().eq().maybeSingle()
// Used for the existence check before rate limiting.
function makeExistenceChain(row: Record<string, unknown> | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null })
  const eq2 = vi.fn().mockReturnValue({ maybeSingle })
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
  const select = vi.fn().mockReturnValue({ eq: eq1 })
  return { select }
}

// Build a mock for from('entries').upsert().select().single()
function makeUpsertChain(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn().mockReturnValue({ single })
  const upsert = vi.fn().mockReturnValue({ select })
  return { upsert }
}

// Wire mockFrom to return the existence chain first, then the upsert chain.
function setupFromMock(
  existingRow: Record<string, unknown> | null,
  upsertData: unknown,
  upsertError: unknown = null,
) {
  mockFrom.mockReset()
  mockFrom
    .mockReturnValueOnce(makeExistenceChain(existingRow))
    .mockReturnValue(makeUpsertChain(upsertData, upsertError))
}

describe('POST /api/entries', () => {
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()

    setupFromMock(null, { id: 'row-1', date: '2026-05-13', updated_at: '2026-05-13T10:00:00Z' })
    mockCheckRateLimit.mockResolvedValue(true)

    const mod = await import('../route')
    POST = mod.POST
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns 429 when rate limit is exceeded for a new entry', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockCheckRateLimit.mockResolvedValue(false)
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 'hi', task_done: false, is_published: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBe('rate limit exceeded')
  })

  it('skips rate limit and succeeds when entry already exists for the date', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupFromMock(
      { user_id: 'user-1' },
      { id: 'row-1', date: '2026-05-13', updated_at: '2026-05-13T10:00:00Z' },
    )
    mockCheckRateLimit.mockResolvedValue(false) // would block if called

    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 'updated', task_done: false, is_published: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 'hi', task_done: false, is_published: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing date', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'hi', task_done: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('date')
  })

  it('returns 400 for invalid date format', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: 'not-a-date', response: 'hi', task_done: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for a future date', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '9999-12-31', response: 'hi', task_done: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('future')
  })

  it('returns 400 when response is not a string', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 42, task_done: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('upserts and returns the entry on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 'hello world', task_done: true, is_published: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 500 when Supabase upsert returns an error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    setupFromMock(null, null, { message: 'db error' })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 'hi', task_done: false, is_published: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
