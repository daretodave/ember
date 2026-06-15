import { describe, expect, it } from 'vitest'
import type { Entry } from '../entries'
import { getMonthInReview } from '../monthInReview'

function makeEntry(date: string, responseLength: number): Entry {
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

describe('getMonthInReview', () => {
  it('returns null when today is day 8 or later', () => {
    const entries = makeMap([makeEntry('2026-05-15', 100)])
    expect(getMonthInReview(entries, '2026-06-08')).toBeNull()
    expect(getMonthInReview(entries, '2026-06-30')).toBeNull()
  })

  it('returns null when today is in first 7 days but no prior-month entries', () => {
    const entries = makeMap([makeEntry('2026-04-20', 100)])
    // no may entries in map when today is june 3
    expect(getMonthInReview(entries, '2026-06-03')).toBeNull()
  })

  it('returns null for empty entries map', () => {
    expect(getMonthInReview(new Map(), '2026-06-01')).toBeNull()
  })

  it('returns correct result for a single prior-month entry', () => {
    const entries = makeMap([makeEntry('2026-05-12', 80)])
    const result = getMonthInReview(entries, '2026-06-03')
    expect(result).toEqual({
      monthLabel: 'may',
      count: 1,
      longestDayOrdinal: '12th',
    })
  })

  it('returns correct count for multiple prior-month entries', () => {
    const entries = makeMap([
      makeEntry('2026-05-01', 50),
      makeEntry('2026-05-12', 200),
      makeEntry('2026-05-28', 100),
    ])
    const result = getMonthInReview(entries, '2026-06-07')
    expect(result?.count).toBe(3)
    expect(result?.longestDayOrdinal).toBe('12th')
    expect(result?.monthLabel).toBe('may')
  })

  it('picks earliest date as longest when responses tie in length', () => {
    const entries = makeMap([
      makeEntry('2026-05-10', 100),
      makeEntry('2026-05-05', 100),
      makeEntry('2026-05-20', 100),
    ])
    const result = getMonthInReview(entries, '2026-06-02')
    expect(result?.longestDayOrdinal).toBe('5th')
  })

  it('ignores entries outside the prior month', () => {
    const entries = makeMap([
      makeEntry('2026-04-15', 999), // two months back — not included
      makeEntry('2026-05-03', 50),
      makeEntry('2026-06-01', 200), // current month — not included
    ])
    const result = getMonthInReview(entries, '2026-06-05')
    expect(result?.count).toBe(1)
    expect(result?.longestDayOrdinal).toBe('3rd')
  })

  it('handles January (prev month is December of prior year)', () => {
    const entries = makeMap([makeEntry('2025-12-25', 150)])
    const result = getMonthInReview(entries, '2026-01-06')
    expect(result).toEqual({
      monthLabel: 'december',
      count: 1,
      longestDayOrdinal: '25th',
    })
  })

  it('ordinal suffix: 1st, 2nd, 3rd, 11th, 12th, 13th, 21st', () => {
    const cases: Array<[string, string]> = [
      ['2026-05-01', '1st'],
      ['2026-05-02', '2nd'],
      ['2026-05-03', '3rd'],
      ['2026-05-11', '11th'],
      ['2026-05-12', '12th'],
      ['2026-05-13', '13th'],
      ['2026-05-21', '21st'],
    ]
    for (const [date, expected] of cases) {
      const entries = makeMap([makeEntry(date, 50)])
      const result = getMonthInReview(entries, '2026-06-01')
      expect(result?.longestDayOrdinal).toBe(expected)
    }
  })
})
