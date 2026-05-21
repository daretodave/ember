import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatDisplayDate,
  formatSavedTime,
  formatShortWeekday,
  getAdjacentPublishedDates,
  getOnThisDay,
  getPublishedEntriesForUser,
  getPublishedEntryByDate,
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

describe('getPublishedEntriesForUser', () => {
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
    const result = await getPublishedEntriesForUser(mockSupabase, 'user-1')
    expect(result.size).toBe(0)
  })

  it('returns a map keyed by date for published entries', async () => {
    const entry = {
      id: 'pub-1',
      user_id: 'user-1',
      date: '2026-05-10',
      response: 'published text',
      task_done: true,
      is_published: true,
      created_at: '2026-05-10T10:00:00Z',
      updated_at: '2026-05-10T10:00:00Z',
    }
    mockIn.mockResolvedValue({ data: [entry], error: null })
    // @ts-expect-error partial mock
    const result = await getPublishedEntriesForUser(mockSupabase, 'user-1')
    expect(result.get('2026-05-10')).toEqual(entry)
  })
})

describe('getPublishedEntryByDate', () => {
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

  it('returns null when entry not found', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })
    // @ts-expect-error partial mock
    const result = await getPublishedEntryByDate(mockSupabase, 'user-1', '2026-05-10')
    expect(result).toBeNull()
  })

  it('returns the entry when found', async () => {
    const entry = {
      id: 'pub-1',
      user_id: 'user-1',
      date: '2026-05-10',
      response: 'published text',
      task_done: false,
      is_published: true,
      created_at: '2026-05-10T10:00:00Z',
      updated_at: '2026-05-10T10:00:00Z',
    }
    maybeSingle.mockResolvedValue({ data: entry, error: null })
    // @ts-expect-error partial mock
    const result = await getPublishedEntryByDate(mockSupabase, 'user-1', '2026-05-10')
    expect(result).toEqual(entry)
  })

  it('returns null on Supabase error', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getPublishedEntryByDate(mockSupabase, 'user-1', '2026-05-10')
    expect(result).toBeNull()
  })
})

describe('getOnThisDay', () => {
  const mockLimit = vi.fn()
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: mockLimit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.in.mockReturnThis()
    mockSupabase.order.mockReturnThis()
    mockSupabase.limit = mockLimit
  })

  it('returns null when no prior same-day entry exists', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null })
    // @ts-expect-error partial mock
    const result = await getOnThisDay(mockSupabase, 'user-1', '2026-05-21')
    expect(result).toBeNull()
  })

  it('returns the most recent matching entry', async () => {
    const entry = {
      id: 'hist-1',
      user_id: 'user-1',
      date: '2025-05-21',
      response: 'last year entry',
      task_done: true,
      is_published: false,
      created_at: '2025-05-21T08:00:00Z',
      updated_at: '2025-05-21T08:00:00Z',
    }
    mockLimit.mockResolvedValue({ data: [entry], error: null })
    // @ts-expect-error partial mock
    const result = await getOnThisDay(mockSupabase, 'user-1', '2026-05-21')
    expect(result).toEqual(entry)
  })

  it('returns null on Supabase error', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getOnThisDay(mockSupabase, 'user-1', '2026-05-21')
    expect(result).toBeNull()
  })

  it('queries candidate dates for the correct year offsets', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null })
    // @ts-expect-error partial mock
    await getOnThisDay(mockSupabase, 'user-1', '2026-05-21')
    // .in() should have been called with the correct date list
    expect(mockSupabase.in).toHaveBeenCalledWith(
      'date',
      expect.arrayContaining(['2025-05-21', '2024-05-21', '2023-05-21']),
    )
    const [, dates] = mockSupabase.in.mock.calls[0] as [string, string[]]
    expect(dates).toHaveLength(10)
    expect(dates[0]).toBe('2025-05-21')
    expect(dates[9]).toBe('2016-05-21')
  })
})

describe('getAdjacentPublishedDates', () => {
  const mockOrder = vi.fn()
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: mockOrder,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.order = mockOrder
  })

  it('returns null prev and next on error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getAdjacentPublishedDates(mockSupabase, 'user-1', '2026-05-10')
    expect(result).toEqual({ prev: null, next: null })
  })

  it('returns null edges when only one entry', async () => {
    mockOrder.mockResolvedValue({ data: [{ date: '2026-05-10' }], error: null })
    // @ts-expect-error partial mock
    const result = await getAdjacentPublishedDates(mockSupabase, 'user-1', '2026-05-10')
    expect(result).toEqual({ prev: null, next: null })
  })

  it('returns prev and next for a middle entry', async () => {
    const dates = [
      { date: '2026-05-01' },
      { date: '2026-05-10' },
      { date: '2026-05-15' },
    ]
    mockOrder.mockResolvedValue({ data: dates, error: null })
    // @ts-expect-error partial mock
    const result = await getAdjacentPublishedDates(mockSupabase, 'user-1', '2026-05-10')
    expect(result).toEqual({ prev: '2026-05-01', next: '2026-05-15' })
  })

  it('returns null next for the most recent entry', async () => {
    const dates = [{ date: '2026-05-01' }, { date: '2026-05-15' }]
    mockOrder.mockResolvedValue({ data: dates, error: null })
    // @ts-expect-error partial mock
    const result = await getAdjacentPublishedDates(mockSupabase, 'user-1', '2026-05-15')
    expect(result).toEqual({ prev: '2026-05-01', next: null })
  })

  it('returns null prev for the oldest entry', async () => {
    const dates = [{ date: '2026-05-01' }, { date: '2026-05-15' }]
    mockOrder.mockResolvedValue({ data: dates, error: null })
    // @ts-expect-error partial mock
    const result = await getAdjacentPublishedDates(mockSupabase, 'user-1', '2026-05-01')
    expect(result).toEqual({ prev: null, next: '2026-05-15' })
  })
})
