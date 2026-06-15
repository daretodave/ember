import { createClient } from '@/lib/supabase/server'
import { getWeeklyReflection } from '@/lib/weeklyReflection'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const reflection = await getWeeklyReflection(supabase, user.id)
  return NextResponse.json({ reflection })
}
