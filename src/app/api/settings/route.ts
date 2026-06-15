import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const USERNAME_RE = /^[a-z][a-z0-9-]{2,29}$/
const VALID_PACKS = new Set(['standard', 'gratitude', 'craft', 'stoic', 'grief'])

type SettingsPayload = {
  display_name?: string | null
  username?: string | null
  timezone?: string
  use_personalized_prompts?: boolean
  prompt_pack?: string
  reminder_opt_in?: boolean
  reminder_hour?: number
  weekly_reflection_opt_in?: boolean
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Partial<SettingsPayload>
  try {
    body = (await request.json()) as Partial<SettingsPayload>
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const { display_name, username, timezone, use_personalized_prompts, prompt_pack, reminder_opt_in, reminder_hour, weekly_reflection_opt_in } = body

  // Validate username if provided (empty string or null → clear it)
  const normalizedUsername =
    username === '' || username === null || username === undefined
      ? null
      : username.trim().toLowerCase()

  if (normalizedUsername !== null && !USERNAME_RE.test(normalizedUsername)) {
    return NextResponse.json(
      { error: 'username must be 3–30 characters: lowercase letters, numbers, hyphens; must start with a letter' },
      { status: 400 },
    )
  }

  const patch: Record<string, unknown> = { user_id: user.id }

  if (display_name !== undefined) {
    patch.display_name = display_name === '' ? null : display_name
  }
  if (username !== undefined) {
    patch.username = normalizedUsername
  }
  if (timezone !== undefined && typeof timezone === 'string' && timezone.length > 0) {
    patch.timezone = timezone
  }
  if (use_personalized_prompts !== undefined && typeof use_personalized_prompts === 'boolean') {
    patch.use_personalized_prompts = use_personalized_prompts
  }
  if (prompt_pack !== undefined && typeof prompt_pack === 'string' && VALID_PACKS.has(prompt_pack)) {
    patch.prompt_pack = prompt_pack
  }
  if (reminder_opt_in !== undefined && typeof reminder_opt_in === 'boolean') {
    patch.reminder_opt_in = reminder_opt_in
  }
  if (reminder_hour !== undefined && typeof reminder_hour === 'number' && Number.isInteger(reminder_hour) && reminder_hour >= 0 && reminder_hour <= 23) {
    patch.reminder_hour = reminder_hour
  }
  if (weekly_reflection_opt_in !== undefined && typeof weekly_reflection_opt_in === 'boolean') {
    patch.weekly_reflection_opt_in = weekly_reflection_opt_in
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(patch, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    if (error.message.includes('unique') || error.code === '23505') {
      return NextResponse.json({ error: 'username taken' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
