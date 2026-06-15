import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { EntryMarkdown } from '@/components/entry/EntryMarkdown'
import { get60DayEntries, getYearEntries, formatDisplayDate, offsetDate, todayUtcDate, sanitizeTag } from '@/lib/entries'
import { getMonthInReview } from '@/lib/monthInReview'
import { getYearInReview } from '@/lib/yearInReview'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { MosaicTileData } from './LogMosaic'
import { LogMosaic } from './LogMosaic'
import { LogSearch } from './LogSearch'
import { LogTagFilter } from './LogTagFilter'
import styles from './page.module.css'

export const metadata = {
  title: 'ember · log',
  description: 'a 60-day writing log — prompts, responses, and published entries.',
  openGraph: {
    title: 'ember · log',
    description: 'a 60-day writing log — prompts, responses, and published entries.',
    url: '/log',
  },
  twitter: {
    title: 'ember · log',
    description: 'a 60-day writing log — prompts, responses, and published entries.',
  },
}

type Props = {
  searchParams: Promise<{ tag?: string }>
}

export default async function LogPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const { tag: rawTag } = await searchParams
  const activeTag = rawTag ? sanitizeTag(rawTag) : null

  const today = todayUtcDate()
  const entries = await get60DayEntries(supabase, user.id)

  // Collect distinct tags from the 60-day window for the filter UI
  const allTags = Array.from(
    new Set(
      [...entries.values()].flatMap((e) => e.tags ?? []),
    ),
  ).sort()

  // When a tag filter is active, narrow entries to those carrying that tag
  const visibleEntries = activeTag
    ? new Map([...entries].filter(([, e]) => (e.tags ?? []).includes(activeTag)))
    : entries

  // Build 60 tiles oldest-first (index 0 = 59 days ago, index 59 = today)
  const tiles: MosaicTileData[] = Array.from({ length: 60 }, (_, i) => {
    const date = offsetDate(i - 59)
    const entry = visibleEntries.get(date)
    const isToday = date === today

    let state: MosaicTileData['state'] = 'empty'
    if (isToday && !activeTag) {
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

  // Counts for the summary line — derived from full entries map, not tile state
  const written = entries.size
  const quiet = 60 - entries.size
  const published = [...entries.values()].filter((e) => e.is_published).length

  const monthInReview = getMonthInReview(entries, today)

  // Year-in-review: only query when in January 1-7 to avoid extra DB round-trips
  const todayMonth = parseInt(today.slice(5, 7), 10)
  const todayDay = parseInt(today.slice(8, 10), 10)
  const isNewYearWindow = todayMonth === 1 && todayDay <= 7
  let yearInReview = null
  if (isNewYearWindow) {
    const prevYear = parseInt(today.slice(0, 4), 10) - 1
    const yearEntries = await getYearEntries(supabase, user.id, prevYear)
    yearInReview = getYearInReview(yearEntries, today)
  }

  // Most recent written entry (from full entries, not filtered)
  const sortedDates = [...entries.keys()].sort().reverse()
  const recentDate = sortedDates[0] ?? null
  const recentEntry = recentDate ? entries.get(recentDate) ?? null : null
  const recentPrompt = recentDate ? getPromptForDate(recentDate) : null

  // Filtered entry list (for tag browsing view)
  const filteredDates = [...visibleEntries.keys()].sort().reverse()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup} aria-label="ember — home">
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav} aria-label="site navigation">
          <Link href="/today">today</Link>
          <Link href="/log" className={styles.navCurrent} aria-current="page">log</Link>
          <Link href="/settings">settings</Link>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
      <section className={styles.mosaicWrap} aria-labelledby="mosaic-heading">
        {yearInReview && (
          <p className={styles.yearRecap}>
            in {yearInReview.yearLabel} — {yearInReview.count}{' '}
            {yearInReview.count === 1 ? 'entry' : 'entries'}. the quietest stretch was{' '}
            {yearInReview.quietestMonth}.
          </p>
        )}
        {monthInReview && (
          <p className={styles.monthRecap}>
            in {monthInReview.monthLabel} — {monthInReview.count}{' '}
            {monthInReview.count === 1 ? 'entry' : 'entries'}. the longest sat on the{' '}
            {monthInReview.longestDayOrdinal}.
          </p>
        )}
        <h1 id="mosaic-heading" className={styles.mosaicMeta}>the past 60 days</h1>
        <a href="#log-content" className="skip-link">skip to log</a>
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

      <div id="log-content" className={styles.divider} tabIndex={-1}>
        <div className={styles.dividerLine} />
      </div>

      <section aria-label="log entries">
        <LogSearch />
        {allTags.length > 0 && (
          <LogTagFilter tags={allTags} activeTag={activeTag} />
        )}
        {activeTag ? (
          filteredDates.length > 0 ? (
            <>
              <p className={styles.tagFilterLabel}>
                entries tagged <span className={styles.tagFilterActive}>{activeTag}</span>
              </p>
              <ul className={styles.tagEntryList} aria-label={`entries tagged ${activeTag}`}>
                {filteredDates.map((date) => {
                  const entry = visibleEntries.get(date)!
                  const prompt = getPromptForDate(date)
                  return (
                    <li key={date} className={styles.tagEntryItem}>
                      <Link href={`/log/${date}`} className={styles.tagEntryLink}>
                        <span className={styles.tagEntryDate}>{formatDisplayDate(date)}</span>
                        <span className={styles.tagEntryExcerpt}>
                          {prompt.prompt}
                        </span>
                        {entry.response && (
                          <span className={styles.tagEntryResponse}>
                            {entry.response.slice(0, 80)}{entry.response.length > 80 ? '…' : ''}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <p className={styles.emptyState}>no entries tagged {activeTag} in the past 60 days.</p>
          )
        ) : recentEntry && recentPrompt ? (
          <>
            <article className={styles.entryView} aria-label="most recent entry">
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
              <EntryMarkdown content={recentEntry.response} className={styles.entryResponse} />
            </article>

            <footer className={styles.entryFoot}>
              <span>
                showing the most recent.{' '}
                <Link href={`/log/${recentDate}`}>all entries</Link>
              </span>
              <span>{recentEntry.is_published ? 'published' : 'private'}</span>
            </footer>
          </>
        ) : (
          <p className={styles.emptyState}>
            the log is empty. each entry fills a tile in the mosaic above.{' '}
            <Link href="/today">today&apos;s entry</Link> will appear here.
          </p>
        )}
      </section>
      </main>
    </div>
  )
}
