import { describe, expect, it } from 'vitest'
import { parseTagInput, sanitizeTag, sanitizeTags } from '../entries'

describe('sanitizeTag', () => {
  it('lowercases and trims input', () => {
    expect(sanitizeTag('  Work  ')).toBe('work')
  })

  it('allows hyphens', () => {
    expect(sanitizeTag('long-distance')).toBe('long-distance')
  })

  it('allows digits', () => {
    expect(sanitizeTag('2026')).toBe('2026')
  })

  it('rejects tags longer than 30 chars', () => {
    expect(sanitizeTag('a'.repeat(31))).toBeNull()
  })

  it('rejects empty string', () => {
    expect(sanitizeTag('')).toBeNull()
  })

  it('rejects tags starting with a hyphen', () => {
    expect(sanitizeTag('-tag')).toBeNull()
  })

  it('rejects tags with spaces', () => {
    expect(sanitizeTag('two words')).toBeNull()
  })

  it('rejects tags with special chars', () => {
    expect(sanitizeTag('tag!')).toBeNull()
  })

  it('accepts a valid single-char tag', () => {
    expect(sanitizeTag('a')).toBe('a')
  })
})

describe('sanitizeTags', () => {
  it('deduplicates tags', () => {
    expect(sanitizeTags(['work', 'work', 'travel'])).toEqual(['work', 'travel'])
  })

  it('caps at 5 tags', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    expect(sanitizeTags(input)).toHaveLength(5)
    expect(sanitizeTags(input)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('filters invalid tags', () => {
    expect(sanitizeTags(['valid', 'has spaces', ''])).toEqual(['valid'])
  })

  it('returns empty array for all invalid', () => {
    expect(sanitizeTags(['', '!bad', ' '])).toEqual([])
  })
})

describe('parseTagInput', () => {
  it('splits on comma and sanitizes', () => {
    expect(parseTagInput('work, travel, family')).toEqual(['work', 'travel', 'family'])
  })

  it('trims and lowercases', () => {
    expect(parseTagInput('Work , TRAVEL')).toEqual(['work', 'travel'])
  })

  it('filters empty segments from trailing comma', () => {
    expect(parseTagInput('work,')).toEqual(['work'])
  })

  it('returns empty array for empty string', () => {
    expect(parseTagInput('')).toEqual([])
  })

  it('caps at 5 tags', () => {
    expect(parseTagInput('a,b,c,d,e,f,g')).toHaveLength(5)
  })
})
