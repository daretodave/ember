import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/entries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/entries')>()
  // Pin dates: index 0 = 6 days ago, index 6 = today (2026-05-24 = Sun)
  const DATES = [
    '2026-05-18', // Mon
    '2026-05-19', // Tue
    '2026-05-20', // Wed
    '2026-05-21', // Thu
    '2026-05-22', // Fri
    '2026-05-23', // Sat
    '2026-05-24', // Sun — today
  ]
  return {
    ...actual,
    offsetDate: vi.fn((offset: number) => DATES[offset + 6]),
  }
})

import type { Entry } from '@/lib/entries'
import { DayStrip } from '../DayStrip'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const TODAY = '2026-05-24'

function makeEntry(date: string, overrides: Partial<Entry> = {}): Entry {
  return {
    id: `e-${date}`,
    user_id: 'u1',
    date,
    response: 'something',
    task_done: false,
    is_published: false,
    created_at: `${date}T10:00:00Z`,
    updated_at: `${date}T10:00:00Z`,
    ...overrides,
  }
}

describe('DayStrip', () => {
  it('renders the section heading', () => {
    render(<DayStrip todayDate={TODAY} entries={new Map()} />)
    expect(screen.getByRole('heading', { name: 'the last seven days' })).toBeInTheDocument()
  })

  it('day strip section is a named region landmark accessible by its heading', () => {
    render(<DayStrip todayDate={TODAY} entries={new Map()} />)
    expect(screen.getByRole('region', { name: 'the last seven days' })).toBeInTheDocument()
  })

  it('renders a link to /log', () => {
    render(<DayStrip todayDate={TODAY} entries={new Map()} />)
    expect(screen.getByRole('link', { name: 'log' })).toHaveAttribute('href', '/log')
  })

  it('today tile with no entry gets "today, Sun 24 May 2026 — no entry" label', () => {
    render(<DayStrip todayDate={TODAY} entries={new Map()} />)
    expect(screen.getByText('today, Sun 24 May 2026 — no entry')).toBeInTheDocument()
  })

  it('today tile with a written entry gets "today, Sun 24 May 2026 — written"', () => {
    const entries = new Map([[TODAY, makeEntry(TODAY)]])
    render(<DayStrip todayDate={TODAY} entries={entries} />)
    expect(screen.getByText('today, Sun 24 May 2026 — written')).toBeInTheDocument()
  })

  it('today tile with a published entry gets "today, Sun 24 May 2026 — published"', () => {
    const entries = new Map([[TODAY, makeEntry(TODAY, { is_published: true })]])
    render(<DayStrip todayDate={TODAY} entries={entries} />)
    expect(screen.getByText('today, Sun 24 May 2026 — published')).toBeInTheDocument()
  })

  it('empty non-today tile gets "<date> — no entry" label', () => {
    render(<DayStrip todayDate={TODAY} entries={new Map()} />)
    expect(screen.getByText('Mon 18 May 2026 — no entry')).toBeInTheDocument()
  })

  it('filled non-today tile gets "<date> — written" label', () => {
    const sat = '2026-05-23'
    const entries = new Map([[sat, makeEntry(sat)]])
    render(<DayStrip todayDate={TODAY} entries={entries} />)
    expect(screen.getByText('Sat 23 May 2026 — written')).toBeInTheDocument()
  })

  it('published non-today tile gets "<date> — published" label', () => {
    const fri = '2026-05-22'
    const entries = new Map([[fri, makeEntry(fri, { is_published: true })]])
    render(<DayStrip todayDate={TODAY} entries={entries} />)
    expect(screen.getByText('Fri 22 May 2026 — published')).toBeInTheDocument()
  })

  it('visible today label is aria-hidden to prevent double-announcement', () => {
    render(<DayStrip todayDate={TODAY} entries={new Map()} />)
    // The visible "today" text span must be aria-hidden
    const visibleTodaySpans = document
      .querySelectorAll('[aria-hidden="true"]')
    const todaySpan = Array.from(visibleTodaySpans).find(
      (el) => el.textContent === 'today',
    )
    expect(todaySpan).toBeDefined()
  })
})
