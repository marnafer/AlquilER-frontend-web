import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const ADMIN = { email: 'e2e.admin@test.com', contrasena: 'E2e123456' };
const INQUILINO = { email: 'e2e.inquilino@test.com', contrasena: 'E2e123456' };

async function login(page, { email, contrasena }) {
    await page.goto('/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(contrasena);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.locator('#basic-nav-dropdown')).toBeVisible();
}

test('admin: login valido, menu de administracion y acceso al panel', async ({ page }) => {
    await login(page, ADMIN);

    const adminDropdown = page.locator('#admin-nav-dropdown');
    await expect(adminDropdown).toBeVisible();
    await adminDropdown.click();
    await page.getByText('Panel', { exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator('main').first()).toBeVisible();
});

test('admin: un usuario comun no puede entrar a /admin', async ({ page }) => {
    await login(page, INQUILINO);

    await page.goto('/admin');
    await expect(page).toHaveURL('/');
});

test('admin: panel de propiedades carga, filtra, exporta CSV y usa papelera', async ({ page }) => {
    await login(page, ADMIN);
    await page.goto('/admin/propiedades');

    const tabla = page.locator('table.admin-tabla');
    await expect(tabla).toBeVisible();
    await expect(page.locator('.admin-tabla-total')).toContainText(/registros/);

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('.admin-btn-exportar').click()
    ]);
    expect(download.suggestedFilename()).toMatch(/propiedades.*\.csv$/i);
    const contenido = fs.readFileSync(await download.path(), 'utf8');
    expect(contenido).toContain(';');
    expect(contenido).not.toContain('<');
    expect(contenido).toContain('\ufeff');

    const buscador = page.locator('.admin-buscador');
    await buscador.fill('zzz-inexistente');
    await expect(tabla.locator('tbody tr')).toHaveCount(0);
    await buscador.fill('');
    await expect(tabla.locator('tbody tr').first()).toBeVisible();

    await page.getByRole('button', { name: 'Papelera' }).click();
    await expect(page.locator('.alert-info')).toContainText(/papelera/i);
    await page.getByRole('button', { name: 'Ver activos' }).click();
    await expect(tabla.locator('tbody tr').first()).toBeVisible();
});