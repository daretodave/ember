import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TodayEntry } from '../TodayEntry'

vi.mock('@/lib/draft-store', () => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
}))

import { getDraft } from '@/lib/draft-store'

const BASE_PROPS = {
  date: '2026-05-21',
  task: 'notice one thing',
  prompt: 'what did you attend to today?',
}

const SAMPLE_ENTRY = {
  id: '1',
  user_id: 'u1',
  date: '2026-05-21',
  response: 'some prior text',
  task_done: false,
  is_published: false,
  updated_at: '2026-05-21T14:30:00.000Z',
  created_at: '2026-05-21T10:00:00.000Z',
}

beforeEach(() => {
  vi.mocked(getDraft).mockResolvedValue(null)
})

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

describe('save indicator — idle-empty state (regression: a044cd0)', () => {
  it('shows no text when there is no entry and the textarea is empty', () => {
    render(<TodayEntry {...BASE_PROPS} initialEntry={null} />)
    const indicators = Array.from(document.querySelectorAll('[aria-live="polite"]'))
    expect(indicators.length).toBeGreaterThan(0)
    indicators.forEach((el) => expect(el.textContent).toBe(''))
  })

  it('never renders "not yet saved" text on initial empty load', () => {
    render(<TodayEntry {...BASE_PROPS} initialEntry={null} />)
    const indicators = Array.from(document.querySelectorAll('[aria-live="polite"]'))
    indicators.forEach((el) => expect(el.textContent).not.toContain('not yet saved'))
  })
})

describe('save indicator — loaded-entry state (regression: c1eec87)', () => {
  it('shows "last saved · HH:MM" on load when an existing entry is provided', () => {
    render(<TodayEntry {...BASE_PROPS} initialEntry={SAMPLE_ENTRY} />)
    const indicators = Array.from(document.querySelectorAll('[aria-live="polite"]'))
    expect(indicators.some((el) => el.textContent?.startsWith('last saved ·'))).toBe(true)
  })

  it('does not show an empty indicator when an existing entry is provided', () => {
    render(<TodayEntry {...BASE_PROPS} initialEntry={SAMPLE_ENTRY} />)
    const indicators = Array.from(document.querySelectorAll('[aria-live="polite"]'))
    expect(indicators.some((el) => (el.textContent?.length ?? 0) > 0)).toBe(true)
  })
})
