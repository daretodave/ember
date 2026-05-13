import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ember',
  description: 'ten minutes of intention before the day swallows you',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
