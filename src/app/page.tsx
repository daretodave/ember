import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { MosaicPreview } from '@/components/mosaic/MosaicPreview'
import { getSevenDayPreview } from '@/lib/prompts'
import styles from './page.module.css'

export default function LandingPage() {
  const days = getSevenDayPreview(new Date())

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </div>
        <nav className={styles.headerNav}>
          <a href="/signin">sign in</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.pitch}>
          ten minutes of <em>intention</em> before the day swallows you.
        </h1>
        <p className={styles.subpitch}>
          one small prompt and one tiny task each morning. you write a few
          sentences in response, mark the task done if you did it, and move on.
          over weeks, your responses accumulate into a quiet personal log.
        </p>
      </section>

      <section className={styles.previewMark}>
        <span className={styles.previewMarkLabel}>
          the brand is the practice rendered
        </span>
        <MosaicPreview />
      </section>

      <section className={styles.seven}>
        <div className={styles.sevenHead}>
          <h2 className={styles.sevenTitle}>the next seven days.</h2>
          <span className={styles.sevenMeta}>read-only preview</span>
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
                {day.isToday ? "today's tiny task" : 'tiny task'} — {day.task}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.closing}>
        <p>
          the same prompt and task arrive for everyone on a given day.
          that&apos;s deliberate.{' '}
          <em>ember does not personalize your morning.</em>
        </p>
        <p>
          there are no streaks to break, no reminders to dismiss, no
          notifications to mute. forgetting a day is fine. the mosaic shows what
          is, not what isn&apos;t.
        </p>
      </section>

      <div className={styles.footerCredit}>
        <span>ember · v1</span>
        <span>made for adults who want a low-friction ritual.</span>
      </div>

      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaCopy}>
            a sign-in link is the only thing you&apos;ll receive.{' '}
            <span>no password, no spam.</span>
          </p>
          <a className={styles.ctaBtn} href="/signin">
            sign in to start
          </a>
        </div>
      </div>
    </div>
  )
}
