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
  description: 'your writing log — prompts, responses, and the entries you have published over the past 60 days.',
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

  // Counts for the summary line — derived from entries map, not tile state,
  // because today's tile is always state='today' regardless of whether it's
  // written or published, which causes tile-based counts to be wrong.
  const written = entries.size
  const quiet = 60 - entries.size
  const published = [...entries.values()].filter((e) => e.is_published).length

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
        <nav className={styles.nav} aria-label="site navigation">
          <Link href="/today">today</Link>
          <Link href="/log" className={styles.navCurrent} aria-current="page">log</Link>
          <Link href="/settings">settings</Link>
        </nav>
      </header>

      <main id="main-content">
      <section className={styles.mosaicWrap}>
        <h1 className={styles.mosaicMeta}>the past 60 days</h1>
        <LogMosaic tiles={tiles} />
        {written > 0 && (
          <p className={styles.mosaicCount}>
            {written} {written === 1 ? 'day' : 'days'} written.{' '}
            <span>
              {quiet} {quiet === 1 ? 'day' : 'days'} quiet.{' '}
              {published} {published === 1 ? 'day' : 'days'} published.
            </span>
          </p>
        )}
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
            <h2 className={styles.entryPrompt}>{recentPrompt.prompt}</h2>
            <p className={styles.entryTask}>
              <span
                className={recentEntry.task_done ? styles.entryTaskCheck : undefined}
                role="img"
                aria-label={recentEntry.task_done ? 'task done' : 'task not done'}
              />
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
          your log is empty.{' '}
          <Link href="/today">today&apos;s entry</Link> will appear here.
        </p>
      )}
      </main>
    </div>
  )
}
