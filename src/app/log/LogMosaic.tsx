'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import styles from './page.module.css'

export type MosaicTileData = {
  date: string
  state: 'empty' | 'filled' | 'today' | 'published'
  excerpt: string
  displayDate: string
}

type TooltipState = {
  visible: boolean
  left: number
  top: number
  date: string
  excerpt: string
}

function tileClass(state: MosaicTileData['state']): string {
  if (state === 'filled') return 'tile tile--filled'
  if (state === 'today') return 'tile tile--today'
  if (state === 'published') return 'tile tile--published'
  return 'tile'
}

type Props = {
  tiles: MosaicTileData[]
}

export function LogMosaic({ tiles }: Props) {
  const mosaicRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    left: 0,
    top: 0,
    date: '',
    excerpt: '',
  })

  function handleEnter(e: React.MouseEvent<HTMLElement>, tile: MosaicTileData) {
    const mosaicEl = mosaicRef.current
    if (!mosaicEl) return
    const tileRect = e.currentTarget.getBoundingClientRect()
    const mosaicRect = mosaicEl.getBoundingClientRect()
    setTooltip({
      visible: true,
      left: tileRect.left - mosaicRect.left + tileRect.width + 12,
      top: tileRect.top - mosaicRect.top,
      date: tile.displayDate,
      excerpt: tile.excerpt,
    })
  }

  function handleLeave() {
    setTooltip((t) => ({ ...t, visible: false }))
  }

  return (
    <div
      className={`mosaic mosaic--lg ${styles.logMosaic}`}
      ref={mosaicRef}
      style={{ position: 'relative' }}
      aria-label="sixty-day practice mosaic"
    >
      {tiles.map((tile, i) => (
        <Link
          key={tile.date}
          href={`/log/${tile.date}`}
          className={`${tileClass(tile.state)} ${styles.mosaicTile}`}
          style={{ animationDelay: `${i * 8}ms` }}
          aria-label={tile.displayDate}
          onMouseEnter={(e) => handleEnter(e, tile)}
          onMouseLeave={handleLeave}
        />
      ))}

      {tooltip.visible && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.left, top: tooltip.top }}
          aria-hidden="true"
        >
          <span className={styles.tooltipDate}>{tooltip.date}</span>
          {tooltip.excerpt ? (
            <span className={styles.tooltipExcerpt}>{tooltip.excerpt}</span>
          ) : (
            <span className={`${styles.tooltipExcerpt} ${styles.tooltipEmpty}`}>
              no entry
            </span>
          )}
        </div>
      )}
    </div>
  )
}
