import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { formatDisplayDate, getEntryByDate, todayUtcDate } from '@/lib/entries'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import styles from './page.module.css'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Props = {
  params: Promise<{ date: string }>
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params
  return {
    title: `ember · log · ${date}`,
  }
}

export default async function LogDatePage({ params }: Props) {
  const { date } = await params

  if (!ISO_DATE_RE.test(date)) {
    notFound()
  }

  // Reject future dates
  const today = todayUtcDate()
  if (date > today) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const [entry, promptData] = await Promise.all([
    getEntryByDate(supabase, user.id, date),
    Promise.resolve(getPromptForDate(date)),
  ])

  const displayDate = formatDisplayDate(date)
  const isToday = date === today

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav} aria-label="site navigation">
          <a href="/today">today</a>
          <a href="/log" className={styles.navCurrent} aria-current="page">log</a>
          <a href="/settings">settings</a>
        </nav>
      </header>

      <main className={styles.main} id="main-content">
        <Link href="/log" className={styles.backLink}>
          back to log
        </Link>

        <p className={styles.entryDate}>
          {displayDate}
          {isToday && ' · today'}
        </p>

        <h1 className={styles.entryPrompt}>{promptData.prompt}</h1>

        <p className={styles.entryTask}>
          {entry?.task_done ? (
            <span className={styles.entryTaskCheck} />
          ) : (
            <span className={styles.entryTaskUnchecked} />
          )}
          {promptData.task}
        </p>

        {entry?.response ? (
          <div className={styles.entryResponse}>
            {entry.response.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className={styles.noEntry}>no entry for this day.</p>
        )}
      </main>

      {entry && (
        <footer className={styles.entryFoot}>
          <span>{displayDate}</span>
          <span>{entry.is_published ? 'published' : 'private'}</span>
        </footer>
      )}
    </div>
  )
}
