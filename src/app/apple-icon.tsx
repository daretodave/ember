import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const PAPER = '#f8f5ef'
const ACCENT = '#c2683f'

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

export default async function AppleIcon() {
  const fontData = await loadFont()
  if (!fontData) return new Response('font unavailable', { status: 503 })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: PAPER,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 120,
            fontWeight: 400,
            color: ACCENT,
            lineHeight: 1,
          }}
        >
          e
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
