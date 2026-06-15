/**
 * Sanitize a raw search query: trim whitespace and cap at 200 characters.
 * Returns an empty string if the input reduces to nothing.
 */
export function sanitizeSearchQuery(raw: string): string {
  return raw.trim().slice(0, 200)
}

/**
 * Extract a short excerpt (~120 chars) from `text` centered around the first
 * occurrence of the first token in `query`. Falls back to the opening 120
 * characters when the token isn't found.
 */
export function excerptAround(text: string, query: string, maxLen = 120): string {
  if (!text) return ''

  const firstToken = (query.trim().split(/\s+/)[0] ?? '').toLowerCase()
  const lower = text.toLowerCase()
  const idx = firstToken ? lower.indexOf(firstToken) : -1

  if (idx === -1) {
    const slice = text.slice(0, maxLen).trimEnd()
    return slice.length < text.length ? `${slice}…` : slice
  }

  const halfContext = Math.floor((maxLen - firstToken.length) / 2)
  const start = Math.max(0, idx - halfContext)
  const end = Math.min(text.length, idx + firstToken.length + halfContext)
  const slice = text.slice(start, end).trim()

  return `${start > 0 ? '…' : ''}${slice}${end < text.length ? '…' : ''}`
}
