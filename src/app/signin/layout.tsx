import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ember · sign in',
  description: 'sign in to ember with a link sent to your email — no password required.',
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
