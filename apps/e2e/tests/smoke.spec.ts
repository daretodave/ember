import { expect, test } from '@playwright/test'

test('home page returns 200', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})

test('landing page has correct heading', async ({ page }) => {
  await page.goto('/')
  const h1 = page.locator('h1')
  await expect(h1).toContainText('ten minutes of')
  await expect(h1).toContainText('intention')
})

test('landing page shows seven-day preview section', async ({ page }) => {
  await page.goto('/')
  const h2 = page.locator('h2')
  await expect(h2).toContainText('the next seven days')
})

test('landing page has sign-in CTA', async ({ page }) => {
  await page.goto('/')
  const ctaBtn = page.locator('a[href="/signin"]').last()
  await expect(ctaBtn).toContainText('sign in to start')
})

test('landing page has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
