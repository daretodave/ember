import type { Entry } from './entries'

export type YearInReview = {
  yearLabel: number
  count: number
  quietestMonth: string
}

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

export function getYearInReview(
  entries: Map<string, Entry>,
  today: string,
): YearInReview | null {
  const year = parseInt(today.slice(0, 4), 10)
  const month = parseInt(today.slice(5, 7), 10)
  const day = parseInt(today.slice(8, 10), 10)

  if (month !== 1 || day > 7) return null

  const prevYear = year - 1
  const prevYearPrefix = `${prevYear}-`

  const priorEntries: Entry[] = []
  for (const [date, entry] of entries) {
    if (date.startsWith(prevYearPrefix)) {
      priorEntries.push({ ...entry, date })
    }
  }

  if (priorEntries.length === 0) return null

  // Count entries per calendar month (0-indexed)
  const monthCounts = new Array(12).fill(0)
  for (const entry of priorEntries) {
    const m = parseInt(entry.date.slice(5, 7), 10) - 1
    monthCounts[m]++
  }

  // Quietest = fewest entries among months that have at least one entry;
  // earliest calendar month wins ties. Skipped months (count 0) are not
  // "stretches" of practice and are excluded from the competition.
  let quietestIdx = -1
  let quietestCount = Infinity
  for (let i = 0; i < 12; i++) {
    if (monthCounts[i] > 0 && monthCounts[i] < quietestCount) {
      quietestCount = monthCounts[i]
      quietestIdx = i
    }
    // Ties: iterating 0→11 guarantees earliest month is chosen first
  }

  if (quietestIdx === -1) return null // guard; can't happen when priorEntries.length > 0

  return {
    yearLabel: prevYear,
    count: priorEntries.length,
    quietestMonth: MONTH_NAMES[quietestIdx],
  }
}
