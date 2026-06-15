import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TodayEntry } from '../TodayEntry'

vi.mock('@/lib/draft-store', () => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
}))

import { getDraft, saveDraft } from '@/lib/draft-store'

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

beforeEach(() => {
  vi.mocked(getDraft).mockResolvedValue(null)
  vi.mocked(saveDraft).mockResolvedValue(undefined)
})

const BASE_PROPS = {
  date: '2026-06-17',
  task: 'notice one thing',
  prompt: 'what did you attend to today?',
  initialEntry: null,
}

describe('check-in word input', () => {
  it('renders the check-in input with placeholder', () => {
    render(<TodayEntry {...BASE_PROPS} />)
    const inputs = screen.getAllByPlaceholderText('one word.')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('pre-fills check-in input when initialEntry has a checkin_word', () => {
    render(
      <TodayEntry
        {...BASE_PROPS}
        initialEntry={{
          id: '1',
          user_id: 'u1',
          date: '2026-06-17',
          response: 'some text',
          task_done: false,
          is_published: false,
          checkin_word: 'steady',
          created_at: '2026-06-17T09:00:00Z',
          updated_at: '2026-06-17T09:00:00Z',
        }}
      />,
    )
    const inputs = screen.getAllByPlaceholderText('one word.') as HTMLInputElement[]
    expect(inputs[0].value).toBe('steady')
  })

  it('sends checkin_word in save payload', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-06-17',
        response: 'hello',
        task_done: false,
        is_published: false,
        checkin_word: 'rain',
        created_at: '2026-06-17T09:00:00Z',
        updated_at: '2026-06-17T09:05:00Z',
      }),
    } as Response)

    render(<TodayEntry {...BASE_PROPS} />)

    const checkinInput = screen.getAllByPlaceholderText('one word.')[0]
    fireEvent.change(checkinInput, { target: { value: 'rain' } })

    const textarea = screen.getByLabelText<HTMLTextAreaElement>('response', {
      selector: '#today-entry-response',
    })
    fireEvent.change(textarea, { target: { value: 'hello' } })

    const saveBtns = screen.getAllByRole('button', { name: /^save$/ })
    fireEvent.click(saveBtns[0])

    await waitFor(() => {
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body.checkin_word).toBe('rain')
    })
  })

  it('sends checkin_word: null when input is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        user_id: 'u1',
        date: '2026-06-17',
        response: 'hello',
        task_done: false,
        is_published: false,
        checkin_word: null,
        created_at: '2026-06-17T09:00:00Z',
        updated_at: '2026-06-17T09:05:00Z',
      }),
    } as Response)

    render(<TodayEntry {...BASE_PROPS} />)

    const textarea = screen.getByLabelText<HTMLTextAreaElement>('response', {
      selector: '#today-entry-response',
    })
    fireEvent.change(textarea, { target: { value: 'hello' } })

    const saveBtns = screen.getAllByRole('button', { name: /^save$/ })
    fireEvent.click(saveBtns[0])

    await waitFor(() => {
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body.checkin_word).toBeNull()
    })
  })
})
