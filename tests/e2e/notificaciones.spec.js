import { test, expect } from '@playwright/test';
import {
    ADMIN,
    INQUILINO,
    crearPropiedad,
    crearSesionApi,
    eliminarPropiedad,
    jsonDe,
    login
} from './helpers';

test('usuario: campanita muestra badge, dropdown y pagina de notificaciones', async ({ page, request }) => {
    const admin = await crearSesionApi(request, ADMIN);
    const inquilino = await crearSesionApi(request, INQUILINO);
    const titulo = `Depto E2E Notificaciones ${Date.now()}`;
    let propiedadId = null;
    let consultaId = null;

    try {
        // El inquilino publica y el admin consulta: el inquilino (propietario)
        // recibe la notificación "consulta_nueva".
        propiedadId = await crearPropiedad(inquilino, titulo);

        const consulta = await jsonDe(
            await admin.post('/api/consultas', {
                data: {
                    propiedad_id: propiedadId,
                    mensaje: 'Hola, me interesa. Consulta E2E de notificaciones.'
                }
            }),
            'Crear consulta'
        );
        consultaId = consulta.data.id;

        await login(page, INQUILINO);

        // La campanita es visible solo para rol usuario.
        const campanita = page.locator('.notif-btn');
        await expect(campanita).toBeVisible();

        // El badge cuenta las no leídas.
        const badge = page.locator('.notif-badge');
        await expect(badge).toContainText(/^[1-9]\d*$/);

        // El dropdown lista la notificación nueva.
        await campanita.click();
        const dropdown = page.locator('.notif-dropdown');
        await expect(dropdown).toBeVisible();
        await expect(dropdown).toContainText('Nueva consulta');

        // Marcar todas como leídas apaga el badge.
        await page.getByRole('button', { name: 'Marcar todas leídas' }).click();
        await expect(badge).toBeHidden();

        // "Ver todas" lleva a la página de notificaciones.
        await page.locator('.notif-footer a').click();
        await expect(page).toHaveURL(/\/notificaciones/);
        await expect(page.getByText('Nueva consulta').first()).toBeVisible();
    } finally {
        // Limpieza: no dejar rastro en la BD compartida.
        if (consultaId) {
            await admin.delete(`/api/consultas/${consultaId}`).catch(() => {});
        }
        await eliminarPropiedad(inquilino, propiedadId);
        await inquilino.dispose();
        await admin.dispose();
    }
});
