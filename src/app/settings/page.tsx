import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { getProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SettingsForm } from './SettingsForm'
import styles from './page.module.css'

export const metadata = {
  title: 'ember · settings',
  description: 'display name, timezone, public username',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const profile = await getProfile(supabase, user.id)

  // virgin: row doesn't exist yet, or created_at === updated_at (never explicitly saved)
  const virgin =
    !profile || profile.created_at === profile.updated_at

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.lockup}>
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav}>
          <a href="/today">today</a>
          <a href="/log">log</a>
          <a href="/settings" className={styles.navCurrent}>settings</a>
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.heading}>settings</h1>
        <SettingsForm
          displayName={profile?.display_name ?? ''}
          username={profile?.username ?? ''}
          timezone={profile?.timezone ?? 'UTC'}
          virgin={virgin}
        />
        {profile?.username && (
          <a
            href={`/u/${profile.username}`}
            className={styles.profileLink}
          >
            view your public profile
          </a>
        )}
      </main>
    </div>
  )
}
