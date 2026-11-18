import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  // La suite comparte la base de datos de desarrollo y el carrusel del Home:
  // correr un test a la vez evita carreras entre proyectos y logins.
  workers: 1,
  fullyParallel: false,
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
  webServer: [
    {
      // Backend de desarrollo. Se reutiliza si ya está levantado (por ejemplo,
      // con el servidor de siempre) y si no, Playwright lo inicia con las
      // variables que necesitan los E2E: cookies no Secure sobre HTTP (por eso
      // APP_ENV=development) y sin límite de peticiones.
      name: 'backend',
      command: 'php -d variables_order=EGPCS -S 127.0.0.1:8000 router-dev.php',
      cwd: '../AlquilER/public',
      env: {
        APP_ENV: 'development',
        APP_DEBUG: 'true',
        MAIL_HOST: '127.0.0.1',
        MAIL_PORT: '1025',
        MAIL_ENCRYPTION: 'none',
        DISABLE_RATE_LIMIT: '1',
      },
      port: 8000,
      reuseExistingServer: true,
      timeout: 30000,
      // El servidor de desarrollo loguea cada request por stderr; con la suite
      // completa eso tapa el reporte de Playwright.
      stdout: 'ignore',
      stderr: 'ignore',
    },
    {
      name: 'smtp',
      command: 'node tests/e2e/smtp-server.cjs',
      port: 1025,
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 3000',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
