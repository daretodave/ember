import { getPromptForDate } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type EntryRow = {
  id: string
  date: string
  response: string
  task_done: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

function utcDateStamp(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function toMarkdown(entries: EntryRow[], exportedAt: string): string {
  const dateStamp = exportedAt.slice(0, 10)
  const lines: string[] = [`# ember export — ${dateStamp}`, '']

  if (entries.length === 0) {
    lines.push('(no entries)')
    return lines.join('\n')
  }

  for (const entry of entries) {
    const { prompt, task } = getPromptForDate(entry.date)
    lines.push(`## ${entry.date}`, '')
    lines.push(`**prompt:** ${prompt}`)
    lines.push(`**task:** ${task}`, '')
    lines.push('---', '')
    lines.push(entry.response || '')
    lines.push('', '---', '')
  }

  return lines.join('\n')
}

export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? 'json'

  if (format !== 'json' && format !== 'md') {
    return NextResponse.json({ error: 'unrecognized format' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('entries')
    .select('id, date, response, task_done, is_published, created_at, updated_at')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const entries = (data ?? []) as EntryRow[]
  const exportedAt = new Date().toISOString()
  const dateStamp = utcDateStamp()

  if (format === 'md') {
    const body = toMarkdown(entries, exportedAt)
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="ember-export-${dateStamp}.md"`,
      },
    })
  }

  const payload = {
    exported_at: exportedAt,
    entry_count: entries.length,
    entries: entries.map((e) => {
      const { prompt, task } = getPromptForDate(e.date)
      return {
        date: e.date,
        prompt,
        task,
        response: e.response,
        task_done: e.task_done,
        is_published: e.is_published,
        created_at: e.created_at,
        updated_at: e.updated_at,
      }
    }),
  }

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="ember-export-${dateStamp}.json"`,
    },
  })
}
