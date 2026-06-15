import { sanitizeSearchQuery, excerptAround } from '@/lib/search'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_RESULTS = 20

type EntryRow = { id: string; date: string; response: string }

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('q') ?? ''
  const q = sanitizeSearchQuery(raw)

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  // Primary: full-text search using websearch_to_tsquery
  const { data: ftsData, error: ftsError } = await supabase
    .from('entries')
    .select('id, date, response')
    .eq('user_id', user.id)
    .textSearch('response', q, { type: 'websearch', config: 'english' })
    .order('date', { ascending: false })
    .limit(MAX_RESULTS)

  if (!ftsError) {
    return NextResponse.json({ results: formatResults(ftsData ?? [], q) })
  }

  // Fallback: ILIKE (works on all Postgres text columns; slower but always available)
  const escapedQ = q.replace(/[%_\\]/g, (c) => `\\${c}`)
  const { data: ilikeData, error: ilikeError } = await supabase
    .from('entries')
    .select('id, date, response')
    .eq('user_id', user.id)
    .ilike('response', `%${escapedQ}%`)
    .order('date', { ascending: false })
    .limit(MAX_RESULTS)

  if (ilikeError) {
    return NextResponse.json({ error: 'search failed' }, { status: 500 })
  }

  return NextResponse.json({ results: formatResults(ilikeData ?? [], q) })
}

function formatResults(rows: EntryRow[], query: string) {
  return rows.map((row) => ({
    date: row.date,
    excerpt: excerptAround(row.response, query),
  }))
}
