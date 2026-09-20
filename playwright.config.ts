import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: '*.spec.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100', screenshot: 'only-on-failure', trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined } },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }, { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } }],
  webServer: { command: 'node --import tsx tests/e2e/server.ts', port: 3100, reuseExistingServer: false }
});
