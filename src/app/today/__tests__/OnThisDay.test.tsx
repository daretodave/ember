import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { OnThisDay, openingClause, yearsAgoText } from '../OnThisDay'
import type { Entry } from '@/lib/entries'

afterEach(() => {
  cleanup()
})

const BASE_ENTRY: Entry = {
  id: 'hist-1',
  user_id: 'user-1',
  date: '2025-05-21',
  response: 'something I noticed that day',
  task_done: true,
  is_published: false,
  checkin_word: null,
  created_at: '2025-05-21T08:00:00Z',
  updated_at: '2025-05-21T08:00:00Z',
}

describe('yearsAgoText', () => {
  it('returns "a year ago" for 1 year diff', () => {
    expect(yearsAgoText('2025-05-21', 2026)).toBe('a year ago')
  })

  it('returns "two years ago" for 2 year diff', () => {
    expect(yearsAgoText('2024-05-21', 2026)).toBe('two years ago')
  })

  it('returns "three years ago" for 3 year diff', () => {
    expect(yearsAgoText('2023-05-21', 2026)).toBe('three years ago')
  })

  it('returns numeric form for 4+ years', () => {
    expect(yearsAgoText('2022-05-21', 2026)).toBe('4 years ago')
    expect(yearsAgoText('2016-05-21', 2026)).toBe('10 years ago')
  })
})

describe('openingClause', () => {
  it('returns the full text when 80 chars or fewer', () => {
    const text = 'short response'
    expect(openingClause(text)).toBe('short response')
  })

  it('trims whitespace before measuring', () => {
    const text = '  trimmed  '
    expect(openingClause(text)).toBe('trimmed')
  })

  it('truncates at 80 chars with ellipsis when longer', () => {
    const text = 'a'.repeat(81)
    const result = openingClause(text)
    expect(result).toBe('a'.repeat(80) + '…')
  })

  it('returns exactly 80 chars without truncation when exactly 80', () => {
    const text = 'b'.repeat(80)
    expect(openingClause(text)).toBe('b'.repeat(80))
  })
})

describe('OnThisDay component', () => {
  it('renders nothing when entry is null', () => {
    const { container } = render(<OnThisDay entry={null} todayYear={2026} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when entry response is blank', () => {
    const { container } = render(
      <OnThisDay entry={{ ...BASE_ENTRY, response: '   ' }} todayYear={2026} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the year-ago text and opening clause', () => {
    render(<OnThisDay entry={BASE_ENTRY} todayYear={2026} />)
    expect(screen.getByText(/a year ago/)).toBeInTheDocument()
    expect(screen.getByText('something I noticed that day')).toBeInTheDocument()
  })

  it('renders a link to the historical log entry', () => {
    render(<OnThisDay entry={BASE_ENTRY} todayYear={2026} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/log/2025-05-21')
  })

  it('truncates long response with ellipsis in the link', () => {
    const longResponse = 'x'.repeat(100)
    render(<OnThisDay entry={{ ...BASE_ENTRY, response: longResponse }} todayYear={2026} />)
    expect(screen.getByRole('link')).toHaveTextContent('x'.repeat(80) + '…')
  })

  it('renders "two years ago" for entry 2 years back', () => {
    render(<OnThisDay entry={{ ...BASE_ENTRY, date: '2024-05-21' }} todayYear={2026} />)
    expect(screen.getByText(/two years ago/)).toBeInTheDocument()
  })
})
