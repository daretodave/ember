import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LogMosaic, type MosaicTileData } from '../LogMosaic'

afterEach(() => {
  cleanup()
})

function makeTile(
  state: MosaicTileData['state'],
  date = '2026-05-19',
  displayDate = 'Tue 19 May 2026',
): MosaicTileData {
  return { date, state, displayDate, excerpt: '' }
}

describe('LogMosaic — tileStateLabel via aria-label', () => {
  it('empty tile gets "<date> — no entry" aria-label', () => {
    render(<LogMosaic tiles={[makeTile('empty')]} />)
    expect(screen.getByRole('link', { name: 'Tue 19 May 2026 — no entry' })).toBeInTheDocument()
  })

  it('filled tile gets "<date> — written" aria-label', () => {
    render(<LogMosaic tiles={[makeTile('filled')]} />)
    expect(screen.getByRole('link', { name: 'Tue 19 May 2026 — written' })).toBeInTheDocument()
  })

  it('today tile gets "<date> — today" aria-label', () => {
    render(<LogMosaic tiles={[makeTile('today', '2026-05-25', 'Mon 25 May 2026')]} />)
    expect(screen.getByRole('link', { name: 'Mon 25 May 2026 — today' })).toBeInTheDocument()
  })

  it('published tile gets "<date> — published" aria-label', () => {
    render(<LogMosaic tiles={[makeTile('published')]} />)
    expect(screen.getByRole('link', { name: 'Tue 19 May 2026 — published' })).toBeInTheDocument()
  })
})

describe('LogMosaic — tile links', () => {
  it('every tile links to /log/[date]', () => {
    const tiles: MosaicTileData[] = [
      makeTile('empty', '2026-05-18', 'Mon 18 May 2026'),
      makeTile('filled', '2026-05-19', 'Tue 19 May 2026'),
      makeTile('published', '2026-05-20', 'Wed 20 May 2026'),
    ]
    render(<LogMosaic tiles={tiles} />)
    expect(screen.getByRole('link', { name: 'Mon 18 May 2026 — no entry' })).toHaveAttribute(
      'href',
      '/log/2026-05-18',
    )
    expect(screen.getByRole('link', { name: 'Tue 19 May 2026 — written' })).toHaveAttribute(
      'href',
      '/log/2026-05-19',
    )
    expect(screen.getByRole('link', { name: 'Wed 20 May 2026 — published' })).toHaveAttribute(
      'href',
      '/log/2026-05-20',
    )
  })

  it('mosaic container has "60-day practice mosaic" group label', () => {
    render(<LogMosaic tiles={[makeTile('empty')]} />)
    expect(screen.getByRole('group', { name: '60-day practice mosaic' })).toBeInTheDocument()
  })
})
