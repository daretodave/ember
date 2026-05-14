import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { get60DayEntries, formatDisplayDate, offsetDate, todayUtcDate } from '@/lib/entries'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { MosaicTileData } from './LogMosaic'
import { LogMosaic } from './LogMosaic'
import styles from './page.module.css'

export const metadata = {
  title: 'ember · log',
  description: 'your past sixty days',
}

export default async function LogPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const today = todayUtcDate()
  const entries = await get60DayEntries(supabase, user.id)

  // Build 60 tiles oldest-first (index 0 = 59 days ago, index 59 = today)
  const tiles: MosaicTileData[] = Array.from({ length: 60 }, (_, i) => {
    const date = offsetDate(i - 59)
    const entry = entries.get(date)
    const isToday = date === today

    let state: MosaicTileData['state'] = 'empty'
    if (isToday) {
      state = 'today'
    } else if (entry?.is_published) {
      state = 'published'
    } else if (entry) {
      state = 'filled'
    }

    return {
      date,
      state,
      excerpt: entry ? entry.response.slice(0, 80) : '',
      displayDate: formatDisplayDate(date),
    }
  })

  // Counts for the summary line
  const written = tiles.filter((t) => t.state !== 'empty').length
  const quiet = tiles.filter((t) => t.state === 'empty').length
  const published = tiles.filter((t) => t.state === 'published').length

  // Most recent written entry
  const sortedDates = [...entries.keys()].sort().reverse()
  const recentDate = sortedDates[0] ?? null
  const recentEntry = recentDate ? entries.get(recentDate) ?? null : null
  const recentPrompt = recentDate ? getPromptForDate(recentDate) : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav}>
          <a href="/today">today</a>
          <a href="/log" className={styles.navCurrent}>log</a>
          <a href="/settings">settings</a>
        </nav>
      </header>

      <section className={styles.mosaicWrap}>
        <p className={styles.mosaicMeta}>your past sixty days</p>
        <LogMosaic tiles={tiles} />
        <p className={styles.mosaicCount}>
          {written} {written === 1 ? 'day' : 'days'} written.{' '}
          <span>
            {quiet} quiet. {published} published.
          </span>
        </p>
      </section>

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
      </div>

      {recentEntry && recentPrompt ? (
        <>
          <article className={styles.entryView}>
            <header className={styles.entryDate}>
              {formatDisplayDate(recentDate!)}
              {recentDate === today && ' · today'}
            </header>
            <h1 className={styles.entryPrompt}>{recentPrompt.prompt}</h1>
            <p className={styles.entryTask}>
              <span className={recentEntry.task_done ? styles.entryTaskCheck : undefined} />
              {recentPrompt.task}
            </p>
            <div className={styles.entryResponse}>
              {recentEntry.response.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </article>

          <footer className={styles.entryFoot}>
            <span>
              showing the most recent.{' '}
              <Link href={`/log/${recentDate}`}>browse by date</Link>
            </span>
            <span>{recentEntry.is_published ? 'published' : 'private'}</span>
          </footer>
        </>
      ) : (
        <p className={styles.emptyState}>
          your log is empty. today is a good place to start.
        </p>
      )}
    </div>
  )
}
