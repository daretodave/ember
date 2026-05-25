import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProfileMosaic } from '../ProfileMosaic'

afterEach(() => {
  cleanup()
})

const USERNAME = 'ada'

function makePublished(date: string, displayDate: string) {
  return { date, published: true, displayDate }
}

function makeUnpublished(date: string, displayDate: string) {
  return { date, published: false, displayDate }
}

describe('ProfileMosaic — published tile aria-label', () => {
  it('published tile gets "<date> — published entry" aria-label', () => {
    render(<ProfileMosaic tiles={[makePublished('2026-05-19', 'Tue 19 May 2026')]} username={USERNAME} />)
    expect(screen.getByRole('link', { name: 'Tue 19 May 2026 — published entry' })).toBeInTheDocument()
  })

  it('published tile links to /u/<username>/<date>', () => {
    render(<ProfileMosaic tiles={[makePublished('2026-05-19', 'Tue 19 May 2026')]} username={USERNAME} />)
    expect(screen.getByRole('link', { name: 'Tue 19 May 2026 — published entry' })).toHaveAttribute(
      'href',
      '/u/ada/2026-05-19',
    )
  })
})

describe('ProfileMosaic — non-published tile', () => {
  it('non-published tile is aria-hidden', () => {
    const { container } = render(
      <ProfileMosaic tiles={[makeUnpublished('2026-05-18', 'Mon 18 May 2026')]} username={USERNAME} />,
    )
    const tile = container.querySelector('[aria-hidden="true"]')
    expect(tile).not.toBeNull()
  })

  it('non-published tile is not a link', () => {
    render(<ProfileMosaic tiles={[makeUnpublished('2026-05-18', 'Mon 18 May 2026')]} username={USERNAME} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})

describe('ProfileMosaic — container', () => {
  it('mosaic container has "60-day practice mosaic" group label', () => {
    render(<ProfileMosaic tiles={[makePublished('2026-05-19', 'Tue 19 May 2026')]} username={USERNAME} />)
    expect(screen.getByRole('group', { name: '60-day practice mosaic' })).toBeInTheDocument()
  })
})
