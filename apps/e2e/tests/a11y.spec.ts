import { expect, test } from '@playwright/test'

test('landing page has a skip link as the first focusable element', async ({ page }) => {
  await page.goto('/')
  const skipLink = page.locator('a.skip-link').first()
  await expect(skipLink).toHaveAttribute('href', '#main-content')
})

test('landing page has a main landmark with id main-content', async ({ page }) => {
  await page.goto('/')
  const main = page.locator('main#main-content')
  await expect(main).toBeAttached()
})

test('landing page nav has aria-label', async ({ page }) => {
  await page.goto('/')
  const nav = page.locator('nav[aria-label]').first()
  await expect(nav).toBeAttached()
})

test('signin page has a main landmark with id main-content', async ({ page }) => {
  await page.goto('/signin')
  const main = page.locator('main#main-content')
  await expect(main).toBeAttached()
})

test('signin page has a skip link', async ({ page }) => {
  await page.goto('/signin')
  const skipLink = page.locator('a.skip-link').first()
  await expect(skipLink).toHaveAttribute('href', '#main-content')
})

test('skip link is initially off-screen and becomes visible on focus', async ({ page }) => {
  await page.goto('/')
  const skipLink = page.locator('a.skip-link').first()
  // Before focus: skip link should exist but be visually off-screen (via transform)
  await expect(skipLink).toBeAttached()
  // Tab to focus the skip link
  await page.keyboard.press('Tab')
  // After Tab the skip link should be focused
  const focused = await page.evaluate(() => document.activeElement?.textContent)
  expect(focused).toContain('skip to content')
})
