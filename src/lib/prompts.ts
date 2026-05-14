import promptsData from '../../content/prompts.json'

export type PromptEntry = {
  prompt: string
  task: string
}

export type DayPreview = {
  date: Date
  label: string
  shortDate: string
  prompt: string
  task: string
  isToday: boolean
}

const MS_PER_DAY = 86_400_000
// fixed epoch for deterministic day-index across time zones
const EPOCH_MS = Date.UTC(2000, 0, 1)

function daysSinceEpoch(utcDate: Date): number {
  return Math.floor(
    (Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()) - EPOCH_MS) /
      MS_PER_DAY,
  )
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatShortDate(d: Date): string {
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/** Return the prompt + task for any given UTC date string (YYYY-MM-DD). */
export function getPromptForDate(isoDate: string): PromptEntry {
  const prompts = promptsData as PromptEntry[]
  const d = new Date(`${isoDate}T00:00:00Z`)
  const idx = daysSinceEpoch(d) % prompts.length
  return prompts[idx]
}

export function getSevenDayPreview(today: Date): DayPreview[] {
  const prompts = promptsData as PromptEntry[]
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  )

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayUtc.getTime() + i * MS_PER_DAY)
    const idx = daysSinceEpoch(d) % prompts.length
    const label =
      i === 0 ? 'today' : i === 1 ? 'tomorrow' : `in ${i} days`

    return {
      date: d,
      label,
      shortDate: formatShortDate(d),
      prompt: prompts[idx].prompt,
      task: prompts[idx].task,
      isToday: i === 0,
    }
  })
}
