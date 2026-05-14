import type { Entry } from '@/lib/entries'
import { formatShortWeekday, offsetDate } from '@/lib/entries'
import styles from './page.module.css'

type TileState = 'empty' | 'filled' | 'today' | 'published'

function tileClass(state: TileState): string {
  if (state === 'filled') return 'tile tile--filled'
  if (state === 'today') return 'tile tile--today'
  if (state === 'published') return 'tile tile--published'
  return 'tile'
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

    return { date, isToday, state, label: formatShortWeekday(date) }
  })

  return (
    <section className={styles.strip}>
      <div className={styles.stripHead}>
        <span className={styles.stripLabel}>your last seven days</span>
        <a href="/log" className={styles.stripLink}>
          see all sixty
        </a>
      </div>
      <div className={styles.stripRow}>
        {days.map(({ date, isToday, state, label }) => (
          <div key={date} className={styles.stripDay}>
            <div className={tileClass(state)} aria-label={date} />
            <span className={`${styles.stripDate}${isToday ? ` ${styles.stripDateToday}` : ''}`}>
              {isToday ? 'today' : label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
