'use client'

import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import Link from 'next/link'
import { useRef, useState } from 'react'
import styles from './page.module.css'

type State = 'idle' | 'sending' | 'sent' | 'error'

export default function SigninPage() {
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = inputRef.current?.value.trim() ?? ''
    if (!email) return
    setState('sending')
    setErrorMsg('')

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setState('sent')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg((data as { error?: string }).error ?? 'something went wrong. try again.')
      setState('error')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <Link href="/" className={styles.backLink} aria-label="back to home">
          back to home
        </Link>
      </header>

      <main className={styles.main} id="main-content">
        <div className={styles.card}>
          <h1 className={styles.title}>sign in.</h1>

          {state === 'sent' ? (
            <p className={styles.confirmation} role="status">
              a sign-in link is on its way. the link opens today&apos;s prompt
              directly. sign-in links expire after 24 hours.{' '}
              <em>no password required.</em>
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="email">
                  email
                </label>
                <input
                  ref={inputRef}
                  className={styles.fieldInput}
                  id="email"
                  type="email"
                  placeholder="email address"
                  autoFocus
                  required
                  disabled={state === 'sending'}
                />
              </div>
              <button
                type="submit"
                className={styles.submit}
                disabled={state === 'sending'}
              >
                {state === 'sending' ? 'sending...' : 'send the link'}
              </button>
            </form>
          )}

          {state === 'error' && (
            <p className={styles.errorMsg} role="alert">{errorMsg}</p>
          )}

          {state !== 'sent' && (
            <p className={styles.reassurance}>
              a sign-in link is sent to this address. no password. no other mail.{' '}
              entering an email address for the first time creates an account.
            </p>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <span>ember</span>
        {state !== 'sent' && <span>sign-in links expire after 24 hours.</span>}
      </footer>
    </div>
  )
}
