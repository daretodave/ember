import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { getRecentEntries, getTodayEntry, todayUtcDate, formatDisplayDate } from '@/lib/entries'
import { getSevenDayPreview } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DayStrip } from './DayStrip'
import { TodayEntry } from './TodayEntry'
import styles from './page.module.css'

export const metadata = {
  title: 'ember · today',
  description: 'ten minutes of intention before the day swallows you',
}

export default async function TodayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const date = todayUtcDate()
  const displayDate = formatDisplayDate(date)

  // today's prompt from the deterministic seed list
  const [todayPreview] = getSevenDayPreview(new Date())
  const { prompt, task } = todayPreview

  const [todayEntry, recentEntries] = await Promise.all([
    getTodayEntry(supabase, user.id, date),
    getRecentEntries(supabase, user.id, 7),
  ])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav} aria-label="site navigation">
          <a href="/today" className={styles.navCurrent} aria-current="page">today</a>
          <a href="/log">log</a>
          <a href="/settings">settings</a>
        </nav>
      </header>

      <main className={styles.main} id="main-content">
        <p className={styles.dateStamp}>{displayDate}</p>

        <h1 className={styles.prompt}>{prompt}</h1>

        <TodayEntry date={date} initialEntry={todayEntry} task={task} />
      </main>

      <DayStrip todayDate={date} entries={recentEntries} />
    </div>
  )
}
