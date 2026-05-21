import { createClient } from '@/lib/supabase/server'

type RateLimitParams = {
  key: string
  windowStart: string
  max: number
}

/**
 * Returns true if the request is within the rate limit window and records the
 * event. Returns false if the limit has been reached. Fails open on DB errors
 * so infrastructure issues never block legitimate users.
 */
export async function checkRateLimit({ key, windowStart, max }: RateLimitParams): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_since: windowStart,
      p_max: max,
    })
    if (error) {
      console.error('[rate-limit] rpc error:', error.message)
      return true
    }
    return data as boolean
  } catch (err) {
    console.error('[rate-limit] unexpected error:', err)
    return true
  }
}

/** ISO timestamp for the start of the current UTC calendar day. */
export function utcDayStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

/** ISO timestamp for 24 h ago (rolling window). */
export function rollingWindow24h(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
}
