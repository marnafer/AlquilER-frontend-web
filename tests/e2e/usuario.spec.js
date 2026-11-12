import { test, expect } from '@playwright/test';
import {
    ADMIN,
    INQUILINO,
    abrirNavbar,
    crearPropiedad,
    crearSesionApi,
    eliminarConsultasDePropiedad,
    eliminarPropiedad,
    eliminarReservasDePropiedad,
    limpiarFavoritos,
    login
} from './helpers';

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
    await page.locator('#acepta_privacidad').check();
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.toast-global')).toContainText(/Usuario registrado/i);
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
});

test('usuario: catalogo, detalle y favoritos', async ({ page, request }) => {
    // Arrancamos con la lista de favoritos limpia para que el test sea
    // determinista aunque se haya corrido antes.
    const sesion = await crearSesionApi(request, INQUILINO);
    try {
        await limpiarFavoritos(sesion);
    } finally {
        await sesion.dispose();
    }

    await login(page, INQUILINO);
    await page.goto('/propiedades');

    const card = page.locator('.propiedades-grid .propiedad-card').first();
    await expect(card).toBeVisible();

    const favBtn = card.locator('.propiedad-fav');
    await expect(favBtn).not.toHaveClass(/active/);

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

test('usuario: consulta y reserva desde el detalle', async ({ page, request }) => {
    // Propiedad determinística y sin reservas previas: el admin la publica y
    // el inquilino la consulta/reserva desde la UI.
    const admin = await crearSesionApi(request, ADMIN);
    const inquilino = await crearSesionApi(request, INQUILINO);
    const titulo = `Depto E2E Consulta Reserva ${Date.now()}`;
    let propiedadId = null;

    try {
        propiedadId = await crearPropiedad(admin, titulo);

        await login(page, INQUILINO);
        await page.goto(`/propiedades/${propiedadId}`);
        await expect(page.locator('.propiedad-detalle-header h1')).toContainText(titulo);

        // Consulta: el formulario ahora pide perfil del interesado.
        await page.getByRole('button', { name: 'Consultar' }).click();

        const fechaMudanza = new Date(Date.now() + 30 * 86400000)
            .toISOString()
            .slice(0, 10);

        await page.locator('#fecha-mudanza').fill(fechaMudanza);
        await page.locator('#cantidad-ocupantes').fill('2');
        await page.locator('#tiene-mascotas').selectOption('no');
        await page.locator('#mensaje-consulta').fill(
            'Hola, me interesa la propiedad. E2E Playwright.'
        );
        await page.getByRole('button', { name: 'Enviar consulta' }).click();
        await expect(page.getByText(/Consulta enviada correctamente/i)).toBeVisible();

        // Reserva: fechas futuras y sin solapamiento con otras reservas.
        const fInicio = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
        const fFin = new Date(Date.now() + 47 * 86400000).toISOString().slice(0, 10);

        await page.getByRole('button', { name: 'Reservar ahora' }).click();
        await page.locator('#fecha-inicio').fill(fInicio);
        await page.locator('#fecha-fin').fill(fFin);
        await page.getByRole('button', { name: 'Solicitar reserva' }).click();
        await expect(page.getByText(/Reserva solicitada correctamente/i)).toBeVisible();
    } finally {
        // La propiedad no se puede borrar con reservas activas: primero se
        // eliminan las reservas y consultas generadas por el test.
        if (propiedadId) {
            await eliminarReservasDePropiedad(inquilino, propiedadId);
            await eliminarConsultasDePropiedad(inquilino, propiedadId);
            await eliminarConsultasDePropiedad(admin, propiedadId);
        }
        await eliminarPropiedad(admin, propiedadId);
        await inquilino.dispose();
        await admin.dispose();
    }
});

test('usuario: la sesión sobrevive a un access cookie inválido (refresh automático)', async ({ page }) => {
    await login(page, INQUILINO);

    const origen = new URL(page.url()).origin;
    const cookies = await page.context().cookies();
    const cookieRefresh = cookies.find(cookie => cookie.name === 'refresh_token');
    expect(cookieRefresh?.httpOnly).toBe(true);

    // Simular expiración sin tocar la cookie HttpOnly de refresh.
    await page.context().addCookies([{
        name: 'access_token',
        value: 'token.falsificado.xyz',
        url: origen,
        httpOnly: true,
        secure: origen.startsWith('https:'),
        sameSite: 'Lax'
    }]);

    // El interceptor renueva el token y reintenta la petición (200 en vez de 401).
    const sondeo = await page.evaluate(async () => {
        const res = await fetch('/api/usuarios/me', {
            headers: { Authorization: 'Bearer token.falsificado.xyz' }
        });
        return { status: res.status };
    });
    expect(sondeo.status).toBe(200);

    // El nuevo access token sigue siendo HttpOnly y no se guarda en localStorage.
    const cookieAccess = (await page.context().cookies())
        .find(cookie => cookie.name === 'access_token');
    expect(cookieAccess?.httpOnly).toBe(true);
    expect(cookieAccess?.value).not.toBe('token.falsificado.xyz');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();

    await page.goto('/propiedades');
    await expect(page.locator('#basic-nav-dropdown')).toBeAttached({ timeout: 20000 });
    await abrirNavbar(page);
    await expect(page.locator('#basic-nav-dropdown')).toBeVisible();
});
