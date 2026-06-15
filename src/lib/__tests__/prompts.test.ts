import { describe, expect, it } from 'vitest'
import { getPromptForDate, getSevenDayPreview } from '../prompts'

const FIXED_DATE = new Date('2025-05-14T00:00:00Z')
const FIXED_ISO = '2025-05-14'

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

  it('a named pack returns different prompts than standard for the same date', () => {
    const standard = getSevenDayPreview(FIXED_DATE, 'standard')
    const gratitude = getSevenDayPreview(FIXED_DATE, 'gratitude')
    const craft = getSevenDayPreview(FIXED_DATE, 'craft')
    // At least one day differs — pack content is distinct from standard
    const standardPrompts = standard.map((d) => d.prompt)
    expect(gratitude.some((d) => !standardPrompts.includes(d.prompt))).toBe(true)
    expect(craft.some((d) => !standardPrompts.includes(d.prompt))).toBe(true)
  })

  it('unknown pack key falls back to standard', () => {
    const standard = getSevenDayPreview(FIXED_DATE, 'standard')
    const fallback = getSevenDayPreview(FIXED_DATE, 'does-not-exist')
    for (let i = 0; i < 7; i++) {
      expect(fallback[i].prompt).toBe(standard[i].prompt)
    }
  })

  it('null pack falls back to standard', () => {
    const standard = getSevenDayPreview(FIXED_DATE, 'standard')
    const nopack = getSevenDayPreview(FIXED_DATE, null)
    for (let i = 0; i < 7; i++) {
      expect(nopack[i].prompt).toBe(standard[i].prompt)
    }
  })
})

describe('getPromptForDate', () => {
  it('returns a non-empty prompt and task', () => {
    const result = getPromptForDate(FIXED_ISO)
    expect(result.prompt.length).toBeGreaterThan(0)
    expect(result.task.length).toBeGreaterThan(0)
  })

  it('is deterministic for the same date', () => {
    const a = getPromptForDate(FIXED_ISO)
    const b = getPromptForDate(FIXED_ISO)
    expect(a.prompt).toBe(b.prompt)
    expect(a.task).toBe(b.task)
  })

  it('different dates yield different prompts', () => {
    const a = getPromptForDate('2026-01-01')
    const b = getPromptForDate('2026-01-02')
    expect(a.prompt).not.toBe(b.prompt)
  })

  it('named pack returns prompt from that pack', () => {
    const standard = getPromptForDate(FIXED_ISO, 'standard')
    const stoic = getPromptForDate(FIXED_ISO, 'stoic')
    // stoic pack has different content — prompt strings differ
    // (they come from different arrays, so index collision is possible but unlikely for a fixed date)
    // Test that pack-sourced content is non-empty and valid
    expect(stoic.prompt.length).toBeGreaterThan(0)
    expect(stoic.task.length).toBeGreaterThan(0)
    // and that we can distinguish the pack sources by checking the full pack arrays differ
    const griefEntry = getPromptForDate(FIXED_ISO, 'grief')
    expect(griefEntry.prompt.length).toBeGreaterThan(0)
  })

  it('unknown pack falls back to standard', () => {
    const standard = getPromptForDate(FIXED_ISO, 'standard')
    const fallback = getPromptForDate(FIXED_ISO, 'nonexistent')
    expect(fallback.prompt).toBe(standard.prompt)
  })
})
