'use client'

import styles from './page.module.css'

export function PrintButton() {
  return (
    <button
      type="button"
      className={styles.printBtn}
      onClick={() => window.print()}
    >
      print your book
    </button>
  )
}
