import { MosaicGlyph } from '@/components/mosaic/MosaicGlyph'
import { getProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DeleteAccountSection } from './DeleteAccountSection'
import { SettingsForm } from './SettingsForm'
import styles from './page.module.css'

export const metadata = {
  title: 'ember · settings',
  description: 'account settings — display name, timezone, prompt variety, and public username.',
  openGraph: {
    title: 'ember · settings',
    description: 'account settings — display name, timezone, prompt variety, and public username.',
    url: '/settings',
  },
  twitter: {
    title: 'ember · settings',
    description: 'account settings — display name, timezone, prompt variety, and public username.',
  },
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
        <Link href="/" className={styles.lockup} aria-label="ember — home">
          <MosaicGlyph />
          <span className={styles.wordmark}>ember</span>
        </Link>
        <nav className={styles.nav} aria-label="site navigation">
          <Link href="/today">today</Link>
          <Link href="/log">log</Link>
          <Link href="/settings" className={styles.navCurrent} aria-current="page">settings</Link>
        </nav>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1}>
        <h1 className={styles.heading}>settings</h1>
        <SettingsForm
          displayName={profile?.display_name ?? ''}
          username={profile?.username ?? ''}
          timezone={profile?.timezone ?? 'UTC'}
          usePersonalizedPrompts={profile?.use_personalized_prompts ?? false}
          virgin={virgin}
        />
        {profile?.username && (
          <Link
            href={`/u/${profile.username}`}
            className={styles.profileLink}
          >
            view public profile
          </Link>
        )}
        <a
          href="/api/export"
          className={styles.exportLink}
          download
        >
          export your data
        </a>
        <DeleteAccountSection />
      </main>
      <footer className={styles.footer}>
        <form action="/auth/signout" method="POST">
          <button type="submit" className={styles.signOutBtn}>sign out</button>
        </form>
      </footer>
    </div>
  )
}
