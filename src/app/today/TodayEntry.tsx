'use client'

import { useCallback, useState } from 'react'
import type { Entry } from '@/lib/entries'
import { formatSavedTime } from '@/lib/entries'
import styles from './page.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  date: string
  task: string
  initialEntry: Entry | null
}

export function TodayEntry({ date, task, initialEntry }: Props) {
  const [response, setResponse] = useState(initialEntry?.response ?? '')
  const [taskDone, setTaskDone] = useState(initialEntry?.task_done ?? false)
  const [isPublished, setIsPublished] = useState(initialEntry?.is_published ?? false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<string | null>(initialEntry?.updated_at ?? null)
  const [errorMsg, setErrorMsg] = useState('')

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

  return (
    <>
      <div className={styles.task}>
        <button
          type="button"
          className={`${styles.taskCheck}${taskDone ? ` ${styles.done}` : ''}`}
          aria-pressed={taskDone}
          aria-label="mark task done"
          onClick={() => setTaskDone((v) => !v)}
        />
        <p className={styles.taskBody}>
          today&apos;s tiny task{' '}
          <span className={styles.taskMuted}>— {task}</span>
        </p>
      </div>

      <p className={styles.entryLabel}>your response</p>
      <textarea
        className={styles.entry}
        value={response}
        onChange={(e) => {
          setResponse(e.target.value)
          if (saveState === 'saved') setSaveState('idle')
        }}
        placeholder="take your time."
        rows={8}
      />

      <div className={styles.entryMeta}>
        <span className={styles.lastSaved}>
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
        <p className={styles.saveError}>{errorMsg}</p>
      )}
    </>
  )
}
