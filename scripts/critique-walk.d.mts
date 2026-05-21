// Type declarations for the pure exports of critique-walk.mjs, so
// the colocated vitest suite (src/lib/__tests__) typechecks under
// `tsc --noEmit`. The walk/main runtime is intentionally not typed —
// it is only ever invoked as a CLI.

export interface CookieRecord {
  name: string
  value: string
  options?: { httpOnly?: boolean } & Record<string, unknown>
}

export interface PlaywrightCookie {
  name: string
  value: string
  url: string
  httpOnly: boolean
  secure: boolean
  sameSite: 'Lax'
}

export interface CookieCache {
  expiresAt?: string
  cookies?: CookieRecord[]
  [k: string]: unknown
}

export interface Finding {
  url: string
  viewport: string
  auth_state: string
  category: string
  severity: 'high' | 'medium' | 'low'
  observation: string
  evidence: string
  suggested_fix: string
  source: string
}

export const VIEWPORTS: Record<string, { width: number; height: number }>
export const DEFAULT_BASE: string
export const COOKIE_CACHE_PATH: string

export function isCookieCacheFresh(cached: CookieCache | null | undefined, now?: number): boolean
export function resolveSessionCookies(opts?: { cachePath?: string; now?: number }): CookieRecord[]
export function buildPlaywrightCookies(
  mode: string,
  cookieRecords: CookieRecord[] | null | undefined,
  baseUrl: string,
): PlaywrightCookie[] | null
export function analyzeCapture(capture: unknown): Finding[]
