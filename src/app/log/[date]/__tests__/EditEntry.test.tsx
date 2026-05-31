import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditEntry } from '../EditEntry'
import type { Entry } from '@/lib/entries'

const BASE_ENTRY: Entry = {
  id: 'ent-1',
  user_id: 'user-1',
  date: '2026-05-10',
  response: 'first paragraph\n\nsecond paragraph',
  task_done: false,
  is_published: false,
  created_at: '2026-05-10T09:00:00Z',
  updated_at: '2026-05-10T09:00:00Z',
}

afterEach(() => {
  cleanup()
})

describe('EditEntry — view mode', () => {
  it('renders entry response paragraphs', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    expect(screen.getByText('first paragraph')).toBeInTheDocument()
    expect(screen.getByText('second paragraph')).toBeInTheDocument()
  })

  it('shows task done indicator when task_done is true', () => {
    render(
      <EditEntry
        date="2026-05-10"
        task="do the thing"
        initialEntry={{ ...BASE_ENTRY, task_done: true }}
      />,
    )
    expect(screen.getByRole('img', { name: 'task done' })).toBeInTheDocument()
  })

  it('shows task not done indicator when task_done is false', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    expect(screen.getByRole('img', { name: 'task not done' })).toBeInTheDocument()
  })

  it('shows "private" when not published', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    expect(screen.getByText('private')).toBeInTheDocument()
  })

  it('shows "published" when published', () => {
    render(
      <EditEntry
        date="2026-05-10"
        task="do the thing"
        initialEntry={{ ...BASE_ENTRY, is_published: true }}
      />,
    )
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('shows an edit button', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument()
  })
})

describe('EditEntry — entering edit mode', () => {
  it('switches to edit mode when edit button is clicked', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    expect(screen.getByRole('textbox', { name: 'response' })).toBeInTheDocument()
  })

  it('pre-fills textarea with current response', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    const textarea = screen.getByRole('textbox', { name: 'response' }) as HTMLTextAreaElement
    expect(textarea.value).toBe(BASE_ENTRY.response)
  })

  it('shows save and cancel buttons in edit mode', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  it('cancel returns to view mode', () => {
    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }))
    expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('EditEntry — save flow', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('calls POST /api/entries with correct payload on save', async () => {
    const updatedEntry: Entry = {
      ...BASE_ENTRY,
      response: 'updated text',
      task_done: true,
      is_published: false,
      updated_at: '2026-05-10T10:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(updatedEntry), { status: 200 }),
    )

    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))

    const textarea = screen.getByRole('textbox', { name: 'response' })
    fireEvent.change(textarea, { target: { value: 'updated text' } })

    fireEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/entries',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"response":"updated text"'),
        }),
      )
    })
  })

  it('returns to view mode with updated text after successful save', async () => {
    const updatedEntry: Entry = {
      ...BASE_ENTRY,
      response: 'updated text',
      updated_at: '2026-05-10T10:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(updatedEntry), { status: 200 }),
    )

    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'response' }), {
      target: { value: 'updated text' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(screen.getByText('updated text')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'server error' }), { status: 500 }),
    )

    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('server error')
    })
  })

  it('shows generic error on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network failure'))

    render(<EditEntry date="2026-05-10" task="do the thing" initialEntry={BASE_ENTRY} />)
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('network error. try again.')
    })
  })
})
