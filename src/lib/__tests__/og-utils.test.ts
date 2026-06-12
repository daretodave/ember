import { describe, expect, it } from 'vitest'
import { openingClause } from '../og-utils'

describe('openingClause', () => {
  it('returns short text unchanged', () => {
    expect(openingClause('hello world', 80)).toBe('hello world')
  })

  it('returns text exactly at maxLen unchanged', () => {
    const text = 'a'.repeat(80)
    expect(openingClause(text, 80)).toBe(text)
  })

  it('truncates at word boundary when over maxLen', () => {
    // maxLen=15: slice(0,15)="one two three f", lastSpace=13 → "one two three..."
    const text = 'one two three four five six seven eight nine ten'
    const result = openingClause(text, 15)
    expect(result).toBe('one two three...')
    expect(result).not.toContain('four')
  })

  it('uses only the first paragraph when response has multiple paragraphs', () => {
    const text = 'first paragraph here.\n\nsecond paragraph that is longer and should be ignored entirely'
    expect(openingClause(text, 80)).toBe('first paragraph here.')
  })

  it('returns empty string for empty response', () => {
    expect(openingClause('', 80)).toBe('')
  })

  it('truncates mid-word at char boundary when no space exists', () => {
    const text = 'a'.repeat(90)
    const result = openingClause(text, 80)
    expect(result).toBe('a'.repeat(80) + '...')
  })
})
