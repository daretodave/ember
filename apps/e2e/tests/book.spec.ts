import { expect, test } from '@playwright/test'

test('/export/book redirects unauthenticated users to /signin', async ({ page }) => {
  await page.goto('/export/book')
  expect(page.url()).toContain('/signin')
})

test('/export/book redirect has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/export/book')
  // ends up on /signin after redirect
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
