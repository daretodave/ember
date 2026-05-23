import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TimezoneCombobox } from '../TimezoneCombobox'

afterEach(cleanup)

const ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'UTC',
]

function renderCombobox(value = 'UTC', onChange = vi.fn()) {
  return {
    ...render(
      <TimezoneCombobox id="tz" value={value} timezones={ZONES} onChange={onChange} />,
    ),
    onChange,
  }
}

describe('TimezoneCombobox', () => {
  it('renders with the current value in the input', () => {
    renderCombobox('America/New_York')
    expect(screen.getByRole('combobox')).toHaveValue('America/New_York')
  })

  it('opens the listbox on focus', () => {
    renderCombobox()
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('listbox is absent before focus', () => {
    renderCombobox()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows grouped options when no query is typed', () => {
    renderCombobox()
    fireEvent.focus(screen.getByRole('combobox'))
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('America')).toBeInTheDocument()
    expect(within(listbox).getByText('Europe')).toBeInTheDocument()
    expect(within(listbox).getByText('Asia')).toBeInTheDocument()
  })

  it('filters options when a query is typed', () => {
    renderCombobox()
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Euro' } })
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('Europe/London')
    expect(options[1]).toHaveTextContent('Europe/Paris')
  })

  it('shows "no matches" when query has no results', () => {
    renderCombobox()
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(screen.getByText('no matches')).toBeInTheDocument()
  })

  it('calls onChange when an option is clicked via mouseDown', () => {
    const { onChange } = renderCombobox('UTC')
    fireEvent.focus(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: 'Asia/Tokyo' })
    fireEvent.mouseDown(option)
    expect(onChange).toHaveBeenCalledWith('Asia/Tokyo')
  })

  it('marks the currently selected option with aria-selected="true"', () => {
    renderCombobox('Europe/London')
    fireEvent.focus(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: 'Europe/London' })
    expect(option).toHaveAttribute('aria-selected', 'true')
  })

  it('marks non-selected options with aria-selected="false"', () => {
    renderCombobox('Europe/London')
    fireEvent.focus(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: 'America/New_York' })
    expect(option).toHaveAttribute('aria-selected', 'false')
  })

  it('closes without selecting on Escape', () => {
    const { onChange } = renderCombobox('UTC')
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('selects option with Enter after ArrowDown', () => {
    const { onChange } = renderCombobox('UTC')
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    // First ArrowDown moves to index 1 (or stays at 0 then goes to 1)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('opens with ArrowDown when closed', () => {
    renderCombobox()
    const input = screen.getByRole('combobox')
    // Input doesn't have focus here; fire keydown without opening via focus first
    // (simulate: input is focused but list is closed via Escape, then ArrowDown)
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('has aria-haspopup="listbox" on the input', () => {
    renderCombobox()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('has aria-autocomplete="list" on the input', () => {
    renderCombobox()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('sets aria-activedescendant when an option is highlighted', () => {
    renderCombobox('UTC')
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
  })

  it('closes listbox after selecting an option', () => {
    renderCombobox('UTC')
    fireEvent.focus(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    const option = screen.getByRole('option', { name: 'Asia/Tokyo' })
    fireEvent.mouseDown(option)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders groups in alphabetical order', () => {
    renderCombobox()
    fireEvent.focus(screen.getByRole('combobox'))
    const groups = screen.getAllByRole('group')
    const labels = groups.map((g) => g.getAttribute('aria-label') ?? '')
    expect(labels).toEqual([...labels].sort())
  })
})
