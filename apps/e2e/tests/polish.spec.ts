import { expect, test } from '@playwright/test'

test('unknown route returns 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
})

test('not-found page has a link to home', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')
  const homeLink = page.locator('a[href="/"]')
  await expect(homeLink.first()).toBeVisible()
})

test('not-found page shows error code', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')
  await expect(page.locator('text=404')).toBeVisible()
})

test('not-found page has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/this-page-does-not-exist')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
