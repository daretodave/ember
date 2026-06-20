'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './page.module.css'

export function DeleteAccountSection() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'something went wrong. deletion failed.')
        setDeleting(false)
      }
    } catch {
      setErrorMsg('network error. deletion failed.')
      setDeleting(false)
    }
  }

  return (
    <div className={styles.deleteSection}>
      {!open ? (
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => setOpen(true)}
        >
          delete my account and all my entries
        </button>
      ) : (
        <div className={styles.deleteConfirm} role="alertdialog" aria-modal="true" aria-label="confirm account deletion" aria-describedby="delete-warning">
          <p id="delete-warning" className={styles.deleteWarning}>
            this will permanently delete the account and all entries. there is no undo.
          </p>
          {errorMsg && (
            <p className={styles.deleteError} role="alert">{errorMsg}</p>
          )}
          <div className={styles.deleteActions}>
            <button
              type="button"
              className={styles.deleteCancelBtn}
              onClick={() => { setOpen(false); setErrorMsg('') }}
              disabled={deleting}
            >
              cancel
            </button>
            <button
              type="button"
              className={styles.deleteConfirmBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'deleting.' : 'delete account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
