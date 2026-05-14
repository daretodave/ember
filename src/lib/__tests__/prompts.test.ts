import { describe, expect, it } from 'vitest'
import { getSevenDayPreview } from '../prompts'

const FIXED_DATE = new Date('2025-05-14T00:00:00Z')

describe('getSevenDayPreview', () => {
  it('returns exactly 7 days', () => {
    const days = getSevenDayPreview(FIXED_DATE)
    expect(days).toHaveLength(7)
  })

  it('first entry is today', () => {
    const [first] = getSevenDayPreview(FIXED_DATE)
    expect(first.isToday).toBe(true)
    expect(first.label).toBe('today')
  })

  it('second entry is tomorrow', () => {
    const days = getSevenDayPreview(FIXED_DATE)
    expect(days[1].label).toBe('tomorrow')
    expect(days[1].isToday).toBe(false)
  })

  it('remaining entries use "in N days" label', () => {
    const days = getSevenDayPreview(FIXED_DATE)
    for (let i = 2; i < 7; i++) {
      expect(days[i].label).toBe(`in ${i} days`)
    }
  })

  it('each day has a non-empty prompt and task', () => {
    const days = getSevenDayPreview(FIXED_DATE)
    for (const day of days) {
      expect(day.prompt.length).toBeGreaterThan(0)
      expect(day.task.length).toBeGreaterThan(0)
    }
  })

  it('days are consecutive UTC dates', () => {
    const days = getSevenDayPreview(FIXED_DATE)
    for (let i = 1; i < 7; i++) {
      const diffMs = days[i].date.getTime() - days[i - 1].date.getTime()
      expect(diffMs).toBe(86_400_000)
    }
  })

  it('is deterministic — same date always yields same prompts', () => {
    const a = getSevenDayPreview(FIXED_DATE)
    const b = getSevenDayPreview(new Date('2025-05-14T12:34:56Z'))
    for (let i = 0; i < 7; i++) {
      expect(a[i].prompt).toBe(b[i].prompt)
      expect(a[i].task).toBe(b[i].task)
    }
  })

  it('shortDate includes weekday and month', () => {
    const [first] = getSevenDayPreview(FIXED_DATE)
    // 2025-05-14 is a Wednesday
    expect(first.shortDate).toMatch(/Wed/)
    expect(first.shortDate).toMatch(/May/)
  })
})
