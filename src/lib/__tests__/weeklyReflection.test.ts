import { describe, expect, it, vi, beforeEach } from 'vitest'
import { currentIsoWeek, dateToIsoWeek, getWeekDateRange, getWeeklyReflection } from '../weeklyReflection'

describe('dateToIsoWeek', () => {
  it('returns correct week for a known Monday', () => {
    // 2026-06-15 is Monday of week 25
    expect(dateToIsoWeek(new Date('2026-06-15T00:00:00Z'))).toBe('2026-W25')
  })

  it('returns correct week for a known Sunday', () => {
    // 2026-06-21 is Sunday of week 25
    expect(dateToIsoWeek(new Date('2026-06-21T00:00:00Z'))).toBe('2026-W25')
  })

  it('handles year boundary — first week of 2026', () => {
    // 2026-01-01 is Thursday, so it's in week 1 of 2026
    expect(dateToIsoWeek(new Date('2026-01-01T00:00:00Z'))).toBe('2026-W01')
  })

  it('handles week 53 / year boundary — 2020-12-31 is in week 53 of 2020', () => {
    // 2020-12-31 is Thursday, belongs to 2020-W53
    expect(dateToIsoWeek(new Date('2020-12-31T00:00:00Z'))).toBe('2020-W53')
  })

  it('handles week 1 of next year — 2021-01-04 is in week 1 of 2021', () => {
    expect(dateToIsoWeek(new Date('2021-01-04T00:00:00Z'))).toBe('2021-W01')
  })
})

describe('getWeekDateRange', () => {
  it('returns correct Monday–Sunday for 2026-W25', () => {
    expect(getWeekDateRange('2026-W25')).toEqual({ start: '2026-06-15', end: '2026-06-21' })
  })

  it('returns correct range for week 1 of 2026', () => {
    expect(getWeekDateRange('2026-W01')).toEqual({ start: '2025-12-29', end: '2026-01-04' })
  })

  it('throws on invalid format', () => {
    expect(() => getWeekDateRange('bad')).toThrow()
  })
})

describe('currentIsoWeek', () => {
  it('returns a string matching YYYY-Www pattern', () => {
    expect(currentIsoWeek()).toMatch(/^\d{4}-W\d{2}$/)
  })
})

// Minimal supabase stub builder
function makeSupabase(opts: {
  cachedReflection?: string | null
  entries?: { date: string; response: string }[]
}) {
  const { cachedReflection = null, entries = [] } = opts

  const upsert = vi.fn().mockResolvedValue({ error: null })

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'weekly_reflections') {
      // cache lookup chain: .select().eq().eq().maybeSingle()
      const cacheData = cachedReflection ? { reflection_text: cachedReflection } : null
      const maybeSingle = vi.fn().mockResolvedValue({ data: cacheData, error: null })
      const eq2 = vi.fn().mockReturnValue({ maybeSingle })
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
      const select = vi.fn().mockReturnValue({ eq: eq1 })
      return { select, upsert }
    }
    // entries table chain: .select().eq().gte().lte().order()
    const order = vi.fn().mockResolvedValue({ data: entries, error: null })
    const lte = vi.fn().mockReturnValue({ order })
    const gte = vi.fn().mockReturnValue({ lte })
    const eq = vi.fn().mockReturnValue({ gte })
    const select = vi.fn().mockReturnValue({ eq })
    return { select }
  })

  return { from } as unknown as Parameters<typeof getWeeklyReflection>[0]
}

describe('getWeeklyReflection', () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    vi.resetModules()
  })

  it('returns cached reflection when one exists', async () => {
    const supabase = makeSupabase({ cachedReflection: 'the week was quiet.' })
    const result = await getWeeklyReflection(supabase, 'user-1')
    expect(result).toBe('the week was quiet.')
  })

  it('returns null when no cache and no API key', async () => {
    const supabase = makeSupabase({ cachedReflection: null, entries: [] })
    const result = await getWeeklyReflection(supabase, 'user-1')
    expect(result).toBeNull()
  })

  it('returns null when fewer than 3 entries and API key present', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const supabase = makeSupabase({
      cachedReflection: null,
      entries: [
        { date: '2026-06-15', response: 'one entry' },
        { date: '2026-06-16', response: 'two entries' },
      ],
    })
    const result = await getWeeklyReflection(supabase, 'user-1')
    expect(result).toBeNull()
  })

  it('returns null on Anthropic API error without throwing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const supabase = makeSupabase({
      cachedReflection: null,
      entries: [
        { date: '2026-06-15', response: 'entry one' },
        { date: '2026-06-16', response: 'entry two' },
        { date: '2026-06-17', response: 'entry three' },
      ],
    })
    // The Anthropic client will fail to connect with a fake key — expect null
    const result = await getWeeklyReflection(supabase, 'user-1')
    expect(result).toBeNull()
  })
})
