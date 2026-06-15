import { EntryMarkdown } from '@/components/entry/EntryMarkdown'
import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { formatDisplayDate } from '@/lib/entries'
import { getProfile } from '@/lib/profile'
import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PrintButton } from './PrintButton'
import styles from './page.module.css'

export const metadata = {
  title: 'ember · your book',
  description: 'a typeset compilation of all your entries.',
  robots: { index: false, follow: false },
}

type EntryRow = {
  id: string
  date: string
  response: string
  task_done: boolean
  checkin_word: string | null
  created_at: string
}

function monthLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  const MONTHS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ]
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export default async function BookPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const [{ data }, profile] = await Promise.all([
    supabase
      .from('entries')
      .select('id, date, response, task_done, checkin_word, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: true }),
    getProfile(supabase, user.id),
  ])

  const entries = (data ?? []) as EntryRow[]
  const displayName = profile?.display_name || 'ember'

  // Group entries by month key
  const months = new Map<string, EntryRow[]>()
  for (const entry of entries) {
    const key = monthKey(entry.date)
    if (!months.has(key)) months.set(key, [])
    months.get(key)!.push(entry)
  }

  const exportDate = new Date().toISOString().slice(0, 10)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup} aria-label="ember — home">
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav} aria-label="site navigation">
          <Link href="/today">today</Link>
          <Link href="/log">log</Link>
          <Link href="/settings">settings</Link>
        </nav>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1}>
        <div className={styles.screenControls}>
          <h1 className={styles.heading}>your book</h1>
          <PrintButton />
          <p className={styles.hint}>
            prints as a typeset PDF from the browser print dialog.
          </p>
        </div>

        <div className={styles.book}>
          {/* Title page */}
          <section className={styles.titlePage} aria-label="title page">
            <div className={styles.titleGlyph}>
              <MosaicGlyph />
            </div>
            <p className={styles.titleWordmark}>ember</p>
            <p className={styles.titleName}>{displayName}</p>
            <p className={styles.titleTagline}>a record of practice</p>
            <p className={styles.titleDate}>{exportDate}</p>
          </section>

          {entries.length === 0 ? (
            <p className={styles.empty}>
              no entries yet. your book will appear here once you have written at least one entry.
            </p>
          ) : (
            Array.from(months.entries()).map(([key, monthEntries]) => (
              <section key={key} className={styles.month} aria-label={monthLabel(monthEntries[0].date)}>
                <h2 className={styles.monthHeading}>{monthLabel(monthEntries[0].date)}</h2>
                {monthEntries.map((entry) => {
                  const { prompt } = getPromptForDate(entry.date)
                  return (
                    <article key={entry.id} className={styles.entry}>
                      <header className={styles.entryHeader}>
                        <time className={styles.entryDate} dateTime={entry.date}>
                          {formatDisplayDate(entry.date)}
                        </time>
                        {entry.checkin_word && (
                          <span className={styles.checkinWord}>{entry.checkin_word}</span>
                        )}
                      </header>
                      <p className={styles.entryPrompt}>{prompt}</p>
                      {entry.response ? (
                        <EntryMarkdown content={entry.response} className={styles.entryBody} />
                      ) : (
                        <p className={styles.entryEmpty}>(no entry written)</p>
                      )}
                    </article>
                  )
                })}
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
