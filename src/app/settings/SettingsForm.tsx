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
  virgin: boolean
}

export function SettingsForm({ displayName, username, timezone, usePersonalizedPrompts, virgin }: Props) {
  const [nameVal, setNameVal] = useState(displayName)
  const [usernameVal, setUsernameVal] = useState(username)
  const [tzVal, setTzVal] = useState(timezone)
  const [personalizedVal, setPersonalizedVal] = useState(usePersonalizedPrompts)
  const [timezones, setTimezones] = useState<string[]>([])
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Track last-saved values to detect unsaved changes
  const savedSnapshotRef = useRef({ nameVal: displayName, usernameVal: username, tzVal: timezone, personalizedVal: usePersonalizedPrompts })

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

  // Suggest browser timezone on virgin profile
  useEffect(() => {
    if (virgin) {
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

  // Warn before unload when there are unsaved changes
  const isDirty =
    nameVal !== savedSnapshotRef.current.nameVal ||
    usernameVal !== savedSnapshotRef.current.usernameVal ||
    tzVal !== savedSnapshotRef.current.tzVal ||
    personalizedVal !== savedSnapshotRef.current.personalizedVal

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
        }),
      })

      if (res.ok) {
        savedSnapshotRef.current = { nameVal, usernameVal, tzVal, personalizedVal }
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
  }, [nameVal, usernameVal, tzVal, personalizedVal])

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
          shown on published entries on the public profile.
        </p>
        <input
          id="display-name"
          type="text"
          className={styles.input}
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          placeholder="how you appear on your public profile"
          maxLength={100}
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
        <label className={styles.label} htmlFor="username">
          public username
        </label>
        <p className={styles.hint}>
          a public profile will appear at /u/username. an empty field keeps the profile private.
        </p>
        <div className={styles.usernameWrap}>
          <span className={styles.usernamePrefix}>@</span>
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
          />
        </div>
        {saveState === 'error' && errorMsg && (
          <p className={styles.fieldError} role="alert">{errorMsg}</p>
        )}
      </div>

      <div className={styles.formFoot}>
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
          title="saves display name, timezone, prompt variety, and username."
        >
          {saveState === 'saving' ? 'saving.' : 'save'}
        </button>
      </div>
    </form>
  )
}
