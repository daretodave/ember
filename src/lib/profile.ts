import type { SupabaseClient } from '@supabase/supabase-js'

export type ProfileRow = {
  user_id: string
  display_name: string | null
  username: string | null
  timezone: string
  created_at: string
  updated_at: string
}

/**
 * Fetch the profile for the given user.
 * Returns null if no row exists yet.
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('getProfile error:', error.message)
    return null
  }
  return data as ProfileRow | null
}
