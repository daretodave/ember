// Type declarations for the pure exports of mint-cookie.mjs, so the
// colocated vitest suite (src/lib/__tests__) typechecks under
// `tsc --noEmit`. The network-bound mint path is typed loosely — it
// is only ever invoked as a CLI.

export interface CookieCachePayload {
  mintedAt?: string
  expiresAt?: string
  projectRef?: string | null
  user?: { id: string | null; email: string }
  cookies?: Array<{ name: string; value: string; options?: Record<string, unknown> }>
}

export const REFRESH_WINDOW_MS: number
export const DEFAULT_BOT_EMAIL: string

export function loadDotenv(path?: string): void
export function projectRefFromUrl(url: string): string | null
export function readCache(path: string): CookieCachePayload | null
export function writeCache(payload: CookieCachePayload, path: string): void
export function isFresh(cached: CookieCachePayload | null | undefined, now?: number): boolean
export function mintCookies(args: {
  url: string
  serviceKey: string
  anonKey: string
  email: string
}): Promise<{
  cookies: Array<{ name: string; value: string; options?: Record<string, unknown> }>
  session: unknown
  user: { id: string | null; email: string }
}>
export function mint(opts?: {
  cachePath?: string
  now?: number
  env?: Record<string, string | undefined>
}): Promise<{ status: 'cache-hit' | 'minted'; payload: CookieCachePayload }>
