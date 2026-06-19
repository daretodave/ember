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
          <MosaicGlyph decorative />
          <span className={styles.wordmark}>ember</span>
        </div>
        <nav className={styles.headerNav} aria-label="site navigation">
          <Link href="/signin">sign in</Link>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <h1 id="hero-heading" className={styles.pitch}>
            ten minutes of <span className={styles.pitchAccent}>intention</span> before the day swallows you.
          </h1>
          <p className={styles.subpitch}>
            one prompt and one tiny task each morning. a few sentences in
            response, the task marked if it happened, and the day continues.
            over weeks, responses accumulate into a quiet personal log.
          </p>
        </section>

        <section className={styles.previewMark} aria-hidden="true">
          <MosaicPreview />
        </section>

        <section className={styles.seven} aria-labelledby="seven-days-heading">
          <div className={styles.sevenHead}>
            <h2 id="seven-days-heading" className={styles.sevenTitle}>the next seven days</h2>
            <p className={styles.sevenMeta}>the same prompt and tiny task arrive for everyone on a given day.</p>
          </div>

          <ul className={styles.sevenList}>
            {days.map((day) => (
              <li
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
                    <span>
                      <span className={styles.taskLabel}>tiny task</span>
                      {' — '}
                      {day.task}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.closing} aria-label="about ember">
          <p>
            ember does not personalize your morning.
          </p>
          <p>
            there are no streaks to break, no reminders to dismiss, no
            notifications to mute. a missed day leaves no mark. the log shows what
            is, not what isn&apos;t.
          </p>
        </section>
      </main>

      <footer className={styles.footerCredit} aria-label="ember">
        <span>ember</span>
        <span>a daily writing ritual.</span>
      </footer>

      <aside className={styles.cta} aria-label="sign in">
        <div className={styles.ctaInner}>
          <p className={styles.ctaCopy}>
            today&apos;s prompt is ready.{' '}
            <span>a new address creates an account. a returning address receives a sign-in link. no password. no other mail.</span>
          </p>
          <Link className={styles.ctaBtn} href="/signin" aria-label="sign in to ember">
            sign in
          </Link>
        </div>
      </aside>
    </div>
  )
}
