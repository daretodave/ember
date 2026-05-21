import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TodayEntry } from '../TodayEntry'

vi.mock('@/lib/draft-store', () => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
}))

import { clearDraft, getDraft, saveDraft } from '@/lib/draft-store'

const baseProps = {
  date: '2026-05-21',
  task: 'write one sentence',
  prompt: 'what are you attending to today?',
  initialEntry: null,
}

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
})

beforeEach(() => {
  vi.mocked(getDraft).mockResolvedValue(null)
  vi.mocked(saveDraft).mockResolvedValue(undefined)
  vi.mocked(clearDraft).mockResolvedValue(undefined)
})

describe('offline draft — load on mount', () => {
  it('restores a saved draft when initialEntry is null', async () => {
    vi.mocked(getDraft).mockResolvedValue({ response: 'restored text', taskDone: false })

    render(<TodayEntry {...baseProps} />)

    await waitFor(() => {
      const textarea = screen.getByLabelText<HTMLTextAreaElement>('your response', {
        selector: '#today-entry-response',
      })
      expect(textarea.value).toBe('restored text')
    })

    await waitFor(() => {
      expect(screen.getAllByText('draft restored').length).toBeGreaterThan(0)
    })
  })

  it('does not load draft when initialEntry is present', async () => {
    render(
      <TodayEntry
        {...baseProps}
        initialEntry={{
          id: '1',
          user_id: 'u1',
          date: '2026-05-21',
          response: 'server entry',
          task_done: false,
          is_published: false,
          created_at: '2026-05-21T09:00:00Z',
          updated_at: '2026-05-21T09:00:00Z',
        }}
      />,
    )

    // getDraft should not fire when a server entry exists
    await waitFor(() => {
      expect(getDraft).not.toHaveBeenCalled()
    })

    const textarea = screen.getByLabelText<HTMLTextAreaElement>('your response', {
      selector: '#today-entry-response',
    })
    expect(textarea.value).toBe('server entry')
  })
})

describe('offline indicator', () => {
  it('shows "saved locally — will sync" when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true })

    render(<TodayEntry {...baseProps} />)

    // Trigger the offline event so the component's state picks it up
    window.dispatchEvent(new Event('offline'))

    await waitFor(() => {
      expect(screen.getAllByText('saved locally — will sync').length).toBeGreaterThan(0)
    })
  })
})

describe('clearDraft on save', () => {
  it('calls clearDraft after a successful server save', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-05-21',
        response: 'text',
        task_done: false,
        is_published: false,
        created_at: '2026-05-21T09:00:00Z',
        updated_at: '2026-05-21T09:05:00Z',
      }),
    } as Response)

    render(<TodayEntry {...baseProps} />)

    // The component renders two save buttons (main + focus overlay); click the first
    const saveBtns = screen.getAllByRole('button', { name: /^save$/ })
    saveBtns[0].click()

    await waitFor(() => {
      expect(clearDraft).toHaveBeenCalledWith('2026-05-21')
    })
  })
})
