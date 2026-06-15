/**
 * Pure helpers for the daily reminder feature.
 * Used by both unit tests and scripts/remind.mjs (copied inline there
 * to keep the script dependency-free).
 */

export function todayInTimezone(timezone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now)
  } catch {
    return now.toISOString().slice(0, 10)
  }
}

export function currentHourInTimezone(timezone: string, now: Date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(now)
    const h = parts.find((p) => p.type === 'hour')
    const val = parseInt(h?.value ?? '0', 10)
    return val === 24 ? 0 : val
  } catch {
    return now.getUTCHours()
  }
}

export function buildReminderSubject(): string {
  return "today's prompt is waiting."
}

export function buildReminderText(siteUrl: string): string {
  return [
    "today's prompt is waiting.",
    '',
    `${siteUrl}/today`,
    '',
    '---',
    `to stop these reminders, visit ${siteUrl}/settings and turn off daily reminder.`,
  ].join('\n')
}
