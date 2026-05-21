import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TodayEntry } from '../TodayEntry'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const DEFAULT_PROPS = {
  date: '2026-05-21',
  task: 'notice one thing',
  prompt: 'what did you attend to today?',
  initialEntry: null,
}

describe('focus mode', () => {
  it('overlay is hidden by default', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('overlay becomes visible after clicking the focus trigger', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const trigger = screen.getByRole('button', { name: 'enter focus mode' })
    fireEvent.click(trigger)
    const overlay = screen.getByRole('dialog')
    expect(overlay).not.toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveAttribute('aria-modal', 'true')
  })

  it('overlay shows the prompt text', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enter focus mode' }))
    expect(screen.getByText('what did you attend to today?')).toBeInTheDocument()
  })

  it('"done" button exits focus mode', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enter focus mode' }))
    fireEvent.click(screen.getByRole('button', { name: 'exit focus mode' }))
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('Escape key exits focus mode', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enter focus mode' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('textarea in focus overlay shares state with the main textarea', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const mainTextarea = screen.getByLabelText<HTMLTextAreaElement>('your response', {
      selector: '#today-entry-response',
    })
    fireEvent.change(mainTextarea, { target: { value: 'hello world' } })

    fireEvent.click(screen.getByRole('button', { name: 'enter focus mode' }))
    const focusTextarea = screen.getByLabelText<HTMLTextAreaElement>('your response', {
      selector: '#focus-entry-response',
    })
    expect(focusTextarea.value).toBe('hello world')
  })

  it('overlay has aria-labelledby pointing at the prompt heading', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-labelledby', 'focus-mode-heading')
    expect(document.getElementById('focus-mode-heading')).toHaveTextContent(
      'what did you attend to today?',
    )
  })
})
