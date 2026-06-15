'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import styles from './log-tag-filter.module.css'

type Props = {
  tags: string[]
  activeTag: string | null
}

export function LogTagFilter({ tags, activeTag }: Props) {
  const router = useRouter()

  const selectTag = useCallback(
    (tag: string) => {
      if (tag === activeTag) {
        router.push('/log')
      } else {
        router.push(`/log?tag=${encodeURIComponent(tag)}`)
      }
    },
    [activeTag, router],
  )

  if (tags.length === 0) return null

  return (
    <div className={styles.wrap} aria-label="filter by tag">
      <span className={styles.label}>tags</span>
      <div className={styles.chips} role="list">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            role="listitem"
            className={`${styles.chip}${tag === activeTag ? ` ${styles.active}` : ''}`}
            aria-pressed={tag === activeTag}
            onClick={() => selectTag(tag)}
          >
            {tag}
          </button>
        ))}
        {activeTag && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => router.push('/log')}
            aria-label="clear tag filter"
          >
            clear
          </button>
        )}
      </div>
    </div>
  )
}
