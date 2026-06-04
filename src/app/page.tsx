import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { MosaicPreview } from '@/components/mosaic/MosaicPreview'
import { getSevenDayPreview } from '@/lib/prompts'
import Link from 'next/link'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  const days = getSevenDayPreview(new Date())

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </div>
        <nav className={styles.headerNav} aria-label="site navigation">
          <Link href="/signin">sign in</Link>
        </nav>
      </header>

      <main id="main-content">
        <section className={styles.hero}>
          <h1 className={styles.pitch}>
            ten minutes of <span className={styles.pitchAccent}>intention</span> before the day swallows you.
          </h1>
          <p className={styles.subpitch}>
            one small prompt and one tiny task each morning. a few sentences in
            response, the task marked if it happened, and the day continues.
            over weeks, responses accumulate into a quiet personal log.
          </p>
        </section>

        <section className={styles.previewMark}>
          <MosaicPreview />
        </section>

        <section className={styles.seven}>
          <div className={styles.sevenHead}>
            <h2 className={styles.sevenTitle}>the next seven days</h2>
            <span className={styles.sevenMeta}>one prompt and one tiny task, every morning.</span>
          </div>

          {days.map((day) => (
            <div
              key={day.date.toISOString()}
              className={`${styles.day} ${day.isToday ? styles.dayToday : ''}`}
            >
              <span className={styles.dayDate}>
                {day.label}
                <br />
                {day.shortDate}
              </span>
              <div className={styles.dayBody}>
                <p className={styles.dayPrompt}>{day.prompt}</p>
                <p className={styles.dayTask}>
                  tiny task — {day.task}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.closing}>
          <p>
            the same prompt and tiny task arrive for everyone on a given day.{' '}
            ember does not personalize your morning.
          </p>
          <p>
            there are no streaks to break, no reminders to dismiss, no
            notifications to mute. a missed day leaves no mark. the log shows what
            is, not what isn&apos;t.
          </p>
        </section>

        <div className={styles.footerCredit}>
          <span>ember</span>
          <span>a daily writing ritual.</span>
        </div>
      </main>

      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaCopy}>
            today&apos;s prompt is waiting.{' '}
            <span>a known address receives a sign-in link. a new address creates an account. no password. no other mail.</span>
          </p>
          <Link className={styles.ctaBtn} href="/signin">
            sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
