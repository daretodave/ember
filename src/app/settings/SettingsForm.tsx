'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TimezoneCombobox } from '@/components/timezone/TimezoneCombobox'
import styles from './page.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  displayName: string
  username: string
  timezone: string
  usePersonalizedPrompts: boolean
  reminderOptIn: boolean
  reminderHour: number
  weeklyReflectionOptIn: boolean
  virgin: boolean
}

function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

export function SettingsForm({
  displayName,
  username,
  timezone,
  usePersonalizedPrompts,
  reminderOptIn,
  reminderHour,
  weeklyReflectionOptIn,
  virgin,
}: Props) {
  const [nameVal, setNameVal] = useState(displayName)
  const [usernameVal, setUsernameVal] = useState(username)
  const [tzVal, setTzVal] = useState(timezone)
  const [personalizedVal, setPersonalizedVal] = useState(usePersonalizedPrompts)
  const [reminderOptInVal, setReminderOptInVal] = useState(reminderOptIn)
  const [reminderHourVal, setReminderHourVal] = useState(reminderHour)
  const [weeklyReflectionVal, setWeeklyReflectionVal] = useState(weeklyReflectionOptIn)
  const [timezones, setTimezones] = useState<string[]>([])
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const savedSnapshotRef = useRef({
    nameVal: displayName,
    usernameVal: username,
    tzVal: timezone,
    personalizedVal: usePersonalizedPrompts,
    reminderOptInVal: reminderOptIn,
    reminderHourVal: reminderHour,
    weeklyReflectionVal: weeklyReflectionOptIn,
  })

  // Populate timezone list from browser
  useEffect(() => {
    try {
      const zones = (Intl as { supportedValuesOf?: (key: string) => string[] })
        .supportedValuesOf?.('timeZone') ?? []
      setTimezones(zones)
    } catch {
      setTimezones([])
    }
  }, [])

  // Suggest browser timezone on virgin profile or when no timezone is saved
  useEffect(() => {
    if (virgin || !tzVal) {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (detected) setTzVal(detected)
      } catch {
        // leave as UTC
      }
    }
  }, [virgin])

  // Fade "saved." back to nothing after 3 s
  useEffect(() => {
    if (saveState !== 'saved') return
    const t = setTimeout(() => setSaveState('idle'), 3000)
    return () => clearTimeout(t)
  }, [saveState])

  const isDirty =
    nameVal !== savedSnapshotRef.current.nameVal ||
    usernameVal !== savedSnapshotRef.current.usernameVal ||
    tzVal !== savedSnapshotRef.current.tzVal ||
    personalizedVal !== savedSnapshotRef.current.personalizedVal ||
    reminderOptInVal !== savedSnapshotRef.current.reminderOptInVal ||
    reminderHourVal !== savedSnapshotRef.current.reminderHourVal ||
    weeklyReflectionVal !== savedSnapshotRef.current.weeklyReflectionVal

  useEffect(() => {
    if (!isDirty || saveState === 'saving') {
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
  }, [isDirty, saveState])

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: nameVal,
          username: usernameVal,
          timezone: tzVal,
          use_personalized_prompts: personalizedVal,
          reminder_opt_in: reminderOptInVal,
          reminder_hour: reminderHourVal,
          weekly_reflection_opt_in: weeklyReflectionVal,
        }),
      })

      if (res.ok) {
        savedSnapshotRef.current = {
          nameVal,
          usernameVal,
          tzVal,
          personalizedVal,
          reminderOptInVal,
          reminderHourVal,
          weeklyReflectionVal,
        }
        setSaveState('saved')
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'something went wrong. save failed.')
        setSaveState('error')
      }
    } catch {
      setErrorMsg('network error. save failed.')
      setSaveState('error')
    }
  }, [nameVal, usernameVal, tzVal, personalizedVal, reminderOptInVal, reminderHourVal, weeklyReflectionVal])

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="display-name">
          display name
        </label>
        <p className={styles.hint}>
          shown on entries when they appear on a public profile. any name or alias works — a first name, initials, or a pen name.
        </p>
        <input
          id="display-name"
          type="text"
          className={styles.input}
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          placeholder="name"
          maxLength={100}
          autoComplete="name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="timezone">
          timezone
        </label>
        <p className={styles.hint}>
          used to determine the current day for prompt delivery and entry dating.
        </p>
        <TimezoneCombobox
          id="timezone"
          value={tzVal}
          timezones={timezones}
          onChange={setTzVal}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>prompt variety</span>
        <p className={styles.hint}>
          <span id="desc-standard">standard: same prompt for everyone each day.</span>{' '}
          <span id="desc-personalized">personalized: a unique prompt generated from recent entries. falls back to a standard prompt until entries exist.</span>
        </p>
        <div className={styles.radioGroup} role="radiogroup" aria-label="prompt variety">
          <label className={`${styles.radioOption} ${!personalizedVal ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              name="variety"
              value="standard"
              checked={!personalizedVal}
              onChange={() => setPersonalizedVal(false)}
              className={styles.radioInput}
              aria-describedby="desc-standard"
            />
            standard
          </label>
          <label className={`${styles.radioOption} ${personalizedVal ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              name="variety"
              value="personalized"
              checked={personalizedVal}
              onChange={() => setPersonalizedVal(true)}
              className={styles.radioInput}
              aria-describedby="desc-personalized"
            />
            personalized
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>daily reminder</span>
        <p className={styles.hint} id="desc-reminder-off">
          a quiet email at your chosen time to write today's entry. never sent if you have already written.
        </p>
        <div className={styles.radioGroup} role="radiogroup" aria-label="daily reminder">
          <label className={`${styles.radioOption} ${!reminderOptInVal ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              name="reminder"
              value="off"
              checked={!reminderOptInVal}
              onChange={() => setReminderOptInVal(false)}
              className={styles.radioInput}
              aria-describedby="desc-reminder-off"
            />
            off
          </label>
          <label className={`${styles.radioOption} ${reminderOptInVal ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              name="reminder"
              value="on"
              checked={reminderOptInVal}
              onChange={() => setReminderOptInVal(true)}
              className={styles.radioInput}
              aria-describedby="desc-reminder-off"
            />
            on
          </label>
        </div>
      </div>

      {reminderOptInVal && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reminder-hour">
            send at
          </label>
          <select
            id="reminder-hour"
            className={styles.select}
            value={reminderHourVal}
            onChange={(e) => setReminderHourVal(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {formatHour(h)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <span className={styles.label}>weekly reflection</span>
        <p className={styles.hint} id="desc-reflection-off">
          a short paragraph written by ember from your week's entries, visible on your log. generated once per week; never shown if you wrote fewer than three entries.
        </p>
        <div className={styles.radioGroup} role="radiogroup" aria-label="weekly reflection">
          <label className={`${styles.radioOption} ${!weeklyReflectionVal ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              name="weekly-reflection"
              value="off"
              checked={!weeklyReflectionVal}
              onChange={() => setWeeklyReflectionVal(false)}
              className={styles.radioInput}
              aria-describedby="desc-reflection-off"
            />
            off
          </label>
          <label className={`${styles.radioOption} ${weeklyReflectionVal ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              name="weekly-reflection"
              value="on"
              checked={weeklyReflectionVal}
              onChange={() => setWeeklyReflectionVal(true)}
              className={styles.radioInput}
              aria-describedby="desc-reflection-off"
            />
            on
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="username">
          public username
        </label>
        <p className={styles.hint}>
          a public profile will appear at /u/username. an empty field keeps the profile private.
        </p>
        <div className={styles.usernameWrap}>
          <span className={styles.usernamePrefix}>/u/</span>
          <input
            id="username"
            type="text"
            className={`${styles.input} ${styles.usernameInput}`}
            value={usernameVal}
            onChange={(e) => {
              setUsernameVal(e.target.value.toLowerCase())
              if (saveState === 'error') setSaveState('idle')
            }}
            placeholder="username"
            maxLength={30}
            autoComplete="username"
          />
        </div>
        {saveState === 'error' && errorMsg && (
          <p className={styles.fieldError} role="alert">{errorMsg}</p>
        )}
      </div>

      <div className={styles.formFoot} role="group" aria-label="account actions">
        <span aria-live="polite" className={`${styles.saveStatus} ${saveState === 'saved' ? styles.saveStatusVisible : ''}`}>
          {saveState === 'saving' ? 'saving.' : saveState === 'saved' ? 'saved.' : ''}
        </span>
        {saveState === 'error' && !errorMsg.includes('username') && (
          <span role="alert" className={styles.saveError}>{errorMsg}</span>
        )}
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saveState === 'saving'}
          title="saves display name, timezone, prompt variety, daily reminder, and public username."
        >
          {saveState === 'saving' ? 'saving.' : 'save'}
        </button>
      </div>
    </form>
  )
}
