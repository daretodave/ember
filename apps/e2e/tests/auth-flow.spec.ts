import { expect, test } from '@playwright/test'

// Sentinel content written by the write test — stable across runs so
// the reload-persistence check is a deterministic string comparison.
const WRITE_CONTENT = 'e2e write test — today'

// Today's UTC date in YYYY-MM-DD, evaluated once at module load.
const TODAY = new Date().toISOString().slice(0, 10)

// Confirm an authenticated session is present (cookies set by globalSetup).
// Tests skip gracefully when Supabase secrets are absent (e.g. fork PRs).
function skipIfNoAuth(cookies: Array<{ name: string }>) {
  const hasSession = cookies.some((c) => c.name.startsWith('sb-'))
  if (!hasSession) {
    test.skip(true, 'no Supabase session cookie — skipping authenticated test')
  }
}

// Serial so tests share server-side state in order:
//   1. write (creates/updates the bot user's entry for today)
//   2. log  (entry must exist for mosaic to show a filled tile)
//   3. edit (entry must exist for the edit surface to render)
test.describe.serial('authenticated flows', () => {
  test('/today — write flow with persistence', async ({ page }) => {
    const cookies = await page.context().cookies()
    skipIfNoAuth(cookies)

    await page.goto('/today')
    await expect(page).toHaveURL(/\/today/)

    // Should see the prompt heading, not a redirect page
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // Fill the entry textarea with the sentinel string
    const textarea = page.locator('#today-entry-response')
    await expect(textarea).toBeVisible()
    await textarea.fill(WRITE_CONTENT)

    // Save the entry (scope to main section — the focus overlay has a duplicate)
    await page.locator('section[aria-label="today\'s entry"] button[title="saves the current entry."]').click()

    // Wait for the save indicator to reflect a confirmed server save (scoped to main section)
    const indicator = page.locator('section[aria-label="today\'s entry"] [aria-live="polite"]')
    await expect(indicator).toContainText('last saved', { timeout: 15_000 })

    // Reload and confirm the server persisted the content
    await page.reload()
    const restored = page.locator('#today-entry-response')
    await expect(restored).toHaveValue(WRITE_CONTENT)
  })

  test('/log — mosaic visible and entry list shows', async ({ page }) => {
    const cookies = await page.context().cookies()
    skipIfNoAuth(cookies)

    await page.goto('/log')
    await expect(page).toHaveURL(/\/log$/)

    // Page heading present
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // Mosaic renders — the aria-label on the mosaic group
    const mosaic = page.locator('[aria-label="60-day practice mosaic"]')
    await expect(mosaic).toBeVisible()

    // Today's tile exists as a link to /log/<today>
    const todayLink = page.locator(`a[href="/log/${TODAY}"]`)
    await expect(todayLink.first()).toBeVisible()

    // The entry written in test 1 should appear in the most-recent article
    const article = page.locator('article[aria-label="most recent entry"]')
    await expect(article).toBeVisible()
    await expect(article).toContainText(WRITE_CONTENT)
  })

  test('/log/[date] — edit flow updates entry text', async ({ page }) => {
    const cookies = await page.context().cookies()
    skipIfNoAuth(cookies)

    await page.goto(`/log/${TODAY}`)
    await expect(page).toHaveURL(new RegExp(`/log/${TODAY}`))

    // Heading (the prompt) should be visible
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // Edit button should be present (entry exists from write test)
    const editBtn = page.locator('button', { hasText: 'edit' })
    await expect(editBtn).toBeVisible()
    await editBtn.click()

    // Edit textarea appears with the saved content
    const editTextarea = page.locator('textarea')
    await expect(editTextarea).toBeVisible()
    await expect(editTextarea).toHaveValue(WRITE_CONTENT)

    // Update the content
    const updatedContent = `${WRITE_CONTENT} (edited)`
    await editTextarea.fill(updatedContent)

    // Save
    await page.locator('button', { hasText: 'save' }).last().click()

    // Wait for save to complete — edit mode exits and the response is shown
    await expect(editBtn).toBeVisible({ timeout: 15_000 })

    // Updated content is displayed in the view (edit mode closed)
    const entryResponse = page.locator('[class*="entryResponse"]')
    await expect(entryResponse).toContainText(updatedContent)

    // updated_at moved — the footer save time is shown in the indicator
    // (we verify by checking the edit button re-appeared, which means save succeeded)
  })
})
