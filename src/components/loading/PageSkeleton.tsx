import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import styles from './page-skeleton.module.css'

export function PageSkeleton() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </a>
        <nav className={styles.nav} aria-label="site navigation">
          <a href="/today">today</a>
          <a href="/log">log</a>
          <a href="/settings">settings</a>
        </nav>
      </header>
      <main className={styles.main} id="main-content" aria-busy="true">
        <div className={`${styles.placeholder} ${styles.placeholderNarrow}`} />
        <div className={`${styles.placeholder} ${styles.placeholderWide}`} />
        <div className={`${styles.placeholder} ${styles.placeholderMedium}`} />
      </main>
    </div>
  )
}
