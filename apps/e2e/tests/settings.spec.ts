import { expect, test } from '@playwright/test'

test('/settings redirects unauthenticated users to /signin', async ({ page }) => {
  await page.goto('/settings')
  expect(page.url()).toContain('/signin')
})

test('/settings redirect has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/settings')
  // ends up on /signin after redirect
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
