'use client'

import { useCallback, useState } from 'react'
import type { Entry } from '@/lib/entries'
import { formatSavedTime, parseTagInput } from '@/lib/entries'
import { EntryMarkdown } from '@/components/entry/EntryMarkdown'
import styles from './page.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  date: string
  task: string
  initialEntry: Entry
  timezone?: string
}

export function EditEntry({ date, task, initialEntry, timezone }: Props) {
  // Committed display state — updated after each successful save
  const [response, setResponse] = useState(initialEntry.response)
  const [taskDone, setTaskDone] = useState(initialEntry.task_done)
  const [isPublished, setIsPublished] = useState(initialEntry.is_published)
  const [checkinWord, setCheckinWord] = useState(initialEntry.checkin_word ?? '')
  const [tags, setTags] = useState<string[]>(initialEntry.tags ?? [])
  const [savedAt, setSavedAt] = useState<string | null>(initialEntry.updated_at)

  // Edit-mode working copy
  const [isEditing, setIsEditing] = useState(false)
  const [editResponse, setEditResponse] = useState('')
  const [editTaskDone, setEditTaskDone] = useState(false)
  const [editIsPublished, setEditIsPublished] = useState(false)
  const [editCheckinWord, setEditCheckinWord] = useState('')
  const [editTagsRaw, setEditTagsRaw] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const enterEdit = useCallback(() => {
    setEditResponse(response)
    setEditTaskDone(taskDone)
    setEditIsPublished(isPublished)
    setEditCheckinWord(checkinWord)
    setEditTagsRaw(tags.join(', '))
    setSaveState('idle')
    setErrorMsg('')
    setIsEditing(true)
  }, [response, taskDone, isPublished, checkinWord, tags])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setSaveState('idle')
    setErrorMsg('')
  }, [])

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          response: editResponse,
          task_done: editTaskDone,
          is_published: editIsPublished,
          checkin_word: editCheckinWord.trim() || null,
          tags: parseTagInput(editTagsRaw),
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as Entry
        setResponse(data.response)
        setTaskDone(data.task_done)
        setIsPublished(data.is_published)
        setCheckinWord(data.checkin_word ?? '')
        setTags(data.tags ?? [])
        setSavedAt(data.updated_at)
        setSaveState('saved')
        setIsEditing(false)
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'something went wrong. save failed.')
        setSaveState('error')
      }
    } catch {
      setErrorMsg('network error. save failed.')
      setSaveState('error')
    }
  }, [date, editResponse, editTaskDone, editIsPublished, editCheckinWord])

  if (isEditing) {
    return (
      <>
        <div className={styles.task}>
          <button
            type="button"
            className={`${styles.taskCheck}${editTaskDone ? ` ${styles.done}` : ''}`}
            aria-pressed={editTaskDone}
            aria-label={editTaskDone ? "marks this entry's tiny task as not done." : "marks this entry's tiny task as done."}
            onClick={() => setEditTaskDone((v) => !v)}
          />
          <p className={styles.taskBody}>
            <span className={styles.taskMuted}>{task}</span>
          </p>
        </div>

        <div className={styles.checkinRow}>
          <label htmlFor="edit-checkin" className={styles.checkinLabel}>check-in</label>
          <input
            id="edit-checkin"
            type="text"
            className={styles.checkinInput}
            value={editCheckinWord}
            onChange={(e) => {
              setEditCheckinWord(e.target.value)
              if (saveState === 'saved') setSaveState('idle')
            }}
            placeholder="one word."
            maxLength={30}
          />
        </div>

        <div className={styles.checkinRow}>
          <label htmlFor="edit-tags" className={styles.checkinLabel}>tags</label>
          <input
            id="edit-tags"
            type="text"
            className={styles.checkinInput}
            value={editTagsRaw}
            onChange={(e) => {
              setEditTagsRaw(e.target.value)
              if (saveState === 'saved') setSaveState('idle')
            }}
            placeholder="word, word."
            maxLength={200}
          />
        </div>

        <label htmlFor="edit-entry-response" className={styles.entryLabel}>response</label>
        <textarea
          id="edit-entry-response"
          className={styles.entry}
          value={editResponse}
          onChange={(e) => {
            setEditResponse(e.target.value)
            if (saveState === 'saved') setSaveState('idle')
          }}
          placeholder="there is no rush."
          rows={8}
          // biome-ignore lint/a11y/noAutofocus: intentional — entering edit mode is an explicit user action
          autoFocus
        />

        <div className={styles.entryMeta}>
          <span className={styles.lastSaved} aria-live="polite">
            {savedAt ? formatSavedTime(savedAt, timezone) : 'unsaved'}
          </span>
          <div className={styles.entryActions}>
            <label className={styles.publishToggle}>
              <input
                type="checkbox"
                checked={editIsPublished}
                onChange={(e) => setEditIsPublished(e.target.checked)}
              />
              publish
            </label>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={cancelEdit}
            >
              cancel
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              disabled={saveState === 'saving'}
              onClick={handleSave}
            >
              {saveState === 'saving' ? 'saving.' : 'save'}
            </button>
          </div>
        </div>

        {saveState === 'error' && errorMsg && (
          <p className={styles.saveError} role="alert">{errorMsg}</p>
        )}
      </>
    )
  }

  return (
    <>
      <p className={styles.entryTask}>
        {taskDone ? (
          <span className={styles.entryTaskCheck} role="img" aria-label="task done" />
        ) : (
          <span className={styles.entryTaskUnchecked} role="img" aria-label="task not done" />
        )}
        {task}
      </p>

      {checkinWord && (
        <p className={styles.checkinAnnotation}>
          <span className={styles.checkinAnnotationMark}>—</span>{' '}
          {checkinWord}
        </p>
      )}

      {tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      {response ? (
        <EntryMarkdown content={response} className={styles.entryResponse} />
      ) : (
        <p className={styles.noEntry}>no entry body yet.</p>
      )}

      <footer className={styles.entryFoot}>
        <span>{isPublished ? 'published' : 'private'}</span>
        <button
          type="button"
          className={styles.editBtn}
          onClick={enterEdit}
        >
          edit
        </button>
      </footer>
    </>
  )
}
