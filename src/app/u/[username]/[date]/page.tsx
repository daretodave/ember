import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { formatDisplayDate, getAdjacentPublishedDates, getPublishedEntryByDate, todayUtcDate } from '@/lib/entries'
import { getProfileByUsername } from '@/lib/profile'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './page.module.css'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Props = {
  params: Promise<{ username: string; date: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username, date } = await params
  return {
    title: `ember · @${username} · ${date}`,
  }
}

export default async function PublicEntryPage({ params }: Props) {
  const { username, date } = await params

  if (!ISO_DATE_RE.test(date)) {
    notFound()
  }

  // Reject future dates
  const today = todayUtcDate()
  if (date > today) {
    notFound()
  }

  const supabase = await createClient()

  const profile = await getProfileByUsername(supabase, username)
  if (!profile || !profile.username) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [entry, adjacentDates] = await Promise.all([
    getPublishedEntryByDate(supabase, profile.user_id, date),
    getAdjacentPublishedDates(supabase, profile.user_id, date),
  ])

  if (!entry) {
    notFound()
  }

  const promptData = getPromptForDate(date)
  const displayDate = formatDisplayDate(date)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        {user ? (
          <Link href="/log" className={styles.headerLink}>
            your log
          </Link>
        ) : (
          <Link href="/signin" className={styles.headerLink}>
            sign in
          </Link>
        )}
      </header>

      <main className={styles.main}>
        <Link href={`/u/${profile.username}`} className={styles.backLink}>
          back to {profile.username}&apos;s profile
        </Link>

        <header className={styles.entryDate}>
          <span className={styles.pubMark} aria-hidden="true" />
          {displayDate} · published
        </header>

        <h1 className={styles.entryPrompt}>{promptData.prompt}</h1>
        <p className={styles.entryTask}>{promptData.task}</p>

        <div className={styles.entryResponse}>
          {entry.response.split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </main>

      <nav className={styles.entryNav} aria-label="entry navigation">
        {adjacentDates.prev ? (
          <Link
            href={`/u/${profile.username}/${adjacentDates.prev}`}
            className={styles.navPrev}
          >
            <span className={styles.navLabel}>← earlier</span>
            <span>{formatDisplayDate(adjacentDates.prev)}</span>
          </Link>
        ) : (
          <span />
        )}
        {adjacentDates.next ? (
          <Link
            href={`/u/${profile.username}/${adjacentDates.next}`}
            className={styles.navNext}
          >
            <span className={styles.navLabel}>later →</span>
            <span>{formatDisplayDate(adjacentDates.next)}</span>
          </Link>
        ) : null}
      </nav>
    </div>
  )
}
