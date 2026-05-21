import Link from 'next/link'
import type { Entry } from '@/lib/entries'
import styles from './page.module.css'

type Props = {
  entry: Entry | null
  todayYear: number
}

export function yearsAgoText(entryDate: string, todayYear: number): string {
  const entryYear = parseInt(entryDate.slice(0, 4), 10)
  const diff = todayYear - entryYear
  if (diff === 1) return 'a year ago'
  if (diff === 2) return 'two years ago'
  if (diff === 3) return 'three years ago'
  return `${diff} years ago`
}

export function openingClause(response: string): string {
  const trimmed = response.trim()
  if (trimmed.length <= 80) return trimmed
  return `${trimmed.slice(0, 80)}…`
}

export function OnThisDay({ entry, todayYear }: Props) {
  if (!entry || !entry.response.trim()) return null

  const yearText = yearsAgoText(entry.date, todayYear)
  const clause = openingClause(entry.response)

  return (
    <aside className={styles.onThisDay}>
      <p className={styles.onThisDayText}>
        {yearText}, you wrote &mdash;{' '}
        <Link href={`/log/${entry.date}`} className={styles.onThisDayLink}>
          {clause}
        </Link>
      </p>
    </aside>
  )
}
