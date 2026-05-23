'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import styles from './TimezoneCombobox.module.css'

type Props = {
  id: string
  value: string
  timezones: string[]
  onChange: (tz: string) => void
}

function groupTimezones(timezones: string[]): [string, string[]][] {
  const groups = new Map<string, string[]>()
  for (const tz of timezones) {
    const slash = tz.indexOf('/')
    const region = slash === -1 ? 'Other' : tz.slice(0, slash)
    const list = groups.get(region) ?? []
    list.push(tz)
    groups.set(region, list)
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}

function filterTimezones(timezones: string[], query: string): string[] {
  const q = query.toLowerCase()
  return timezones.filter((tz) => tz.toLowerCase().includes(q))
}

export function TimezoneCombobox({ id, value, timezones, onChange }: Props) {
  const uid = useId()
  const listboxId = `${uid}-listbox`

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const groupedOptions = useMemo(() => groupTimezones(timezones), [timezones])

  // Flat list in visual order — must match the rendered order for keyboard nav
  const flatOptions = useMemo<string[]>(() => {
    if (query) return filterTimezones(timezones, query)
    // Flatten grouped view so arrow-key indices match visual positions
    return groupedOptions.flatMap(([, zones]) => zones)
  }, [timezones, query, groupedOptions])

  const optionId = useCallback(
    (index: number) => `${uid}-opt-${index}`,
    [uid],
  )

  const openList = useCallback(() => {
    setOpen(true)
    const idx = flatOptions.indexOf(value)
    setActiveIndex(idx >= 0 ? idx : 0)
  }, [flatOptions, value])

  const closeList = useCallback(
    (revert?: boolean) => {
      setOpen(false)
      setQuery('')
      if (revert && inputRef.current) {
        inputRef.current.value = value
      }
    },
    [value],
  )

  const selectOption = useCallback(
    (tz: string) => {
      onChange(tz)
      setOpen(false)
      setQuery('')
      if (inputRef.current) inputRef.current.value = tz
      inputRef.current?.focus()
    },
    [onChange],
  )

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || activeIndex === null) return
    const el = listRef.current?.querySelector<HTMLElement>(
      `[id="${optionId(activeIndex)}"]`,
    )
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open, optionId])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        closeList(true)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closeList])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openList()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === null ? 0 : Math.min(prev + 1, flatOptions.length - 1),
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === null ? flatOptions.length - 1 : Math.max(prev - 1, 0),
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex !== null && flatOptions[activeIndex]) {
        selectOption(flatOptions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeList(true)
    } else if (e.key === 'Tab') {
      closeList(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!open) setOpen(true)
    setActiveIndex(0)
  }

  const handleFocus = () => {
    if (!open) {
      inputRef.current?.select()
      openList()
    }
  }

  const activeDescendant =
    open && activeIndex !== null ? optionId(activeIndex) : undefined

  const renderGrouped = () =>
    groupedOptions.map(([region, zones]) => {
      const groupStart = flatOptions.indexOf(zones[0])
      return (
        <li key={region} role="presentation">
          <ul role="group" aria-label={region} className={styles.group}>
            <li className={styles.groupLabel} aria-hidden="true">
              {region}
            </li>
            {zones.map((tz, j) => {
              const i = groupStart + j
              return (
                <li
                  key={tz}
                  id={optionId(i)}
                  role="option"
                  aria-selected={tz === value}
                  className={[
                    styles.option,
                    i === activeIndex ? styles.optionActive : '',
                    tz === value ? styles.optionSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectOption(tz)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {tz}
                </li>
              )
            })}
          </ul>
        </li>
      )
    })

  const renderFiltered = () => {
    if (flatOptions.length === 0) {
      return (
        <li className={styles.noResults} role="option" aria-selected={false}>
          no matches
        </li>
      )
    }
    return flatOptions.map((tz, i) => (
      <li
        key={tz}
        id={optionId(i)}
        role="option"
        aria-selected={tz === value}
        className={[
          styles.option,
          i === activeIndex ? styles.optionActive : '',
          tz === value ? styles.optionSelected : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={(e) => {
          e.preventDefault()
          selectOption(tz)
        }}
        onMouseEnter={() => setActiveIndex(i)}
      >
        {tz}
      </li>
    ))
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        className={styles.input}
        defaultValue={value}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        autoComplete="off"
        spellCheck={false}
      />
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="timezone"
          className={styles.listbox}
        >
          {query ? renderFiltered() : renderGrouped()}
        </ul>
      )}
    </div>
  )
}
