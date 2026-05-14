import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email: string | undefined = body?.email

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
