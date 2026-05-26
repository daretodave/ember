import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TodayEntry } from '../TodayEntry'

vi.mock('@/lib/draft-store', () => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
}))

import { clearDraft, getDraft, saveDraft } from '@/lib/draft-store'

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

beforeEach(() => {
  vi.mocked(getDraft).mockResolvedValue(null)
  vi.mocked(saveDraft).mockResolvedValue(undefined)
  vi.mocked(clearDraft).mockResolvedValue(undefined)
})

const BASE_PROPS = {
  date: '2026-05-26',
  task: 'notice one thing',
  prompt: 'what did you attend to today?',
  initialEntry: null,
}

function typeInEntry(text: string) {
  const textarea = screen.getByLabelText<HTMLTextAreaElement>('your response', {
    selector: '#today-entry-response',
  })
  fireEvent.change(textarea, { target: { value: text } })
}

function clickSave() {
  const saveBtns = screen.getAllByRole('button', { name: /^save$/ })
  fireEvent.click(saveBtns[0])
}

describe('EntrySave — payload', () => {
  it('POSTs the correct payload to /api/entries on save', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-05-26',
        response: 'test text',
        task_done: false,
        is_published: false,
        created_at: '2026-05-26T09:00:00Z',
        updated_at: '2026-05-26T09:05:00Z',
      }),
    } as Response)

    render(<TodayEntry {...BASE_PROPS} />)
    typeInEntry('test text')
    clickSave()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/entries',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            date: '2026-05-26',
            response: 'test text',
            task_done: false,
            is_published: false,
          }),
        }),
      )
    })
  })

  it('includes task_done: true in payload after task button is toggled', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-05-26',
        response: 'text',
        task_done: true,
        is_published: false,
        created_at: '2026-05-26T09:00:00Z',
        updated_at: '2026-05-26T09:05:00Z',
      }),
    } as Response)

    render(<TodayEntry {...BASE_PROPS} />)
    typeInEntry('text')

    fireEvent.click(screen.getByRole('button', { name: 'mark task done' }))
    clickSave()

    await waitFor(() => {
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body.task_done).toBe(true)
    })
  })
})

describe('EntrySave — save state', () => {
  it('shows "saving..." and disables save button during in-flight request', async () => {
    let settle: (v: Response) => void
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((r) => {
        settle = r
      }),
    )

    render(<TodayEntry {...BASE_PROPS} />)
    typeInEntry('text')
    clickSave()

    await waitFor(() => {
      const savingBtns = screen.getAllByRole('button', { name: 'saving...' })
      expect(savingBtns[0]).toBeDisabled()
    })

    settle!({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-05-26',
        response: 'text',
        task_done: false,
        is_published: false,
        created_at: '2026-05-26T09:00:00Z',
        updated_at: '2026-05-26T09:05:00Z',
      }),
    } as Response)
  })

  it('aria-live region shows saved time after successful save', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-05-26',
        response: 'text',
        task_done: false,
        is_published: false,
        created_at: '2026-05-26T09:00:00Z',
        updated_at: '2026-05-26T09:05:00Z',
      }),
    } as Response)

    render(<TodayEntry {...BASE_PROPS} />)
    typeInEntry('text')
    clickSave()

    await waitFor(() => {
      const liveRegions = document.querySelectorAll('[aria-live="polite"]')
      const texts = Array.from(liveRegions).map((el) => el.textContent ?? '')
      expect(texts.some((t) => t.startsWith('last saved ·'))).toBe(true)
    })
  })

  it('shows role="alert" with API error message on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'rate limit exceeded. try again tomorrow.' }),
    } as Response)

    render(<TodayEntry {...BASE_PROPS} />)
    typeInEntry('text')
    clickSave()

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some((el) => el.textContent === 'rate limit exceeded. try again tomorrow.')).toBe(
        true,
      )
    })
  })

  it('shows "network error. try again." on fetch rejection', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network failure'))

    render(<TodayEntry {...BASE_PROPS} />)
    typeInEntry('text')
    clickSave()

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some((el) => el.textContent === 'network error. try again.')).toBe(true)
    })
  })
})
