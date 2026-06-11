import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockDeleteUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    auth: {
      admin: { deleteUser: mockDeleteUser },
    },
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

describe('DELETE /api/account', () => {
  let DELETE: () => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../route')
    DELETE = mod.DELETE
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await DELETE()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('unauthorized')
  })

  it('returns 200 and deleted:true when user is deleted', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockDeleteUser.mockResolvedValue({ error: null })
    const res = await DELETE()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.deleted).toBe(true)
    expect(mockDeleteUser).toHaveBeenCalledWith('user-1')
  })

  it('returns 500 when admin delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockDeleteUser.mockResolvedValue({ error: { message: 'admin error' } })
    const res = await DELETE()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('admin error')
  })
})
