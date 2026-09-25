import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 45000,
    expect: { timeout: 15000 },
    fullyParallel: false,
    // La suite comparte una misma BD y usuarios e2e: un solo worker
    // evita carreras (ej: una propiedad creada por un test aparece
    // primera en el catálogo que usa otro test en paralelo).
    workers: 1,
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