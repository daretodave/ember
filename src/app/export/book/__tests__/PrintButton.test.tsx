import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PrintButton } from '../PrintButton'

afterEach(() => {
  cleanup()
})

describe('PrintButton', () => {
  it('renders a button with type="button"', () => {
    render(<PrintButton />)
    const btn = screen.getByRole('button', { name: 'print your book' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('calls window.print() when clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<PrintButton />)
    fireEvent.click(screen.getByRole('button', { name: 'print your book' }))
    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })
})
