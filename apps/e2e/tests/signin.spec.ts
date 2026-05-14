import { expect, test } from '@playwright/test'

test('signin page returns 200', async ({ page }) => {
  const response = await page.goto('/signin')
  expect(response?.status()).toBe(200)
})

test('signin page has heading "sign in."', async ({ page }) => {
  await page.goto('/signin')
  const h1 = page.locator('h1')
  await expect(h1).toContainText('sign in.')
})

test('signin page has email input', async ({ page }) => {
  await page.goto('/signin')
  const input = page.locator('input[type="email"]')
  await expect(input).toBeVisible()
})

test('signin page has submit button', async ({ page }) => {
  await page.goto('/signin')
  const btn = page.locator('button[type="submit"]')
  await expect(btn).toContainText('send the link')
})

test('signin page has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/signin')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('/today redirects to /signin when unauthenticated', async ({ page }) => {
  const response = await page.goto('/today')
  expect(page.url()).toContain('/signin')
  expect(response?.status()).toBe(200)
})

test('/log redirects to /signin when unauthenticated', async ({ page }) => {
  await page.goto('/log')
  expect(page.url()).toContain('/signin')
})

test('/settings redirects to /signin when unauthenticated', async ({ page }) => {
  await page.goto('/settings')
  expect(page.url()).toContain('/signin')
})
