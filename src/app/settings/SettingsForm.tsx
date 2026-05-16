'use client'

import { useCallback, useEffect, useState } from 'react'
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
  }, [nameVal, usernameVal, tzVal])

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
        <select
          id="timezone"
          className={styles.select}
          value={tzVal}
          onChange={(e) => setTzVal(e.target.value)}
        >
          {/* Always include the current value even if timezones list hasn't loaded */}
          {timezones.length === 0 ? (
            <option value={tzVal}>{tzVal}</option>
          ) : (
            timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))
          )}
        </select>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>prompt variety</span>
        <p className={styles.hint}>
          standard: same curated prompt for everyone each day. personalized: a unique prompt generated for you by Claude, informed by your recent entries.
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
          your public profile lives at ember-rust-sigma.vercel.app/u/username. leave blank to stay private.
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
            placeholder="your-handle"
            maxLength={30}
          />
        </div>
        {saveState === 'error' && errorMsg && (
          <p className={styles.fieldError}>{errorMsg}</p>
        )}
      </div>

      <div className={styles.formFoot}>
        <span className={`${styles.saveStatus} ${saveState === 'saved' ? styles.saveStatusVisible : ''}`}>
          saved.
        </span>
        {saveState === 'error' && !errorMsg.includes('username') && (
          <span className={styles.saveError}>{errorMsg}</span>
        )}
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saveState === 'saving'}
        >
          {saveState === 'saving' ? 'saving...' : 'save'}
        </button>
      </div>
    </form>
  )
}
