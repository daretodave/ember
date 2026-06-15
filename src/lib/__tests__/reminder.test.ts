import { describe, expect, it } from 'vitest'
import {
  buildReminderSubject,
  buildReminderText,
  currentHourInTimezone,
  todayInTimezone,
} from '../reminder'

// 2026-06-15T13:00:00Z (1pm UTC = 9am EDT = 6am PDT)
const FIXED = new Date('2026-06-15T13:00:00Z')

describe('todayInTimezone', () => {
  it('returns YYYY-MM-DD for UTC', () => {
    expect(todayInTimezone('UTC', FIXED)).toBe('2026-06-15')
  })

  it('returns the previous day for a timezone behind UTC near midnight', () => {
    // 2026-06-15T02:00:00Z is 2026-06-14 in America/New_York (UTC-4 in summer)
    const midnight = new Date('2026-06-15T02:00:00Z')
    expect(todayInTimezone('America/New_York', midnight)).toBe('2026-06-14')
  })

  it('returns the next day for a timezone ahead of UTC near midnight', () => {
    // 2026-06-15T23:00:00Z is 2026-06-16 in Asia/Tokyo (UTC+9)
    const late = new Date('2026-06-15T23:00:00Z')
    expect(todayInTimezone('Asia/Tokyo', late)).toBe('2026-06-16')
  })

  it('falls back to UTC date on invalid timezone', () => {
    expect(todayInTimezone('Not/ATimezone', FIXED)).toBe('2026-06-15')
  })
})

describe('currentHourInTimezone', () => {
  it('returns 13 for UTC at 1pm UTC', () => {
    expect(currentHourInTimezone('UTC', FIXED)).toBe(13)
  })

  it('returns 9 for America/New_York at 1pm UTC (EDT = UTC-4)', () => {
    expect(currentHourInTimezone('America/New_York', FIXED)).toBe(9)
  })

  it('returns 6 for America/Los_Angeles at 1pm UTC (PDT = UTC-7)', () => {
    expect(currentHourInTimezone('America/Los_Angeles', FIXED)).toBe(6)
  })

  it('returns 22 for Asia/Tokyo at 1pm UTC (JST = UTC+9)', () => {
    expect(currentHourInTimezone('Asia/Tokyo', FIXED)).toBe(22)
  })

  it('falls back to UTC hour on invalid timezone', () => {
    expect(currentHourInTimezone('Not/ATimezone', FIXED)).toBe(13)
  })
})

describe('buildReminderSubject', () => {
  it('returns the expected subject line', () => {
    expect(buildReminderSubject()).toBe("today's prompt is waiting.")
  })
})

describe('buildReminderText', () => {
  const text = buildReminderText('https://ember-rust-sigma.vercel.app')

  it('contains the opening line', () => {
    expect(text).toContain("today's prompt is waiting.")
  })

  it('contains a direct link to /today', () => {
    expect(text).toContain('https://ember-rust-sigma.vercel.app/today')
  })

  it('contains an unsubscribe line linking to /settings', () => {
    expect(text).toContain('https://ember-rust-sigma.vercel.app/settings')
    expect(text).toContain('turn off daily reminder')
  })
})
