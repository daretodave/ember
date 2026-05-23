import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://ember-rust-sigma.vercel.app')

const staticEntries: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${siteUrl}/signin`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        'placeholder-anon-key',
    )

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)

    if (error || !profiles) {
      return staticEntries
    }

    const profileEntries: MetadataRoute.Sitemap = profiles.map((profile) => ({
      url: `${siteUrl}/u/${profile.username as string}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at as string) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticEntries, ...profileEntries]
  } catch {
    return staticEntries
  }
}
