import { getPublishedEntryByDate } from '@/lib/entries'
import { openingClause } from '@/lib/og-utils'
import { getProfileByUsername } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const alt = 'ember — a shared reflection'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PAPER = '#f8f5ef'
const INK = '#2a2620'
const INK_FAINT = '#b8b2a8'
const ACCENT = '#c2683f'

const FILLED = new Set([
  1, 3, 7, 11, 14, 16, 20, 23, 26, 28, 31, 34, 37, 40, 42, 45, 48, 51, 54, 57,
])

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatOgDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

let fontCache: ArrayBuffer | null = null

async function loadFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400&display=swap',
    )
    if (!cssRes.ok) return null
    const css = await cssRes.text()
    const urlMatch = css.match(/url\(([^)]+)\)/)
    if (!urlMatch) return null
    const fontRes = await fetch(urlMatch[1])
    if (!fontRes.ok) return null
    fontCache = await fontRes.arrayBuffer()
    return fontCache
  } catch {
    return null
  }
}

type Props = {
  params: Promise<{ username: string; date: string }>
}

export default async function Image({ params }: Props) {
  const fontData = await loadFont()
  if (!fontData) return new Response('font unavailable', { status: 503 })

  const { username, date } = await params

  let excerpt: string | null = null
  let displayName: string | null = null
  let formattedDate: string | null = null

  try {
    const supabase = await createClient()
    const profile = await getProfileByUsername(supabase, username)
    if (profile) {
      const entry = await getPublishedEntryByDate(supabase, profile.user_id, date)
      if (entry) {
        excerpt = openingClause(entry.response)
        displayName = profile.display_name ?? `@${profile.username}`
        formattedDate = formatOgDate(date)
      }
    }
  } catch {
    // fall through to generic layout
  }

  const mosaicTiles = Array.from({ length: 60 }, (_, i) => {
    const filled = FILLED.has(i)
    return (
      <div
        key={i}
        style={{
          width: 16,
          height: 16,
          backgroundColor: filled ? ACCENT : 'transparent',
          border: filled ? 'none' : `1px solid ${INK_FAINT}`,
          flexShrink: 0,
        }}
      />
    )
  })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: PAPER,
          display: 'flex',
          alignItems: 'center',
          padding: '80px',
          gap: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            paddingTop: '0px',
            paddingBottom: '0px',
          }}
        >
          <div
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 28,
              fontWeight: 400,
              color: INK,
              lineHeight: 1,
              letterSpacing: '-0.5px',
              marginBottom: 40,
            }}
          >
            ember
          </div>

          {excerpt ? (
            <>
              <div
                style={{
                  fontFamily: '"Source Serif 4", Georgia, serif',
                  fontSize: 36,
                  fontWeight: 400,
                  color: INK,
                  lineHeight: 1.35,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                {excerpt}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  marginTop: 32,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 18,
                    fontWeight: 400,
                    color: INK_FAINT,
                    lineHeight: 1,
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 400,
                    color: INK_FAINT,
                    lineHeight: 1,
                  }}
                >
                  {formattedDate}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 22,
                fontWeight: 400,
                color: INK_FAINT,
                lineHeight: 1.4,
                maxWidth: 380,
              }}
            >
              ten minutes of intention before the day swallows you
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            width: 116,
            flexShrink: 0,
          }}
        >
          {mosaicTiles}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Source Serif 4',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  )
}
