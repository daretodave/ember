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
        <Link href="/" className={styles.backLink}>
          back
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>sign in.</h1>

          {state === 'sent' ? (
            <p className={styles.confirmation}>
              check your email. a sign-in link is on its way.{' '}
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
                  placeholder="you@somewhere.com"
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
            <p className={styles.errorMsg}>{errorMsg}</p>
          )}

          {state !== 'sent' && (
            <p className={styles.reassurance}>
              we email you a sign-in link. <em>no password, no spam.</em>
            </p>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <span>ember</span>
        <span>magic-link via supabase</span>
      </footer>
    </div>
  )
}
