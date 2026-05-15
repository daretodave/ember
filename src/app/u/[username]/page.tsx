import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { formatDisplayDate, getAdjacentPublishedDates, getPublishedEntriesForUser, offsetDate } from '@/lib/entries'
import { getProfileByUsername } from '@/lib/profile'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProfileMosaic } from './ProfileMosaic'
import styles from './page.module.css'

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return {
    title: `ember · @${username}`,
    description: `${username}'s published practice log on ember`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const profile = await getProfileByUsername(supabase, username)
  if (!profile || !profile.username) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publishedEntries = await getPublishedEntriesForUser(supabase, profile.user_id)

  // Build 60-day mosaic oldest-first; only published tiles are filled
  const tiles = Array.from({ length: 60 }, (_, i) => {
    const date = offsetDate(i - 59)
    const entry = publishedEntries.get(date)
    return {
      date,
      published: !!entry,
      displayDate: formatDisplayDate(date),
    }
  })

  // Most recent published entry (newest first)
  const sortedDates = [...publishedEntries.keys()].sort().reverse()
  const recentDate = sortedDates[0] ?? null
  const recentEntry = recentDate ? publishedEntries.get(recentDate) ?? null : null
  const recentPrompt = recentDate ? getPromptForDate(recentDate) : null

  const adjacentDates = recentDate
    ? await getAdjacentPublishedDates(supabase, profile.user_id, recentDate)
    : { prev: null, next: null }

  const displayName = profile.display_name ?? `@${profile.username}`

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

      <main id="main-content">
        <section className={styles.identity}>
          <h1 className={styles.identityName}>{displayName}</h1>
          <p className={styles.identityHandle}>@{profile.username}</p>
        </section>

        <section className={styles.mosaicWrap}>
          <p className={styles.mosaicMeta}>published in the last sixty days</p>
          <ProfileMosaic tiles={tiles} username={profile.username} />
        </section>

        <p className={styles.privacyNote}>
          empty days are private. they may be unwritten or they may be written and unshared —
          there is no way to tell from here, and that is intentional.
        </p>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
        </div>

        {recentEntry && recentPrompt && recentDate ? (
          <>
            <article className={styles.entryView}>
              <header className={styles.entryDate}>
                <span className={styles.pubMark} aria-hidden="true" />
                {formatDisplayDate(recentDate)} · published
              </header>
              <h2 className={styles.entryPrompt}>{recentPrompt.prompt}</h2>
              <p className={styles.entryTask}>{recentPrompt.task}</p>
              <div className={styles.entryResponse}>
                {recentEntry.response.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </article>

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
          </>
        ) : (
          <p className={styles.emptyState}>no published entries.</p>
        )}
      </main>
    </div>
  )
}
