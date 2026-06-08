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
    expect(screen.getByRole('button', { name: 'send a link' })).toBeInTheDocument()
  })

  it('does not show confirmation or error on load', () => {
    render(<SigninPage />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows expiry notice in reassurance paragraph, not only in footer', () => {
    render(<SigninPage />)
    const reassurance = document.querySelector('main p')
    expect(reassurance).toHaveTextContent('it expires after 24 hours.')
    expect(document.querySelector('footer')).not.toHaveTextContent('sign-in links expire after 24 hours.')
  })

  it('reassurance paragraph precedes the submit button in DOM reading order', () => {
    render(<SigninPage />)
    const form = document.querySelector('form')!
    const children = Array.from(form.children)
    const reassuranceIndex = children.findIndex((el) => el.tagName === 'P')
    const buttonIndex = children.findIndex((el) => el.tagName === 'BUTTON')
    expect(reassuranceIndex).toBeGreaterThanOrEqual(0)
    expect(buttonIndex).toBeGreaterThanOrEqual(0)
    expect(reassuranceIndex).toBeLessThan(buttonIndex)
  })
})

describe('SigninPage — sending state', () => {
  it('shows "sending." and disables submit while request is in flight', async () => {
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
      expect(screen.getByRole('button', { name: 'sending.' })).toBeDisabled()
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
    expect(screen.queryByRole('button', { name: 'send a link' })).not.toBeInTheDocument()
  })

  it('moves focus to the confirmation paragraph after successful send', async () => {
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
    expect(document.activeElement).toBe(screen.getByRole('status'))
  })

  it('shows expiry notice in confirmation, not in footer', async () => {
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

    expect(screen.getByRole('status')).toHaveTextContent('sign-in links expire after 24 hours.')
    expect(document.querySelector('footer')).not.toHaveTextContent('sign-in links expire after 24 hours.')
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
