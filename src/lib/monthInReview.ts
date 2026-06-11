import type { Entry } from './entries'

export type MonthInReview = {
  monthLabel: string
  count: number
  longestDayOrdinal: string
}

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

function ordinal(n: number): string {
  const v = n % 100
  const suffix = v >= 11 && v <= 13
    ? 'th'
    : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
  return `${n}${suffix}`
}

export function getMonthInReview(
  entries: Map<string, Entry>,
  today: string,
): MonthInReview | null {
  const year = parseInt(today.slice(0, 4), 10)
  const month = parseInt(today.slice(5, 7), 10)
  const day = parseInt(today.slice(8, 10), 10)

  if (day > 7) return null

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevMonthPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}-`

  const priorEntries: Entry[] = []
  for (const [date, entry] of entries) {
    if (date.startsWith(prevMonthPrefix)) {
      priorEntries.push({ ...entry, date })
    }
  }

  if (priorEntries.length === 0) return null

  let longest = priorEntries[0]
  for (const e of priorEntries.slice(1)) {
    const isLonger = e.response.length > longest.response.length
    const isTieEarlier =
      e.response.length === longest.response.length && e.date < longest.date
    if (isLonger || isTieEarlier) longest = e
  }

  return {
    monthLabel: MONTH_NAMES[prevMonth - 1],
    count: priorEntries.length,
    longestDayOrdinal: ordinal(parseInt(longest.date.slice(8, 10), 10)),
  }
}
