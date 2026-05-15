import { expect, test } from '@playwright/test'

test('/u/doesnotexist returns a not-found page', async ({ page }) => {
  const response = await page.goto('/u/doesnotexist')
  // Next.js notFound() renders the 404 page; response status is 404
  expect(response?.status()).toBe(404)
})

test('/u/doesnotexist/2026-05-15 returns a not-found page', async ({ page }) => {
  const response = await page.goto('/u/doesnotexist/2026-05-15')
  expect(response?.status()).toBe(404)
})

test('/u/doesnotexist has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/u/doesnotexist')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
