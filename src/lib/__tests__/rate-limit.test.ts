import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ rpc: mockRpc }),
}))

describe('checkRateLimit', () => {
  let checkRateLimit: (p: { key: string; windowStart: string; max: number }) => Promise<boolean>

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../rate-limit')
    checkRateLimit = mod.checkRateLimit
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns true when RPC returns true (allowed)', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await checkRateLimit({ key: 'signin:a@b.com', windowStart: new Date().toISOString(), max: 3 })
    expect(result).toBe(true)
  })

  it('returns false when RPC returns false (blocked)', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null })
    const result = await checkRateLimit({ key: 'signin:a@b.com', windowStart: new Date().toISOString(), max: 3 })
    expect(result).toBe(false)
  })

  it('fails open (returns true) when RPC returns an error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'connection refused' } })
    const result = await checkRateLimit({ key: 'signin:a@b.com', windowStart: new Date().toISOString(), max: 3 })
    expect(result).toBe(true)
  })

  it('fails open when createClient throws', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockRejectedValueOnce(new Error('supabase down'))
    const result = await checkRateLimit({ key: 'entry:uid:2026-05-21', windowStart: new Date().toISOString(), max: 10 })
    expect(result).toBe(true)
  })

  it('calls rpc with the expected arguments', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const windowStart = '2026-05-21T00:00:00.000Z'
    await checkRateLimit({ key: 'entry:user-1:2026-05-21', windowStart, max: 10 })
    expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
      p_key: 'entry:user-1:2026-05-21',
      p_since: windowStart,
      p_max: 10,
    })
  })
})

describe('utcDayStart', () => {
  it('returns a UTC midnight ISO string for today', async () => {
    const { utcDayStart } = await import('../rate-limit')
    const result = utcDayStart()
    const parsed = new Date(result)
    expect(parsed.getUTCHours()).toBe(0)
    expect(parsed.getUTCMinutes()).toBe(0)
    expect(parsed.getUTCSeconds()).toBe(0)
    expect(parsed.getUTCMilliseconds()).toBe(0)
  })
})

describe('rollingWindow24h', () => {
  it('returns a timestamp approximately 24 h ago', async () => {
    const { rollingWindow24h } = await import('../rate-limit')
    const before = Date.now()
    const result = rollingWindow24h()
    const after = Date.now()
    const ts = new Date(result).getTime()
    const expected = before - 24 * 60 * 60 * 1000
    expect(ts).toBeGreaterThanOrEqual(expected - 100)
    expect(ts).toBeLessThanOrEqual(after - 24 * 60 * 60 * 1000 + 100)
  })
})
