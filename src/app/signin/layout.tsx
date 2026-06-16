import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ember · sign in',
  description: 'sign in to ember with a link sent by email — no password, no other mail.',
  alternates: { canonical: '/signin' },
  openGraph: {
    title: 'ember · sign in',
    description: 'sign in to ember with a link sent by email — no password, no other mail.',
    url: '/signin',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember — a daily writing ritual' }],
  },
  twitter: {
    title: 'ember · sign in',
    description: 'sign in to ember with a link sent by email — no password, no other mail.',
    images: [{ url: '/opengraph-image', alt: 'ember — a daily writing ritual' }],
  },
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
