import promptsData from '../../content/prompts.json'
import gratitudeData from '../../content/packs/gratitude.json'
import craftData from '../../content/packs/craft.json'
import stoicData from '../../content/packs/stoic.json'
import griefData from '../../content/packs/grief.json'

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

export type PromptPack = 'standard' | 'gratitude' | 'craft' | 'stoic' | 'grief'

export const PROMPT_PACKS: Record<PromptPack, { label: string; description: string }> = {
  standard: { label: 'standard', description: 'a varied daily prompt.' },
  gratitude: { label: 'gratitude', description: 'noticing what has arrived and what continues.' },
  craft: { label: 'craft', description: 'attention to making, process, and material.' },
  stoic: { label: 'stoic', description: 'what is yours to do, and what is not.' },
  grief: { label: 'grief', description: 'carrying loss, change, and what remains.' },
}

const PACK_DATA: Record<PromptPack, PromptEntry[]> = {
  standard: promptsData as PromptEntry[],
  gratitude: gratitudeData as PromptEntry[],
  craft: craftData as PromptEntry[],
  stoic: stoicData as PromptEntry[],
  grief: griefData as PromptEntry[],
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

function resolvePackData(pack?: string | null): PromptEntry[] {
  const key = (pack ?? 'standard') as PromptPack
  return PACK_DATA[key] ?? PACK_DATA.standard
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
export function getPromptForDate(isoDate: string, pack?: string | null): PromptEntry {
  const prompts = resolvePackData(pack)
  const d = new Date(`${isoDate}T00:00:00Z`)
  const idx = daysSinceEpoch(d) % prompts.length
  return prompts[idx]
}

export function getSevenDayPreview(today: Date, pack?: string | null): DayPreview[] {
  const prompts = resolvePackData(pack)
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
