import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SettingsForm } from '../SettingsForm'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const BASE_PROPS = {
  displayName: 'Ada',
  username: 'ada',
  timezone: 'America/New_York',
  usePersonalizedPrompts: false,
  reminderOptIn: false,
  reminderHour: 8,
  weeklyReflectionOptIn: false,
  virgin: false,
}

describe('SettingsForm — field rendering', () => {
  it('renders display name with initial value', () => {
    render(<SettingsForm {...BASE_PROPS} />)
    expect(screen.getByLabelText<HTMLInputElement>('display name').value).toBe('Ada')
  })

  it('renders username with initial value', () => {
    render(<SettingsForm {...BASE_PROPS} />)
    expect(screen.getByLabelText<HTMLInputElement>('public username').value).toBe('ada')
  })

  it('save button is enabled on initial load', () => {
    render(<SettingsForm {...BASE_PROPS} />)
    expect(screen.getByRole('button', { name: 'save' })).not.toBeDisabled()
  })
})

describe('SettingsForm — save payload (regression: 0419eb3)', () => {
  it('includes use_personalized_prompts: true in the submitted payload', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} usePersonalizedPrompts={true} />)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/settings',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            display_name: 'Ada',
            username: 'ada',
            timezone: 'America/New_York',
            use_personalized_prompts: true,
            reminder_opt_in: false,
            reminder_hour: 8,
            weekly_reflection_opt_in: false,
          }),
        }),
      )
    })
  })

  it('sends use_personalized_prompts: false when standard variety is active', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} usePersonalizedPrompts={false} />)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body.use_personalized_prompts).toBe(false)
    })
  })

  it('sends reminder_opt_in: false and reminder_hour: 8 by default', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} />)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body.reminder_opt_in).toBe(false)
      expect(body.reminder_hour).toBe(8)
    })
  })

  it('sends reminder_opt_in: true after enabling the reminder', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} />)

    // Turn reminder on — scope to the "daily reminder" radiogroup to avoid the
    // "weekly reflection" radiogroup's "on" radio matching too
    const reminderGroup = screen.getByRole('radiogroup', { name: 'daily reminder' })
    const onRadio = within(reminderGroup).getByRole('radio', { name: 'on' })
    fireEvent.click(onRadio)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body.reminder_opt_in).toBe(true)
    })
  })
})

describe('SettingsForm — timezone auto-detection', () => {
  it('populates timezone combobox from browser when no timezone is saved', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'Europe/Berlin',
      locale: 'en',
      calendar: 'gregory',
      numberingSystem: 'latn',
    } as Intl.ResolvedDateTimeFormatOptions)
    render(<SettingsForm {...BASE_PROPS} timezone="" />)
    await waitFor(() => {
      const input = document.querySelector('[role="combobox"]') as HTMLInputElement | null
      expect(input?.value).toBe('Europe/Berlin')
    })
  })
})

describe('SettingsForm — unsaved-changes guard', () => {
  it('sets window.onbeforeunload when a field is edited', () => {
    render(<SettingsForm {...BASE_PROPS} />)
    expect(window.onbeforeunload).toBeNull()
    fireEvent.change(screen.getByLabelText<HTMLInputElement>('display name'), { target: { value: 'Bob' } })
    expect(window.onbeforeunload).toBeTypeOf('function')
  })

  it('clears window.onbeforeunload after a successful save', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} />)
    fireEvent.change(screen.getByLabelText<HTMLInputElement>('display name'), { target: { value: 'Bob' } })
    expect(window.onbeforeunload).toBeTypeOf('function')

    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(window.onbeforeunload).toBeNull()
    })
  })
})

describe('SettingsForm — save state', () => {
  it('disables save button and shows "saving." while request is in flight', async () => {
    let settle: (v: Response) => void
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((r) => {
        settle = r
      }),
    )

    render(<SettingsForm {...BASE_PROPS} />)
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'saving.' })).toBeDisabled()
    })

    settle!({ ok: true, json: async () => ({}) } as Response)
  })

  it('announces "saving." in aria-live region while request is in flight', async () => {
    let settle: (v: Response) => void
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((r) => {
        settle = r
      }),
    )

    render(<SettingsForm {...BASE_PROPS} />)
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('saving.')
    })

    settle!({ ok: true, json: async () => ({}) } as Response)
  })

  it('shows "saved." in aria-live region after successful save', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} />)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('saved.')
    })
  })

  it('shows role="alert" with error message on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'something went wrong. try again.' }),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} />)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some((el) => el.textContent === 'something went wrong. try again.')).toBe(true)
    })
  })

  it('shows field-level error near username for conflict responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'username already taken' }),
    } as Response)
    render(<SettingsForm {...BASE_PROPS} />)

    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some((el) => el.textContent === 'username already taken')).toBe(true)
    })
  })
})
