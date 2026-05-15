import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-source-serif-4',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'ember',
  description: 'ten minutes of intention before the day swallows you',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontClasses = [
    sourceSerif4.variable,
    inter.variable,
    jetbrainsMono.variable,
  ].join(' ')

  return (
    <html lang="en" className={fontClasses}>
      <body>
        <a href="#main-content" className="skip-link">skip to content</a>
        {children}
      </body>
    </html>
  )
}
