import { expect, test } from '@playwright/test'

test('/today redirects unauthenticated users to /signin', async ({ page }) => {
  const response = await page.goto('/today')
  // middleware redirects → lands on /signin with 200
  expect(page.url()).toContain('/signin')
  expect(response?.status()).toBe(200)
})

test('/today redirect target has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/today')
  // ends up on /signin after redirect
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('/log redirects unauthenticated users to /signin', async ({ page }) => {
  await page.goto('/log')
  expect(page.url()).toContain('/signin')
})
