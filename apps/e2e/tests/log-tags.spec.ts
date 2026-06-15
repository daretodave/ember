import { expect, test } from '@playwright/test'

test('/log redirects unauthenticated users to /signin (tag param)', async ({ page }) => {
  await page.goto('/log?tag=work')
  expect(page.url()).toContain('/signin')
})

test('/log?tag= redirect has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/log?tag=work')
  // lands on /signin after redirect
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
