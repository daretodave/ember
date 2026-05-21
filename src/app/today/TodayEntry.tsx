'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Entry } from '@/lib/entries'
import { formatSavedTime } from '@/lib/entries'
import styles from './page.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  date: string
  task: string
  prompt: string
  initialEntry: Entry | null
}

export function TodayEntry({ date, task, prompt, initialEntry }: Props) {
  const [response, setResponse] = useState(initialEntry?.response ?? '')
  const [taskDone, setTaskDone] = useState(initialEntry?.task_done ?? false)
  const [isPublished, setIsPublished] = useState(initialEntry?.is_published ?? false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<string | null>(initialEntry?.updated_at ?? null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isFocus, setIsFocus] = useState(false)

  const focusTriggerRef = useRef<HTMLButtonElement>(null)
  const focusTextareaRef = useRef<HTMLTextAreaElement>(null)

  const enterFocus = useCallback(() => setIsFocus(true), [])
  const exitFocus = useCallback(() => setIsFocus(false), [])

  useEffect(() => {
    if (isFocus) {
      focusTextareaRef.current?.focus()
    } else {
      const t = setTimeout(() => focusTriggerRef.current?.focus(), 200)
      return () => clearTimeout(t)
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
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'something went wrong. try again.')
        setSaveState('error')
      }
    } catch {
      setErrorMsg('network error. try again.')
      setSaveState('error')
    }
  }, [date, response, taskDone, isPublished])

  const handleResponseChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value)
    if (saveState === 'saved') setSaveState('idle')
  }, [saveState])

  return (
    <>
      <div className={styles.task}>
        <button
          type="button"
          className={`${styles.taskCheck}${taskDone ? ` ${styles.done}` : ''}`}
          aria-pressed={taskDone}
          aria-label={taskDone ? 'mark task not done' : 'mark task done'}
          onClick={() => setTaskDone((v) => !v)}
        />
        <p className={styles.taskBody}>
          today&apos;s tiny task{' '}
          <span className={styles.taskMuted}>— {task}</span>
        </p>
      </div>

      <label htmlFor="today-entry-response" className={styles.entryLabel}>your response</label>
      <textarea
        id="today-entry-response"
        className={styles.entry}
        value={response}
        onChange={handleResponseChange}
        placeholder="take your time."
        rows={8}
      />

      <div className={styles.entryMeta}>
        <span className={styles.lastSaved} aria-live="polite">
          {savedAt ? formatSavedTime(savedAt) : 'not yet saved'}
        </span>
        <div className={styles.entryActions}>
          <label className={styles.publishToggle}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            publish
          </label>
          <button
            ref={focusTriggerRef}
            type="button"
            className={styles.focusTrigger}
            aria-label="enter focus mode"
            onClick={enterFocus}
          >
            focus
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            disabled={saveState === 'saving'}
            onClick={handleSave}
          >
            {saveState === 'saving' ? 'saving...' : 'save'}
          </button>
        </div>
      </div>

      {saveState === 'error' && errorMsg && (
        <p className={styles.saveError} role="alert">{errorMsg}</p>
      )}

      {/* Focus mode overlay — always in DOM so opacity transition plays on close */}
      <div
        role="dialog"
        aria-modal={isFocus}
        aria-labelledby="focus-mode-heading"
        aria-hidden={!isFocus}
        className={`${styles.focusOverlay}${isFocus ? ` ${styles.focusOverlayActive}` : ''}`}
      >
        <div className={styles.focusContent}>
          <p id="focus-mode-heading" className={styles.focusPrompt}>{prompt}</p>

          <label htmlFor="focus-entry-response" className={styles.entryLabel}>your response</label>
          <textarea
            id="focus-entry-response"
            ref={focusTextareaRef}
            className={styles.entry}
            value={response}
            onChange={handleResponseChange}
            placeholder="take your time."
            rows={8}
            tabIndex={isFocus ? 0 : -1}
          />

          <div className={styles.entryMeta}>
            <span className={styles.lastSaved} aria-live="polite">
              {savedAt ? formatSavedTime(savedAt) : 'not yet saved'}
            </span>
            <div className={styles.entryActions}>
              <label className={styles.publishToggle}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  tabIndex={isFocus ? 0 : -1}
                />
                publish
              </label>
              <button
                type="button"
                className={styles.saveBtn}
                disabled={saveState === 'saving'}
                onClick={handleSave}
                tabIndex={isFocus ? 0 : -1}
              >
                {saveState === 'saving' ? 'saving...' : 'save'}
              </button>
            </div>
          </div>

          {saveState === 'error' && errorMsg && (
            <p className={styles.saveError} role="alert">{errorMsg}</p>
          )}

          <div className={styles.focusDoneRow}>
            <button
              type="button"
              className={styles.focusDone}
              aria-label="exit focus mode"
              onClick={exitFocus}
              tabIndex={isFocus ? 0 : -1}
            >
              done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
