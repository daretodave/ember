import { expect, test } from '@playwright/test'

test('OG image route returns 200 with image/png', async ({ request }) => {
  const res = await request.get('/opengraph-image')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('image/png')
})

test('icon SVG route returns 200', async ({ request }) => {
  const res = await request.get('/icon.svg')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('image/svg')
})

test('apple-icon route returns 200 with image/png', async ({ request }) => {
  const res = await request.get('/apple-icon')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('image/png')
})

test('manifest returns 200 with JSON containing name ember', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.name).toBe('ember')
  expect(body.short_name).toBe('ember')
})

test('root page head contains manifest link', async ({ page }) => {
  await page.goto('/')
  const manifest = page.locator('link[rel="manifest"]')
  await expect(manifest).toHaveAttribute('href', '/manifest.webmanifest')
})

test('root page head contains OG image meta tag', async ({ page }) => {
  await page.goto('/')
  const ogImage = page.locator('meta[property="og:image"]')
  await expect(ogImage).toHaveCount(1)
})
