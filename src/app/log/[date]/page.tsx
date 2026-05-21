import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { formatDisplayDate, getEntryByDate, todayUtcDate } from '@/lib/entries'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { EditEntry } from './EditEntry'
import styles from './page.module.css'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Props = {
  params: Promise<{ date: string }>
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params
  return {
    title: `ember · log · ${date}`,
    description: `your entry for ${date}`,
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
          <Link href="/today">today</Link>
          <Link href="/log" className={styles.navCurrent} aria-current="page">log</Link>
          <Link href="/settings">settings</Link>
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

        {entry ? (
          <EditEntry date={date} task={promptData.task} initialEntry={entry} />
        ) : (
          <>
            <p className={styles.entryTask}>
              <span className={styles.entryTaskUnchecked} role="img" aria-label="task not done" />
              {promptData.task}
            </p>
            <p className={styles.noEntry}>no entry for this day.</p>
          </>
        )}
      </main>
    </div>
  )
}
