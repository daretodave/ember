import { describe, expect, it } from 'vitest'
import { excerptAround, sanitizeSearchQuery } from '../search'

describe('sanitizeSearchQuery', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeSearchQuery('  hello  ')).toBe('hello')
  })

  it('caps at 200 characters', () => {
    const long = 'a'.repeat(250)
    expect(sanitizeSearchQuery(long)).toHaveLength(200)
  })

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeSearchQuery('   ')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeSearchQuery('')).toBe('')
  })

  it('returns the string as-is when within limit', () => {
    expect(sanitizeSearchQuery('brief query')).toBe('brief query')
  })
})

describe('excerptAround', () => {
  it('returns opening slice when token is not found', () => {
    const text = 'this is a sample entry about writing and reflection'
    const result = excerptAround(text, 'absent', 30)
    expect(result).toBe('this is a sample entry about w…')
  })

  it('centers excerpt around the found token', () => {
    const text = 'the quick brown fox jumps over the lazy dog'
    const result = excerptAround(text, 'fox', 20)
    expect(result).toContain('fox')
  })

  it('does not prepend ellipsis when match is at the start', () => {
    const text = 'morning light filled the room'
    const result = excerptAround(text, 'morning', 60)
    expect(result).not.toMatch(/^…/)
  })

  it('appends ellipsis when text is truncated at the end', () => {
    const text = 'start ' + 'word '.repeat(30)
    const result = excerptAround(text, 'start', 20)
    expect(result).toMatch(/…$/)
  })

  it('returns empty string for empty text', () => {
    expect(excerptAround('', 'query')).toBe('')
  })

  it('returns full text when text is shorter than maxLen', () => {
    const text = 'short text'
    expect(excerptAround(text, 'short', 120)).toBe('short text')
  })

  it('handles empty query by returning opening slice', () => {
    const text = 'hello world'
    expect(excerptAround(text, '', 5)).toBe('hello…')
  })
})
