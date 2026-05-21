import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ember',
    short_name: 'ember',
    description: 'ten minutes of intention before the day swallows you',
    start_url: '/',
    display: 'browser',
    background_color: '#f8f5ef',
    theme_color: '#c2683f',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
