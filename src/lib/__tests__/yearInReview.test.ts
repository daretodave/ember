import { describe, expect, it } from 'vitest'
import type { Entry } from '../entries'
import { getYearInReview } from '../yearInReview'

function makeEntry(date: string, responseLength = 50): Entry {
  return {
    id: `id-${date}`,
    user_id: 'user-1',
    date,
    response: 'x'.repeat(responseLength),
    task_done: false,
    is_published: false,
    checkin_word: null,
    tags: [],
    created_at: `${date}T10:00:00Z`,
    updated_at: `${date}T10:00:00Z`,
  }
}

function makeMap(entries: Entry[]): Map<string, Entry> {
  const m = new Map<string, Entry>()
  for (const e of entries) m.set(e.date, e)
  return m
}

describe('getYearInReview', () => {
  it('returns null when today is not in January', () => {
    const entries = makeMap([makeEntry('2025-06-01')])
    expect(getYearInReview(entries, '2026-06-15')).toBeNull()
    expect(getYearInReview(entries, '2026-02-01')).toBeNull()
    expect(getYearInReview(entries, '2026-12-31')).toBeNull()
  })

  it('returns null when today is January but day > 7', () => {
    const entries = makeMap([makeEntry('2025-06-01')])
    expect(getYearInReview(entries, '2026-01-08')).toBeNull()
    expect(getYearInReview(entries, '2026-01-31')).toBeNull()
  })

  it('returns null when in January 1-7 but no prior-year entries', () => {
    const entries = makeMap([makeEntry('2024-06-01')]) // two years back
    expect(getYearInReview(entries, '2026-01-03')).toBeNull()
  })

  it('returns null for an empty entries map', () => {
    expect(getYearInReview(new Map(), '2026-01-01')).toBeNull()
  })

  it('returns correct result for a single prior-year entry', () => {
    const entries = makeMap([makeEntry('2025-08-14')])
    const result = getYearInReview(entries, '2026-01-03')
    expect(result).toEqual({
      yearLabel: 2025,
      count: 1,
      quietestMonth: 'august', // only month with entries; skipped months are not "stretches"
    })
  })

  it('returns correct count for multiple prior-year entries', () => {
    const entries = makeMap([
      makeEntry('2025-01-05'),
      makeEntry('2025-03-12'),
      makeEntry('2025-08-20'),
      makeEntry('2025-11-01'),
    ])
    const result = getYearInReview(entries, '2026-01-07')
    expect(result?.yearLabel).toBe(2025)
    expect(result?.count).toBe(4)
  })

  it('quietestMonth picks the month with fewest entries', () => {
    const entries = makeMap([
      makeEntry('2025-01-05'),
      makeEntry('2025-01-06'),
      makeEntry('2025-01-07'),
      makeEntry('2025-06-01'),
      makeEntry('2025-06-02'),
      makeEntry('2025-08-10'), // only one in august — quietest
    ])
    const result = getYearInReview(entries, '2026-01-02')
    expect(result?.quietestMonth).toBe('august')
  })

  it('quietestMonth is the sole month when only one month has entries', () => {
    const entries = makeMap([makeEntry('2025-05-15')])
    // Only may has an entry; skipped months are excluded. May is quietest (and only).
    const result = getYearInReview(entries, '2026-01-01')
    expect(result?.quietestMonth).toBe('may')
  })

  it('quietestMonth picks earliest month when multiple months tie at fewest entries', () => {
    // March and September each have 1 entry — they tie. March is earlier.
    const entries = makeMap([
      makeEntry('2025-03-10'),
      makeEntry('2025-09-22'),
    ])
    const result = getYearInReview(entries, '2026-01-05')
    expect(result?.quietestMonth).toBe('march')
  })

  it('ignores entries outside the prior year', () => {
    const entries = makeMap([
      makeEntry('2024-12-31'), // two years back
      makeEntry('2025-06-01'), // prior year — included
      makeEntry('2026-01-01'), // current year — not included
    ])
    const result = getYearInReview(entries, '2026-01-04')
    expect(result?.count).toBe(1)
  })

  it('works on January 1 (first day of new year)', () => {
    const entries = makeMap([
      makeEntry('2025-04-10'),
      makeEntry('2025-04-20'),
      makeEntry('2025-11-05'),
    ])
    const result = getYearInReview(entries, '2026-01-01')
    expect(result?.yearLabel).toBe(2025)
    expect(result?.count).toBe(3)
  })

  it('quietestMonth with all 12 months having entries picks the one with fewest', () => {
    const data: Entry[] = []
    // Give each month a different count; december has fewest (1)
    const counts = [3, 5, 4, 2, 6, 7, 8, 9, 3, 4, 5, 1]
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= counts[m]; d++) {
        const date = `2025-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        data.push(makeEntry(date))
      }
    }
    const result = getYearInReview(makeMap(data), '2026-01-06')
    expect(result?.quietestMonth).toBe('december')
    expect(result?.count).toBe(counts.reduce((a, b) => a + b, 0))
  })
})
