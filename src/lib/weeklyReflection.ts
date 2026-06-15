import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT = `you are ember. write one short paragraph (3–5 sentences) observing what appeared in this person's writing this week. lower-case throughout. no praise, no prescriptions, no scoring. notice concrete details, recurring words, shifts in tone. do not refer to yourself or the person directly — describe the writing itself.

respond with the paragraph only, no fences, no preamble.`

/** Returns the ISO 8601 week string for today (UTC), e.g. "2026-W24". */
export function currentIsoWeek(): string {
  return dateToIsoWeek(new Date())
}

/** Returns the ISO 8601 week string for a given Date (UTC). */
export function dateToIsoWeek(d: Date): string {
  // ISO week: week containing Thursday. Jan 4 is always in week 1.
  const thursday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  // Shift so Monday = 0 ... Sunday = 6
  const dow = (thursday.getUTCDay() + 6) % 7
  thursday.setUTCDate(thursday.getUTCDate() - dow + 3)
  const year = thursday.getUTCFullYear()
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Dow = (jan4.getUTCDay() + 6) % 7
  const weekStart = new Date(jan4)
  weekStart.setUTCDate(jan4.getUTCDate() - jan4Dow)
  const weekNum = Math.round((thursday.getTime() - weekStart.getTime()) / 604_800_000) + 1
  return `${year}-W${String(weekNum).padStart(2, '0')}`
}

/** Returns the Monday and Sunday (inclusive) for an ISO week string. */
export function getWeekDateRange(isoWeek: string): { start: string; end: string } {
  const m = /^(\d{4})-W(\d{2})$/.exec(isoWeek)
  if (!m) throw new Error(`invalid iso week: ${isoWeek}`)
  const year = parseInt(m[1], 10)
  const week = parseInt(m[2], 10)
  // Monday of week 1 = Jan 4 of that year minus its weekday offset
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Dow = (jan4.getUTCDay() + 6) % 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Dow + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
  return { start: fmt(monday), end: fmt(sunday) }
}

type CacheRow = { reflection_text: string }

/**
 * Return the cached weekly reflection for the current ISO week, or generate
 * and cache it. Returns null when < 3 entries exist or when the API key
 * is absent.
 */
export async function getWeeklyReflection(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const week = currentIsoWeek()

  const { data: cached } = await supabase
    .from('weekly_reflections')
    .select('reflection_text')
    .eq('user_id', userId)
    .eq('iso_week', week)
    .maybeSingle()

  if (cached) {
    return (cached as CacheRow).reflection_text
  }

  if (!process.env.ANTHROPIC_API_KEY) return null

  const { start, end } = getWeekDateRange(week)

  const { data: rows, error } = await supabase
    .from('entries')
    .select('date, response')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })

  if (error || !rows || rows.length < 3) return null

  const entries = (rows as { date: string; response: string }[])

  try {
    const client = new Anthropic()

    const entryBlock = entries
      .map((e, i) => `${i + 1}. (${e.date}) ${e.response.slice(0, 300)}`)
      .join('\n\n')

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `here are the entries from this week (${week}):\n\n${entryBlock}`,
        },
      ],
    })

    const text = msg.content.find((b) => b.type === 'text')?.text?.trim() ?? ''
    if (!text) return null

    await supabase
      .from('weekly_reflections')
      .upsert({ user_id: userId, iso_week: week, reflection_text: text }, { onConflict: 'user_id,iso_week' })

    return text
  } catch {
    return null
  }
}
