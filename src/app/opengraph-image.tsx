import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const alt = 'ember — ten minutes of intention before the day swallows you'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Design tokens (hex approximations from tokens.css)
const PAPER = '#f8f5ef'
const INK = '#2a2620'
const INK_FAINT = '#b8b2a8'
const ACCENT = '#c2683f'

// 6×10 mosaic pattern — scatter of filled tiles
const FILLED = new Set([
  1, 3, 7, 11, 14, 16, 20, 23, 26, 28, 31, 34, 37, 40, 42, 45, 48, 51, 54, 57,
])

// Module-level cache: warm serverless containers reuse the same font data
let fontCache: ArrayBuffer | null = null

async function loadFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache
  try {
    // No browser User-Agent → Google Fonts returns TTF (not woff2)
    // satori requires TTF/OTF/WOFF — woff2 is not supported
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

export default async function Image() {
  const fontData = await loadFont()
  if (!fontData) return new Response('font unavailable', { status: 503 })

  const tiles = Array.from({ length: 60 }, (_, i) => {
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
            gap: '20px',
            flex: 1,
          }}
        >
          <div
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 72,
              fontWeight: 400,
              color: INK,
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            ember
          </div>
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
          {tiles}
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
