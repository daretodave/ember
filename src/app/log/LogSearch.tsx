'use client'

import { formatDisplayDate } from '@/lib/entries'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './log-search.module.css'

type SearchResult = {
  date: string
  excerpt: string
}

type SearchResponse = {
  results: SearchResult[]
  error?: string
}

export function LogSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (q: string) => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('search request failed')
      const json = (await res.json()) as SearchResponse
      setResults(json.results ?? [])
      setStatus('done')
    } catch {
      setResults([])
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setStatus('idle')
      return
    }

    timerRef.current = setTimeout(() => {
      void runSearch(trimmed)
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, runSearch])

  const showNoResults = query.trim() && status === 'done' && results.length === 0
  const showError = status === 'error'

  return (
    <div className={styles.searchWrap}>
      <label htmlFor="log-search" className={styles.label}>
        search entries
      </label>
      <input
        id="log-search"
        type="search"
        className={styles.input}
        placeholder="a word or phrase"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {showNoResults && <p className={styles.noResults}>nothing found.</p>}
      {showError && <p className={styles.noResults}>search unavailable.</p>}
      {results.length > 0 && (
        <ul className={styles.results} aria-label="search results">
          {results.map((r) => (
            <li key={r.date} className={styles.result}>
              <Link href={`/log/${r.date}`} className={styles.resultLink}>
                <span className={styles.resultDate}>{formatDisplayDate(r.date)}</span>
                <span className={styles.resultExcerpt}>{r.excerpt}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
