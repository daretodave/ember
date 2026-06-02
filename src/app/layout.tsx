import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar'
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://ember-rust-sigma.vercel.app')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ember — a daily writing ritual',
  description: 'ember is a daily writing ritual — one prompt and one tiny task each morning.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon',
  },
  openGraph: {
    type: 'website',
    siteName: 'ember',
    title: 'ember — a daily writing ritual',
    description: 'ember is a daily writing ritual — one prompt and one tiny task each morning.',
    url: siteUrl,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember — a daily writing ritual' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ember — a daily writing ritual',
    description: 'ember is a daily writing ritual — one prompt and one tiny task each morning.',
    images: ['/opengraph-image'],
  },
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
        <ServiceWorkerRegistrar />
        <a href="#main-content" className="skip-link">skip to content</a>
        {children}
      </body>
    </html>
  )
}
