import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockUpsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
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

describe('POST /api/entries', () => {
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()

    // Chain: from().upsert().select().single()
    mockSingle.mockResolvedValue({ data: { id: 'row-1', date: '2026-05-13' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockUpsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ upsert: mockUpsert })

    const mod = await import('../route')
    POST = mod.POST
  })

  afterEach(() => {
    vi.resetModules()
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
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', date: '2026-05-13', response: 'hello world', task_done: true }),
      expect.any(Object),
    )
  })

  it('returns 500 when Supabase returns an error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'db error' } })
    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-13', response: 'hi', task_done: false, is_published: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
