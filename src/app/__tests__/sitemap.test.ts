import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockNot = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockCreateClient = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

describe('sitemap()', () => {
  let sitemap: () => Promise<Array<{ url: string; priority?: number }>>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockNot.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ not: mockNot })
    mockFrom.mockReturnValue({ select: mockSelect })
    mockCreateClient.mockReturnValue({ from: mockFrom })

    const mod = await import('../sitemap')
    sitemap = mod.default as typeof sitemap
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns static + profile entries when Supabase succeeds', async () => {
    mockNot.mockResolvedValue({
      data: [
        { username: 'alice', updated_at: '2026-05-01T00:00:00Z' },
        { username: 'bob', updated_at: null },
      ],
      error: null,
    })
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls.some((u) => u.includes('/u/alice'))).toBe(true)
    expect(urls.some((u) => u.includes('/u/bob'))).toBe(true)
    expect(entries.length).toBe(4)
  })

  it('returns static entries only when Supabase returns an error', async () => {
    mockNot.mockResolvedValue({ data: null, error: { message: 'db error' } })
    const entries = await sitemap()
    expect(entries.length).toBe(2)
    expect(entries.every((e) => !e.url.includes('/u/'))).toBe(true)
  })

  it('returns static entries only when the query throws', async () => {
    mockNot.mockRejectedValue(new Error('network failure'))
    const entries = await sitemap()
    expect(entries.length).toBe(2)
    expect(entries.every((e) => !e.url.includes('/u/'))).toBe(true)
  })

  it('home entry carries priority 1', async () => {
    mockNot.mockResolvedValue({ data: [], error: null })
    const entries = await sitemap()
    const home = entries.find((e) => !e.url.endsWith('/signin'))
    expect(home?.priority).toBe(1)
  })
})
