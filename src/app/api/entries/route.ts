import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type EntryPayload = {
  date: string
  response: string
  task_done: boolean
  is_published: boolean
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

  const { date, response, task_done, is_published } = body

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 })
  }
  if (typeof response !== 'string') {
    return NextResponse.json({ error: 'response must be a string' }, { status: 400 })
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
