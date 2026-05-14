import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatDisplayDate,
  formatSavedTime,
  formatShortWeekday,
  getRecentEntries,
  getTodayEntry,
  offsetDate,
  todayUtcDate,
} from '../entries'

describe('todayUtcDate', () => {
  it('returns a YYYY-MM-DD string', () => {
    const result = todayUtcDate()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('offsetDate', () => {
  it('offset 0 equals todayUtcDate', () => {
    expect(offsetDate(0)).toBe(todayUtcDate())
  })

  it('offset -1 is yesterday', () => {
    const today = new Date(todayUtcDate() + 'T00:00:00Z')
    const yesterday = new Date(today.getTime() - 86_400_000)
    const expected = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`
    expect(offsetDate(-1)).toBe(expected)
  })
})

describe('formatDisplayDate', () => {
  it('formats a known date correctly', () => {
    // 2026-05-13 is a Wednesday
    expect(formatDisplayDate('2026-05-13')).toBe('Wed 13 May 2026')
  })

  it('zero-pads day', () => {
    // 2026-01-05 is a Monday
    expect(formatDisplayDate('2026-01-05')).toContain('5 Jan')
  })
})

describe('formatSavedTime', () => {
  it('formats a UTC timestamp as HH:MM', () => {
    expect(formatSavedTime('2026-05-13T07:21:00Z')).toBe('last saved · 07:21')
  })

  it('zero-pads hours and minutes', () => {
    expect(formatSavedTime('2026-05-13T09:05:00Z')).toBe('last saved · 09:05')
  })
})

describe('formatShortWeekday', () => {
  it('returns short weekday for a known date', () => {
    expect(formatShortWeekday('2026-05-13')).toBe('Wed')
  })
})

describe('getTodayEntry', () => {
  const maybeSingle = vi.fn()
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Re-chain: from().select().eq().eq().maybeSingle()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.maybeSingle = maybeSingle
  })

  it('returns null when no entry exists', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })
    // @ts-expect-error partial mock
    const result = await getTodayEntry(mockSupabase, 'user-1', '2026-05-13')
    expect(result).toBeNull()
  })

  it('returns the entry when found', async () => {
    const entry = {
      id: 'abc',
      user_id: 'user-1',
      date: '2026-05-13',
      response: 'hello',
      task_done: false,
      is_published: false,
      created_at: '2026-05-13T07:00:00Z',
      updated_at: '2026-05-13T07:00:00Z',
    }
    maybeSingle.mockResolvedValue({ data: entry, error: null })
    // @ts-expect-error partial mock
    const result = await getTodayEntry(mockSupabase, 'user-1', '2026-05-13')
    expect(result).toEqual(entry)
  })

  it('returns null on Supabase error', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getTodayEntry(mockSupabase, 'user-1', '2026-05-13')
    expect(result).toBeNull()
  })
})

describe('getRecentEntries', () => {
  const mockIn = vi.fn()
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: mockIn,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.in = mockIn
  })

  it('returns empty map on error', async () => {
    mockIn.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getRecentEntries(mockSupabase, 'user-1', 7)
    expect(result.size).toBe(0)
  })

  it('returns a map keyed by date', async () => {
    const entry = {
      id: 'abc',
      user_id: 'user-1',
      date: '2026-05-13',
      response: 'hello',
      task_done: true,
      is_published: false,
      created_at: '2026-05-13T07:00:00Z',
      updated_at: '2026-05-13T07:00:00Z',
    }
    mockIn.mockResolvedValue({ data: [entry], error: null })
    // @ts-expect-error partial mock
    const result = await getRecentEntries(mockSupabase, 'user-1', 7)
    expect(result.get('2026-05-13')).toEqual(entry)
  })
})
