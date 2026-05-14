import type { SupabaseClient } from '@supabase/supabase-js'

export type Entry = {
  id: string
  user_id: string
  date: string // ISO date string YYYY-MM-DD
  response: string
  task_done: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export type EntryRow = Entry

/** UTC calendar date as YYYY-MM-DD */
export function todayUtcDate(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/** Format a UTC date string for display: "Wed 13 May 2026" */
export function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** Format a UTC ISO timestamp as "HH:MM" for the "last saved" stamp. */
export function formatSavedTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp)
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `last saved · ${h}:${m}`
}

/** Short weekday for strip tiles: "Mon" */
export function formatShortWeekday(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]
}

/**
 * Fetch the entry for the authenticated user on a given UTC date.
 * Returns null if no entry exists yet.
 */
export async function getTodayEntry(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) {
    console.error('getTodayEntry error:', error.message)
    return null
  }
  return data as Entry | null
}

/**
 * Fetch entries for the last N days (inclusive of today).
 * Returns a map from date string → entry (or undefined if no entry that day).
 */
export async function getRecentEntries(
  supabase: SupabaseClient,
  userId: string,
  days: number,
): Promise<Map<string, Entry>> {
  const dates: string[] = []
  const todayMs = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  )
  for (let i = 0; i < days; i++) {
    const d = new Date(todayMs - i * 86_400_000)
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    dates.push(iso)
  }

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .in('date', dates)

  if (error) {
    console.error('getRecentEntries error:', error.message)
    return new Map()
  }

  const map = new Map<string, Entry>()
  for (const row of (data ?? []) as Entry[]) {
    map.set(row.date, row)
  }
  return map
}

/** Returns the YYYY-MM-DD for a day offset from today (negative = past). */
export function offsetDate(offsetDays: number): string {
  const ms = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  ) + offsetDays * 86_400_000
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
