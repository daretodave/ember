import Link from 'next/link'

export default function NotFound() {
  return (
    <main>
      <p>404</p>
      <Link href="/">try again</Link>
    </main>
  )
}
