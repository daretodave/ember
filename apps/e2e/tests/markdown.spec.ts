import { expect, test } from '@playwright/test'

test('/log redirects unauthenticated users (markdown gate smoke)', async ({ page }) => {
  await page.goto('/log')
  expect(page.url()).toContain('/signin')
})

test('/log/[date] redirects unauthenticated users (markdown gate smoke)', async ({ page }) => {
  await page.goto('/log/2026-01-01')
  expect(page.url()).toContain('/signin')
})
