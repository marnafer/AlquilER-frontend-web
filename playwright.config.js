import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 45000,
    expect: { timeout: 15000 },
    fullyParallel: false,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        viewport: { width: 1280, height: 900 },
        actionTimeout: 15000,
        trace: 'off'
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } }
    ]
});