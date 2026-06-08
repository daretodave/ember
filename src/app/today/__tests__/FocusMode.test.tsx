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
    const trigger = screen.getByRole('button', { name: 'enters a distraction-free writing view.' })
    fireEvent.click(trigger)
    const overlay = screen.getByRole('dialog')
    expect(overlay).not.toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveAttribute('aria-modal', 'true')
  })

  it('overlay shows the prompt text', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    expect(screen.getByText('what did you attend to today?')).toBeInTheDocument()
  })

  it('"done" button exits focus mode', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    fireEvent.click(screen.getByRole('button', { name: 'exits the distraction-free writing view.' }))
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('Escape key exits focus mode', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('textarea in focus overlay shares state with the main textarea', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const mainTextarea = screen.getByLabelText<HTMLTextAreaElement>('response', {
      selector: '#today-entry-response',
    })
    fireEvent.change(mainTextarea, { target: { value: 'hello world' } })

    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    const focusTextarea = screen.getByLabelText<HTMLTextAreaElement>('response', {
      selector: '#focus-entry-response',
    })
    expect(focusTextarea.value).toBe('hello world')
  })

  it('overlay has a concise stable aria-label', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const overlay = screen.getByRole('dialog', { hidden: true })
    expect(overlay).toHaveAttribute('aria-label', 'focus mode')
  })

  it('main form elements are removed from tab order when focus mode is active', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)

    const mainTextarea = document.getElementById('today-entry-response')
    const focusTrigger = screen.getByRole('button', { name: 'enters a distraction-free writing view.' })

    expect(mainTextarea).not.toHaveAttribute('tabindex', '-1')
    expect(focusTrigger).not.toHaveAttribute('tabindex', '-1')

    fireEvent.click(focusTrigger)

    expect(mainTextarea).toHaveAttribute('tabindex', '-1')
    expect(document.getElementById('today-entry-response')).toHaveAttribute('tabindex', '-1')
  })

  it('main form elements are restored to tab order when focus mode exits', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    fireEvent.click(screen.getByRole('button', { name: 'exits the distraction-free writing view.' }))

    const mainTextarea = document.getElementById('today-entry-response')
    expect(mainTextarea).not.toHaveAttribute('tabindex', '-1')
  })

  it('page header and strip become inert while focus mode is active', () => {
    const header = document.createElement('header')
    header.id = 'page-header'
    const strip = document.createElement('section')
    strip.id = 'day-strip'
    document.body.appendChild(header)
    document.body.appendChild(strip)

    render(<TodayEntry {...DEFAULT_PROPS} />)

    expect(header).not.toHaveAttribute('inert')
    expect(strip).not.toHaveAttribute('inert')

    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))

    expect(header).toHaveAttribute('inert')
    expect(strip).toHaveAttribute('inert')

    document.body.removeChild(header)
    document.body.removeChild(strip)
  })

  it('outer main-view content is hidden from AT while focus mode is active', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    const focusTrigger = screen.getByRole('button', { name: 'enters a distraction-free writing view.' })

    // Before focus mode: outer wrapper should not have aria-hidden
    const mainTextarea = document.getElementById('today-entry-response')
    expect(mainTextarea?.closest('[aria-hidden="true"]')).toBeNull()

    fireEvent.click(focusTrigger)

    // After focus mode: outer wrapper should carry aria-hidden="true"
    expect(document.getElementById('today-entry-response')?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('outer main-view AT suppression is removed when focus mode exits', () => {
    render(<TodayEntry {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    fireEvent.click(screen.getByRole('button', { name: 'exits the distraction-free writing view.' }))

    expect(document.getElementById('today-entry-response')?.closest('[aria-hidden="true"]')).toBeNull()
  })

  it('page header and strip inert is removed when focus mode exits', () => {
    const header = document.createElement('header')
    header.id = 'page-header'
    const strip = document.createElement('section')
    strip.id = 'day-strip'
    document.body.appendChild(header)
    document.body.appendChild(strip)

    render(<TodayEntry {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: 'enters a distraction-free writing view.' }))
    fireEvent.click(screen.getByRole('button', { name: 'exits the distraction-free writing view.' }))

    expect(header).not.toHaveAttribute('inert')
    expect(strip).not.toHaveAttribute('inert')

    document.body.removeChild(header)
    document.body.removeChild(strip)
  })
})
