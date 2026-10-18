import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    { name: 'movil-390',   use: { browserName: 'chromium', viewport: { width: 390,  height: 844 } } },
    { name: 'tablet-768',  use: { browserName: 'chromium', viewport: { width: 768,  height: 1024 } } },
    { name: 'desktop-1024',use: { browserName: 'chromium', viewport: { width: 1024, height: 768 } } },
    { name: 'desktop-1440',use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});