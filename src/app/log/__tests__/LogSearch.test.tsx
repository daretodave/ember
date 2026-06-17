import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [k: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('LogSearch', () => {
  let LogSearch: typeof import('../LogSearch').LogSearch

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../LogSearch')
    LogSearch = mod.LogSearch
  })

  it('renders the search input', () => {
    render(<LogSearch />)
    expect(screen.getByLabelText('search entries')).toBeInTheDocument()
  })

  it('shows placeholder text', () => {
    render(<LogSearch />)
    expect(screen.getByPlaceholderText('a word or phrase')).toBeInTheDocument()
  })

  it('does not show results when query is empty', () => {
    render(<LogSearch />)
    expect(screen.queryByRole('list', { name: 'search results' })).not.toBeInTheDocument()
    expect(screen.queryByText('nothing found.')).not.toBeInTheDocument()
  })

  it('shows results when API returns matches', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ date: '2026-05-01', excerpt: 'morning light filled the room' }],
      }),
    })

    render(<LogSearch />)
    fireEvent.change(screen.getByLabelText('search entries'), {
      target: { value: 'morning' },
    })

    await waitFor(
      () => {
        expect(screen.getByRole('list', { name: 'search results' })).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
    expect(screen.getByText('morning light filled the room')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/log/2026-05-01')
  }, 5000)

  it('shows "nothing found." when API returns empty results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    })

    render(<LogSearch />)
    fireEvent.change(screen.getByLabelText('search entries'), {
      target: { value: 'xyznotfound' },
    })

    await waitFor(
      () => {
        expect(screen.getByText('nothing found.')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  }, 5000)

  it('shows "search unavailable." when API request fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    render(<LogSearch />)
    fireEvent.change(screen.getByLabelText('search entries'), {
      target: { value: 'error' },
    })

    await waitFor(
      () => {
        expect(screen.getByText('search unavailable.')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  }, 5000)
})
