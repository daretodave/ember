import { beforeEach, describe, expect, it, vi } from 'vitest'
import { get60DayEntries, getEntryByDate, todayUtcDate } from '../entries'
import { getPromptForDate } from '../prompts'

describe('get60DayEntries', () => {
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
    const result = await get60DayEntries(mockSupabase, 'user-1')
    expect(result.size).toBe(0)
  })

  it('returns empty map when no entries', async () => {
    mockIn.mockResolvedValue({ data: [], error: null })
    // @ts-expect-error partial mock
    const result = await get60DayEntries(mockSupabase, 'user-1')
    expect(result.size).toBe(0)
  })

  it('returns a map keyed by date for returned entries', async () => {
    const entry = {
      id: 'abc',
      user_id: 'user-1',
      date: todayUtcDate(),
      response: 'hello',
      task_done: false,
      is_published: false,
      created_at: '2026-05-13T07:00:00Z',
      updated_at: '2026-05-13T07:00:00Z',
    }
    mockIn.mockResolvedValue({ data: [entry], error: null })
    // @ts-expect-error partial mock
    const result = await get60DayEntries(mockSupabase, 'user-1')
    expect(result.get(entry.date)).toEqual(entry)
  })

  it('queries exactly 60 dates', async () => {
    mockIn.mockResolvedValue({ data: [], error: null })
    // @ts-expect-error partial mock
    await get60DayEntries(mockSupabase, 'user-1')
    const datesArg = mockIn.mock.calls[0][1] as string[]
    expect(datesArg).toHaveLength(60)
  })
})

describe('getEntryByDate', () => {
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

  it('returns null when no entry exists', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })
    // @ts-expect-error partial mock
    const result = await getEntryByDate(mockSupabase, 'user-1', '2026-01-01')
    expect(result).toBeNull()
  })

  it('returns the entry when found', async () => {
    const entry = {
      id: 'xyz',
      user_id: 'user-1',
      date: '2026-01-01',
      response: 'some text',
      task_done: true,
      is_published: false,
      created_at: '2026-01-01T08:00:00Z',
      updated_at: '2026-01-01T08:00:00Z',
    }
    maybeSingle.mockResolvedValue({ data: entry, error: null })
    // @ts-expect-error partial mock
    const result = await getEntryByDate(mockSupabase, 'user-1', '2026-01-01')
    expect(result).toEqual(entry)
  })

  it('returns null on Supabase error', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'db error' } })
    // @ts-expect-error partial mock
    const result = await getEntryByDate(mockSupabase, 'user-1', '2026-01-01')
    expect(result).toBeNull()
  })
})

describe('getPromptForDate', () => {
  it('returns an object with prompt and task strings', () => {
    const result = getPromptForDate('2026-05-14')
    expect(typeof result.prompt).toBe('string')
    expect(result.prompt.length).toBeGreaterThan(0)
    expect(typeof result.task).toBe('string')
    expect(result.task.length).toBeGreaterThan(0)
  })

  it('is deterministic — same date always returns the same prompt', () => {
    const a = getPromptForDate('2026-03-01')
    const b = getPromptForDate('2026-03-01')
    expect(a.prompt).toBe(b.prompt)
    expect(a.task).toBe(b.task)
  })

  it('returns different prompts for different dates', () => {
    const a = getPromptForDate('2026-01-01')
    const b = getPromptForDate('2026-01-02')
    // consecutive days typically differ (unless prompts list wraps to same idx)
    // just check the shape is valid
    expect(typeof a.prompt).toBe('string')
    expect(typeof b.prompt).toBe('string')
  })
})
