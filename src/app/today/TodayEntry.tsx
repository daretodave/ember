'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Entry } from '@/lib/entries'
import { formatSavedTime } from '@/lib/entries'
import { clearDraft, getDraft, saveDraft } from '@/lib/draft-store'
import styles from './page.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'draft'

type Props = {
  date: string
  task: string
  prompt: string
  initialEntry: Entry | null
  hasUsername?: boolean
}

export function TodayEntry({ date, task, prompt, initialEntry, hasUsername = true }: Props) {
  const [response, setResponse] = useState(initialEntry?.response ?? '')
  const [taskDone, setTaskDone] = useState(initialEntry?.task_done ?? false)
  const [isPublished, setIsPublished] = useState(initialEntry?.is_published ?? false)
  const [saveState, setSaveState] = useState<SaveState>(initialEntry !== null ? 'saved' : 'idle')
  const [savedAt, setSavedAt] = useState<string | null>(initialEntry?.updated_at ?? null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isFocus, setIsFocus] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const focusTriggerRef = useRef<HTMLButtonElement>(null)
  const focusTextareaRef = useRef<HTMLTextAreaElement>(null)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enterFocus = useCallback(() => setIsFocus(true), [])
  const exitFocus = useCallback(() => setIsFocus(false), [])

  // Seed navigator.onLine once on mount (avoids SSR mismatch)
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Load draft from IndexedDB when there is no server-confirmed entry
  useEffect(() => {
    if (initialEntry !== null) return
    getDraft(date).then((draft) => {
      if (draft) {
        setResponse(draft.response)
        setTaskDone(draft.taskDone)
        setSaveState('draft')
      }
    })
  }, [date, initialEntry])

  useEffect(() => {
    if (isFocus) {
      focusTextareaRef.current?.focus()
    } else {
      const t = setTimeout(() => focusTriggerRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [isFocus])

  // Suppress all focusable elements outside the overlay when focus mode is active.
  // `inert` is the correct primitive: it removes descendants from tab order, pointer
  // events, and the AT tree — no browser implements aria-modal to do this physically.
  useEffect(() => {
    const header = document.getElementById('page-header')
    const strip = document.getElementById('day-strip')
    if (isFocus) {
      header?.setAttribute('inert', '')
      strip?.setAttribute('inert', '')
    } else {
      header?.removeAttribute('inert')
      strip?.removeAttribute('inert')
    }
  }, [isFocus])

  useEffect(() => {
    if (!isFocus) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitFocus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFocus, exitFocus])

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, response, task_done: taskDone, is_published: isPublished }),
      })

      if (res.ok) {
        const data = (await res.json()) as Entry
        setSavedAt(data.updated_at)
        setSaveState('saved')
        clearDraft(date)
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'something went wrong. save failed.')
        setSaveState('error')
      }
    } catch {
      setErrorMsg('network error. save failed.')
      setSaveState('error')
    }
  }, [date, response, taskDone, isPublished])

  // Auto-retry save on reconnect if there is unsaved content
  useEffect(() => {
    if (!isOnline) return
    if (response && saveState !== 'saved') {
      handleSave()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  // Warn before unload when there is unsaved server-side content
  useEffect(() => {
    const hasUnsaved = (saveState === 'idle' || saveState === 'error') && response !== ''
    if (!hasUnsaved) {
      window.onbeforeunload = null
      return
    }
    window.onbeforeunload = (e) => {
      e.preventDefault()
      return ''
    }
    return () => {
      window.onbeforeunload = null
    }
  }, [saveState, response])

  const handleResponseChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setResponse(value)
    if (saveState === 'saved') setSaveState('idle')

    // Debounce-save to IndexedDB
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      saveDraft(date, { response: value, taskDone })
    }, 500)
  }, [date, saveState, taskDone])

  function saveIndicatorText() {
    if (saveState === 'saving') return 'saving.'
    if (!isOnline && saveState !== 'saved') return 'saved locally. will sync when online.'
    if (saveState === 'saved' && savedAt) return formatSavedTime(savedAt)
    if (saveState === 'draft') return 'draft restored.'
    if (saveState === 'idle' && response === '') return ''
    return 'not yet saved.'
  }

  return (
    <>
      {/* Suppress outer live regions and error alert from AT tree while focus overlay is open */}
      <div aria-hidden={isFocus || undefined}>
        <div className={styles.task}>
          <button
            type="button"
            className={`${styles.taskCheck}${taskDone ? ` ${styles.done}` : ''}`}
            aria-pressed={taskDone}
            aria-label={taskDone ? "marks today's tiny task as not done." : "marks today's tiny task as done."}
            title={taskDone ? "marks today's tiny task as not done." : "marks today's tiny task as done."}
            tabIndex={isFocus ? -1 : undefined}
            onClick={() => setTaskDone((v) => !v)}
          />
          <p className={styles.taskBody}>
            <span className={styles.taskLabel}>tiny task</span>{' '}
            <span className={styles.taskMuted}>— {task}</span>
          </p>
        </div>

        <label htmlFor="today-entry-response" className={styles.entryLabel}>response</label>
        <textarea
          id="today-entry-response"
          className={styles.entry}
          value={response}
          onChange={handleResponseChange}
          placeholder="there is no rush."
          rows={8}
          tabIndex={isFocus ? -1 : undefined}
        />

        <div className={styles.entryMeta}>
          <span className={styles.lastSaved} aria-live="polite">
            {saveIndicatorText()}
          </span>
          <div className={styles.entryActions}>
            <label className={styles.publishToggle}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                tabIndex={isFocus ? -1 : undefined}
                aria-describedby="publish-desc"
              />
              publish
            </label>
            <button
              ref={focusTriggerRef}
              type="button"
              className={styles.focusTrigger}
              aria-label="enters a distraction-free writing view."
              title="enters a distraction-free writing view."
              tabIndex={isFocus ? -1 : undefined}
              onClick={enterFocus}
            >
              focus
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              disabled={saveState === 'saving'}
              onClick={handleSave}
              tabIndex={isFocus ? -1 : undefined}
              title="saves the current entry."
            >
              {saveState === 'saving' ? 'saving.' : 'save'}
            </button>
          </div>
        </div>

        <p id="publish-desc" className={styles.publishHint}>when published, this entry appears on the public profile.</p>

        {!hasUsername && (
          <p className={styles.publishHint}>
            no public username is set. published entries will remain private until a username is added in{' '}
            <Link href="/settings" tabIndex={isFocus ? -1 : undefined}>settings</Link>.
          </p>
        )}

        {saveState === 'error' && errorMsg && (
          <p className={styles.saveError} role="alert">{errorMsg}</p>
        )}
      </div>

      {/* Focus mode overlay — always in DOM so opacity transition plays on close */}
      <div
        role="dialog"
        aria-modal={isFocus || undefined}
        aria-label="focus mode"
        aria-hidden={!isFocus || undefined}
        className={`${styles.focusOverlay}${isFocus ? ` ${styles.focusOverlayActive}` : ''}`}
      >
        <div className={styles.focusContent}>
          <p className={styles.focusPrompt}>{prompt}</p>

          <label htmlFor="focus-entry-response" className={styles.entryLabel}>response</label>
          <textarea
            id="focus-entry-response"
            ref={focusTextareaRef}
            className={styles.entry}
            value={response}
            onChange={handleResponseChange}
            placeholder="there is no rush."
            rows={8}
            tabIndex={isFocus ? 0 : -1}
          />

          <div className={styles.entryMeta}>
            <span className={styles.lastSaved} aria-live="polite">
              {saveIndicatorText()}
            </span>
            <div className={styles.entryActions}>
              <label className={styles.publishToggle}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  tabIndex={isFocus ? 0 : -1}
                  aria-describedby="publish-desc-focus"
                />
                publish
              </label>
              <button
                type="button"
                className={styles.saveBtn}
                disabled={saveState === 'saving'}
                onClick={handleSave}
                tabIndex={isFocus ? 0 : -1}
                title="saves the current entry."
              >
                {saveState === 'saving' ? 'saving.' : 'save'}
              </button>
            </div>
          </div>

          <p id="publish-desc-focus" className={styles.publishHint}>when published, this entry appears on the public profile.</p>

          {!hasUsername && (
            <p className={styles.publishHint}>
              no public username is set. published entries will remain private until a username is added in{' '}
              <Link href="/settings" tabIndex={isFocus ? 0 : -1}>settings</Link>.
            </p>
          )}

          {saveState === 'error' && errorMsg && (
            <p className={styles.saveError} role="alert">{errorMsg}</p>
          )}

          <div className={styles.focusDoneRow}>
            <button
              type="button"
              className={styles.focusDone}
              aria-label="exits the distraction-free writing view."
              title="exits the distraction-free writing view."
              onClick={exitFocus}
              tabIndex={isFocus ? 0 : -1}
            >
              done writing
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
