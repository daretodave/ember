/**
 * Extract the opening clause from the first paragraph of an entry response.
 * Truncates at maxLen characters at the nearest word boundary and appends "...".
 */
export function openingClause(response: string, maxLen = 80): string {
  const firstPara = response.split('\n\n')[0].trim()
  if (firstPara.length <= maxLen) return firstPara
  const truncated = firstPara.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}
