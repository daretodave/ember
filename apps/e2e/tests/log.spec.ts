import { expect, test } from '@playwright/test'

test('/log redirects unauthenticated users to /signin', async ({ page }) => {
  await page.goto('/log')
  expect(page.url()).toContain('/signin')
})

test('/log/[date] redirects unauthenticated users to /signin', async ({ page }) => {
  await page.goto('/log/2026-01-01')
  expect(page.url()).toContain('/signin')
})

test('/log redirect has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/log')
  // ends up on /signin after redirect
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('/log/[date] redirect has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/log/2026-01-01')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
