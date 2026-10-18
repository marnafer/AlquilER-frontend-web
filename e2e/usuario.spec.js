import { test, expect } from '@playwright/test';

const INQUILINO = { email: 'e2e.inquilino@test.com', contrasena: 'E2e123456' };

async function login(page) {
    await page.goto('/login');
    await page.locator('#email').fill(INQUILINO.email);
    await page.locator('#password').fill(INQUILINO.contrasena);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.locator('#basic-nav-dropdown')).toBeVisible();
}

test('usuario: registro con cuenta nueva muestra toast y redirige a login', async ({ page }) => {
    const email = `e2e.reg.${Date.now()}@test.com`;
    await page.goto('/register');
    await page.locator('#nombre').fill('E2E Registro');
    await page.locator('#apellido').fill('Prueba');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('E2e123456');
    await page.locator('#password_confirm').fill('E2e123456');
    await page.locator('#telefono').fill('1155558899');
    await page.locator('#domicilio').fill('Calle 1234 test');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.toast-global.success')).toContainText(/Usuario registrado correctamente/i);
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
});

test('usuario: catalogo, detalle y favoritos', async ({ page }) => {
    await login(page);
    await page.goto('/propiedades');

    const card = page.locator('.propiedades-grid .propiedad-card').first();
    await expect(card).toBeVisible();

    const favBtn = card.locator('.propiedad-fav');
    await favBtn.click();
    await expect(favBtn).toHaveClass(/active/);

    await card.locator('.btn-ver').click();
    await expect(page.locator('.propiedad-detalle-header h1')).toBeVisible();

    await page.goto('/favoritos');
    const favCard = page.locator('.propiedad-card').first();
    await expect(favCard).toBeVisible();
    await favCard.locator('.propiedad-fav').click();
    await expect(page.locator('.propiedad-card')).toHaveCount(0);
});

test('usuario: consulta y reserva desde el detalle', async ({ page }) => {
    await login(page);
    await page.goto('/propiedades');

    const disponible = page.locator('.propiedades-grid .propiedad-card:has(.propiedad-badge.disponible)').first();
    await expect(disponible).toBeVisible();
    await disponible.locator('.btn-ver').click();
    await expect(page.locator('.propiedad-detalle-header h1')).toBeVisible();

    await page.getByRole('button', { name: 'Consultar' }).click();
    await page.locator('#mensaje-consulta').fill('Hola, me interesa la propiedad. E2E Playwright.');
    await page.getByRole('button', { name: 'Enviar consulta' }).click();
    await expect(page.getByText(/Consulta enviada correctamente/i)).toBeVisible();

    const fInicio = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
    const fFin = new Date(Date.now() + 47 * 86400000).toISOString().slice(0, 10);
    await page.getByRole('button', { name: 'Reservar ahora' }).click();
    await page.locator('#fecha-inicio').fill(fInicio);
    await page.locator('#fecha-fin').fill(fFin);
    await page.getByRole('button', { name: 'Solicitar reserva' }).click();
    await expect(page.getByText(/Reserva solicitada correctamente/i)).toBeVisible();
});

test('usuario: la sesión sobrevive a un access token inválido (refresh automático)', async ({ page }) => {
    await login(page);

    // Simular expiración: corromper el access token dejando intacto el refresh_token
    await page.evaluate(() => localStorage.setItem('token', 'token.falsificado.xyz'));

    // El interceptor renueva el token y reintenta la petición (200 en vez de 401)
    const sondeo = await page.evaluate(async () => {
        const res = await fetch('/api/usuarios/me', { headers: { 'Authorization': 'Bearer token.falsificado.xyz' } });
        return { status: res.status };
    });
    expect(sondeo.status).toBe(200);

    // El nuevo token queda guardado (JWT válido) y la sesión sigue activa
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('token'))).not.toBe('token.falsificado.xyz');
    const tokenNuevo = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenNuevo.split('.')).toHaveLength(3);

    await page.goto('/propiedades');
    await expect(page.locator('#basic-nav-dropdown')).toBeVisible({ timeout: 15000 });
});