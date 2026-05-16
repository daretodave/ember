import { expect, test } from '@playwright/test'

test('landing page has X-Content-Type-Options header', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.headers()['x-content-type-options']).toBe('nosniff')
})

test('signin page has X-Content-Type-Options header', async ({ page }) => {
  const response = await page.goto('/signin')
  expect(response?.headers()['x-content-type-options']).toBe('nosniff')
})

test('landing page has X-Frame-Options header', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.headers()['x-frame-options']).toBe('SAMEORIGIN')
})
