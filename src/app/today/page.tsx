import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { getRecentEntries, getTodayEntry, getOnThisDay, todayUtcDate, formatDisplayDate } from '@/lib/entries'
import { getPersonalizedPrompt } from '@/lib/ai-prompt'
import { getProfile } from '@/lib/profile'
import { getSevenDayPreview } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DayStrip } from './DayStrip'
import { OnThisDay } from './OnThisDay'
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

  const [profile, todayEntry, recentEntries, onThisDay] = await Promise.all([
    getProfile(supabase, user.id),
    getTodayEntry(supabase, user.id, date),
    getRecentEntries(supabase, user.id, 7),
    getOnThisDay(supabase, user.id, date),
  ])

  // Resolve today's prompt: personalized (opt-in) or deterministic seed
  let prompt: string
  let task: string
  const seedPreview = getSevenDayPreview(new Date())[0]

  if (profile?.use_personalized_prompts) {
    const recentResponses = Array.from(recentEntries.values())
      .filter((e) => e.response?.trim())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => e.response)
    const personalized = await getPersonalizedPrompt(supabase, user.id, date, recentResponses)
    prompt = personalized?.prompt ?? seedPreview.prompt
    task = personalized?.task ?? seedPreview.task
  } else {
    prompt = seedPreview.prompt
    task = seedPreview.task
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav} aria-label="site navigation">
          <Link href="/today" className={styles.navCurrent} aria-current="page">today</Link>
          <Link href="/log">log</Link>
          <Link href="/settings">settings</Link>
        </nav>
      </header>

      <main className={styles.main} id="main-content">
        <p className={styles.dateStamp}>{displayDate}</p>

        <h1 className={styles.prompt}>{prompt}</h1>

        <TodayEntry date={date} initialEntry={todayEntry} task={task} />

        <OnThisDay entry={onThisDay} todayYear={new Date(date + 'T00:00:00Z').getUTCFullYear()} />
      </main>

      <DayStrip todayDate={date} entries={recentEntries} />
    </div>
  )
}
