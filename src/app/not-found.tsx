import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
      </header>

      <main className={styles.main} id="main-content">
        <div className={styles.card}>
          <p className={styles.errorCode}>404</p>
          <Link href="/" className={styles.tryAgain}>
            try again
          </Link>
        </div>
      </main>
    </div>
  )
}
