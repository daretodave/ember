import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProfile } from '../profile'

describe('getProfile', () => {
  const maybeSingle = vi.fn()
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.maybeSingle = maybeSingle
  })

  it('returns null when no row exists', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })
    // @ts-expect-error partial mock
    const result = await getProfile(mockSupabase, 'user-1')
    expect(result).toBeNull()
  })

  it('returns the profile row when found', async () => {
    const profile = {
      user_id: 'user-1',
      display_name: 'Alice',
      username: 'alice',
      timezone: 'America/New_York',
      created_at: '2026-05-01T00:00:00Z',
      updated_at: '2026-05-13T10:00:00Z',
    }
    maybeSingle.mockResolvedValue({ data: profile, error: null })
    // @ts-expect-error partial mock
    const result = await getProfile(mockSupabase, 'user-1')
    expect(result).toEqual(profile)
  })

  it('returns null on Supabase error', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getProfile(mockSupabase, 'user-1')
    expect(result).toBeNull()
  })
})
