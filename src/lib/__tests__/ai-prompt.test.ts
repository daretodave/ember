import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getPersonalizedPrompt } from '../ai-prompt'

// Minimal SupabaseClient stub
function makeSupabase(cached: { prompt: string; task: string } | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: cached, error: null })
  const eq2 = vi.fn().mockReturnValue({ maybeSingle })
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
  const select = vi.fn().mockReturnValue({ eq: eq1 })
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const from = vi.fn().mockReturnValue({ select, upsert })
  return { from } as unknown as Parameters<typeof getPersonalizedPrompt>[0]
}

describe('getPersonalizedPrompt', () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    vi.resetModules()
  })

  it('returns cached prompt when one exists', async () => {
    const supabase = makeSupabase({ prompt: 'cached prompt', task: 'cached task' })
    const result = await getPersonalizedPrompt(supabase, 'user-1', '2026-05-16', [])
    expect(result).toEqual({ prompt: 'cached prompt', task: 'cached task' })
  })

  it('returns null when no cache and no API key', async () => {
    const supabase = makeSupabase(null)
    const result = await getPersonalizedPrompt(supabase, 'user-1', '2026-05-16', [])
    expect(result).toBeNull()
  })

  it('returns null on API error without throwing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    // @anthropic-ai/sdk will fail to connect — expect graceful null
    const supabase = makeSupabase(null)
    const result = await getPersonalizedPrompt(supabase, 'user-1', '2026-05-16', [])
    // Should return null rather than throwing
    expect(result).toBeNull()
  })
})
