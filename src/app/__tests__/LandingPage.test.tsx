import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prompts', () => ({
  getSevenDayPreview: vi.fn(() => []),
}))
vi.mock('@/components/mosaic/MosaicPreview', () => ({
  MosaicPreview: () => null,
}))
vi.mock('@/components/mosaic/MosaicGlyph', () => ({
  MosaicGlyph: () => null,
}))

import LandingPage from '../page'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('LandingPage', () => {
  it('seven-day preview section is a named region landmark accessible by its heading', () => {
    render(<LandingPage />)
    expect(screen.getByRole('region', { name: 'the next seven days' })).toBeInTheDocument()
  })

  it('closing philosophy section is a named region landmark', () => {
    render(<LandingPage />)
    expect(screen.getByRole('region', { name: 'about ember' })).toBeInTheDocument()
  })
})
