'use client'

import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

type State = 'idle' | 'sending' | 'sent' | 'error'

export default function SigninPage() {
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmationRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (state === 'sent') {
      confirmationRef.current?.focus()
    }
  }, [state])

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
      setErrorMsg((data as { error?: string }).error ?? 'the link could not be sent.')
      setState('error')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup} aria-label="ember — home" aria-hidden="true" tabIndex={-1}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <Link href="/" className={styles.backLink} aria-label="back to home">
          back to home
        </Link>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1}>
        <div className={styles.card}>
          <h1 className={styles.title}>sign in.</h1>
          <p className={styles.tagline}>one prompt and one tiny task each morning.</p>

          {state === 'sent' ? (
            <p
              ref={confirmationRef}
              className={styles.confirmation}
              role="status"
              tabIndex={-1}
            >
              a sign-in link is on its way. the link opens today&apos;s prompt.
              sign-in links expire after 24 hours. no password. no other mail.
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
                  autoComplete="email"
                  placeholder="email address"
                  required
                  disabled={state === 'sending'}
                />
              </div>
              <p className={styles.reassurance}>
                a sign-in link is sent to this address. it expires after 24 hours.
                no password. no other mail. a new address creates an account.
              </p>
              <button
                type="submit"
                className={styles.submit}
                disabled={state === 'sending'}
              >
                {state === 'sending' ? 'sending.' : 'send a link'}
              </button>
            </form>
          )}

          {state === 'error' && (
            <p className={styles.errorMsg} role="alert">{errorMsg}</p>
          )}
        </div>
      </main>

      <footer className={styles.footer} aria-label="ember">
        <span>ember</span>
      </footer>
    </div>
  )
}
