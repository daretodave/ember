import { checkRateLimit, utcDayStart } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type EntryPayload = {
  date: string
  response: string
  task_done: boolean
  is_published: boolean
  checkin_word?: string | null
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Partial<EntryPayload>
  try {
    body = (await request.json()) as Partial<EntryPayload>
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const { date, response, task_done, is_published, checkin_word } = body

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 })
  }
  const today = new Date().toISOString().slice(0, 10)
  if (date > today) {
    return NextResponse.json({ error: 'date cannot be in the future' }, { status: 400 })
  }
  if (typeof response !== 'string') {
    return NextResponse.json({ error: 'response must be a string' }, { status: 400 })
  }

  // Validate optional check-in word: single word, max 30 chars
  let sanitizedCheckinWord: string | null = null
  if (checkin_word !== undefined && checkin_word !== null) {
    const trimmed = String(checkin_word).trim()
    if (trimmed.length > 0) {
      if (trimmed.length > 30) {
        return NextResponse.json({ error: 'check-in word must be 30 characters or fewer' }, { status: 400 })
      }
      if (/\s/.test(trimmed)) {
        return NextResponse.json({ error: 'check-in word must be a single word (no spaces)' }, { status: 400 })
      }
      sanitizedCheckinWord = trimmed
    }
  }

  // Only rate-limit new entry creation, not updates to an already-existing entry.
  // The limit (10 new entry dates per UTC day) guards against bulk-backdating abuse
  // while allowing unlimited saves to the same entry date (e.g. auto-save).
  const { data: existingEntry } = await supabase
    .from('entries')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle()

  if (!existingEntry) {
    const allowed = await checkRateLimit({
      key: `entry:${user.id}:${today}`,
      windowStart: utcDayStart(),
      max: 10,
    })
    if (!allowed) {
      return NextResponse.json({ error: 'rate limit exceeded' }, { status: 429 })
    }
  }

  const { data, error } = await supabase
    .from('entries')
    .upsert(
      {
        user_id: user.id,
        date,
        response,
        task_done: task_done ?? false,
        is_published: is_published ?? false,
        checkin_word: sanitizedCheckinWord,
      },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
