'use client'

import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import Link from 'next/link'
import styles from './error.module.css'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  const code = error.digest ?? 'error'

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
          <p className={styles.errorCode}>{code}</p>
          <div className={styles.actions}>
            <button className={styles.resetBtn} onClick={reset}>
              try again
            </button>
            <Link href="/" className={styles.homeLink}>
              go home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
