import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:8000';
const INQUILINO = { email: 'e2e.inquilino@test.com', contrasena: 'E2e123456' };
const ADMIN = { email: 'e2e.admin@test.com', contrasena: 'E2e123456' };

async function apiLogin(request, credenciales) {
    const res = await request.post(`${API}/api/autenticador/login`, {
        data: credenciales
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    return body.data.access_token;
}

async function loginComoInquilino(page) {
    await page.goto('/login');
    await page.locator('#email').fill(INQUILINO.email);
    await page.locator('#password').fill(INQUILINO.contrasena);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.locator('#basic-nav-dropdown')).toBeVisible();
}

test('usuario: campanita muestra badge, dropdown y pagina de notificaciones', async ({ page, request }) => {
    // Setup vía API: el inquilino publica una propiedad y el admin
    // la consulta -> el inquilino (propietario) recibe "consulta_nueva".
    const tokenInquilino = await apiLogin(request, INQUILINO);
    const tokenAdmin = await apiLogin(request, ADMIN);

    const propRes = await request.post(`${API}/api/propiedades`, {
        headers: { Authorization: `Bearer ${tokenInquilino}` },
        data: {
            titulo: 'Depto E2E Notificaciones',
            descripcion: 'Propiedad creada por el test e2e de notificaciones.',
            precio: 100000,
            expensas: 0,
            direccion: 'Calle E2E 123',
            cantidad_ambientes: 2,
            cantidad_dormitorios: 1,
            cantidad_banos: 1,
            capacidad: 2,
            disponible: true,
            categoria_id: 1,
            localidad_id: 1
        }
    });
    expect(propRes.ok()).toBeTruthy();
    const propiedadId = (await propRes.json()).data.id;

    const consultaRes = await request.post(`${API}/api/consultas`, {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
        data: {
            propiedad_id: propiedadId,
            mensaje: 'Hola, me interesa. Consulta E2E de notificaciones.'
        }
    });
    expect(consultaRes.ok()).toBeTruthy();
    const consultaId = (await consultaRes.json()).data.id;

    try {
        await loginComoInquilino(page);

        // La campanita es visible solo para rol usuario
        const campanita = page.locator('.notif-btn');
        await expect(campanita).toBeVisible();

        // El badge cuenta las no leídas
        const badge = page.locator('.notif-badge');
        await expect(badge).toContainText(/^[1-9]\d*$/);

        // El dropdown lista la notificación nueva
        await campanita.click();
        const dropdown = page.locator('.notif-dropdown');
        await expect(dropdown).toBeVisible();
        await expect(dropdown).toContainText('Nueva consulta');

        // Marcar todas como leídas apaga el badge
        await page.getByRole('button', { name: 'Marcar todas leídas' }).click();
        await expect(badge).toBeHidden();

        // "Ver todas" lleva a la página de notificaciones
        await page.locator('.notif-footer a').click();
        await expect(page).toHaveURL(/\/notificaciones/);
        await expect(page.getByText('Nueva consulta').first()).toBeVisible();
    } finally {
        // Limpieza: no dejar rastro en la BD compartida
        await request.delete(`${API}/api/consultas/${consultaId}`, {
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        await request.delete(`${API}/api/propiedades/${propiedadId}`, {
            headers: { Authorization: `Bearer ${tokenInquilino}` }
        });
    }
});
