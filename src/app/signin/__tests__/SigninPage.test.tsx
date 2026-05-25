import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SigninPage from '../page'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('SigninPage — initial state', () => {
  it('renders the email input and submit button', () => {
    render(<SigninPage />)
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'send the link' })).toBeInTheDocument()
  })

  it('does not show confirmation or error on load', () => {
    render(<SigninPage />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('SigninPage — sending state', () => {
  it('shows "sending..." and disables submit while request is in flight', async () => {
    let settle: (v: Response) => void
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((r) => {
        settle = r
      }),
    )

    render(<SigninPage />)
    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'sending...' })).toBeDisabled()
    })

    settle!({ ok: true, json: async () => ({}) } as Response)
  })
})

describe('SigninPage — sent state', () => {
  it('shows confirmation with role="status" after successful send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    render(<SigninPage />)
    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'send the link' })).not.toBeInTheDocument()
  })
})

describe('SigninPage — error state', () => {
  it('shows role="alert" with the API error message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'rate limit exceeded' }),
    } as Response)

    render(<SigninPage />)
    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert').textContent).toBe('rate limit exceeded')
    })
  })

  it('shows fallback error message when API returns no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response)

    render(<SigninPage />)
    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe('something went wrong. try again.')
    })
  })
})
