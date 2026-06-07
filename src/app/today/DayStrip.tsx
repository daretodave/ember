import type { Entry } from '@/lib/entries'
import { formatDisplayDate, formatShortWeekday, offsetDate } from '@/lib/entries'
import Link from 'next/link'
import styles from './page.module.css'

type TileState = 'empty' | 'filled' | 'today' | 'published'

function tileClass(state: TileState): string {
  if (state === 'filled') return 'tile tile--filled'
  if (state === 'today') return 'tile tile--today'
  if (state === 'published') return 'tile tile--published'
  return 'tile'
}

function tileStateLabel(date: string, state: TileState, entry?: Entry): string {
  const displayDate = formatDisplayDate(date)
  if (state === 'today') {
    const entryState = entry?.is_published ? 'published' : entry ? 'written' : 'no entry'
    return `today, ${displayDate} — ${entryState}`
  }
  if (state === 'filled') return `${displayDate} — written`
  if (state === 'published') return `${displayDate} — published`
  return `${displayDate} — no entry`
}

type Props = {
  todayDate: string
  entries: Map<string, Entry>
}

export function DayStrip({ todayDate, entries }: Props) {
  // Build the last 7 days, oldest first (index 0 = 6 days ago, index 6 = today)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = offsetDate(i - 6)
    const entry = entries.get(date)
    const isToday = date === todayDate

    let state: TileState = 'empty'
    if (isToday) {
      state = 'today'
    } else if (entry?.is_published) {
      state = 'published'
    } else if (entry) {
      state = 'filled'
    }

    return { date, isToday, state, label: formatShortWeekday(date), entry }
  })

  return (
    <section id="day-strip" className={styles.strip}>
      <div className={styles.stripHead}>
        <h2 className={styles.stripLabel}>the last seven days</h2>
        <Link href="/log" className={styles.stripLink}>
          log
        </Link>
      </div>
      <div className={styles.stripRow}>
        {days.map(({ date, isToday, state, label, entry }) => (
          <div key={date} className={styles.stripDay}>
            <div className={tileClass(state)} aria-hidden="true" />
            <span
              className={`${styles.stripDate}${isToday ? ` ${styles.stripDateToday}` : ''}`}
              aria-hidden="true"
            >
              {isToday ? 'today' : label}
            </span>
            <span className={styles.srOnly}>{tileStateLabel(date, state, entry)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
