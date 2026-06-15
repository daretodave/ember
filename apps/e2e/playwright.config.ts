import { resolve } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const rootDir = resolve(__dirname, '../..')

export default defineConfig({
  globalSetup: './globalSetup.ts',
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/auth-flow.spec.ts',
    },
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      testMatch: '**/auth-flow.spec.ts',
    },
  ],
  webServer: {
    command: 'node_modules/.bin/next start',
    cwd: rootDir,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
