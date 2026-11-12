import { test, expect } from '@playwright/test';
import {
    ADMIN,
    INQUILINO,
    actualizarPropiedad,
    crearPropiedad,
    crearSesionApi,
    datosPropiedad,
    eliminarPropiedad,
    esperarDestacadasDelHome,
    idsDestacadas,
    jsonDe,
    leerPropiedad,
    loginAdmin,
    posicionEnCarrusel
} from './helpers';

test('destacadas: el admin marca una propiedad y el Home la muestra en su seccion', async ({ page, request }) => {
    const admin = await crearSesionApi(request, ADMIN);
    const inquilino = await crearSesionApi(request, INQUILINO);
    const titulo = `Depto E2E Destacada ${Date.now()}`;
    let propiedadId = null;

    try {
        propiedadId = await crearPropiedad(inquilino, titulo);

        // Por defecto una propiedad recién creada no está destacada.
        expect((await leerPropiedad(inquilino, propiedadId)).destacada).toBe(false);
        expect(await idsDestacadas(admin)).not.toContain(Number(propiedadId));

        // El admin sí puede destacarla.
        await jsonDe(
            await actualizarPropiedad(admin, propiedadId, { destacada: 1 }),
            'Destacar propiedad'
        );

        expect((await leerPropiedad(admin, propiedadId)).destacada).toBe(true);

        const destacadas = await idsDestacadas(admin);
        expect(destacadas).toContain(Number(propiedadId));

        // El panel admin muestra el badge y el select refleja el valor.
        await loginAdmin(page);
        await page.goto('/admin/propiedades');
        await page.locator('.admin-buscador').fill(titulo);

        const fila = page.locator('table.admin-tabla tbody tr').filter({ hasText: titulo });
        await expect(fila).toHaveCount(1);
        await expect(fila.locator('.admin-badge', { hasText: 'Destacada' })).toBeVisible();

        await fila.locator('.admin-btn.editar').click();
        await expect(page.locator('#campo-destacada')).toHaveValue('1');

        // El Home la ubica entre las destacadas (primeras posiciones del carrusel).
        await page.goto('/');
        await esperarDestacadasDelHome(page);

        const posicion = await posicionEnCarrusel(page, titulo);
        expect(posicion).toBeGreaterThanOrEqual(0);
        expect(posicion).toBeLessThan(destacadas.length);

        // Desdestacar desde el panel saca la propiedad del grupo de destacadas.
        await page.goto('/admin/propiedades');
        await page.locator('.admin-buscador').fill(titulo);

        const fila2 = page.locator('table.admin-tabla tbody tr').filter({ hasText: titulo });
        await expect(fila2).toHaveCount(1);
        await fila2.locator('.admin-btn.editar').click();
        await page.locator('#campo-destacada').selectOption('0');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.locator('#campo-destacada')).toHaveCount(0);

        await expect(fila2.locator('.admin-badge', { hasText: 'Destacada' })).toHaveCount(0);

        const destacadasFinal = await idsDestacadas(admin);
        expect(destacadasFinal).not.toContain(Number(propiedadId));

        // En el Home deja de estar antes de las demás destacadas. Puede seguir
        // apareciendo más abajo porque el carrusel completa con recientes.
        await page.goto('/');
        await esperarDestacadasDelHome(page);

        const posicionFinal = await posicionEnCarrusel(page, titulo);
        if (posicionFinal !== -1) {
            expect(posicionFinal).toBeGreaterThanOrEqual(destacadasFinal.length);
        }
    } finally {
        await eliminarPropiedad(inquilino, propiedadId);
        await inquilino.dispose();
        await admin.dispose();
    }
});

test('destacadas: un usuario comun no puede destacarla aunque lo pida por API', async ({ request }) => {
    const admin = await crearSesionApi(request, ADMIN);
    const inquilino = await crearSesionApi(request, INQUILINO);
    const titulo = `Depto E2E No Destacable ${Date.now()}`;
    let propiedadId = null;
    let creadaId = null;

    try {
        propiedadId = await crearPropiedad(inquilino, titulo);

        // Enviar solo "destacada" no deja campos actualizables: el servidor
        // descarta el campo y responde 400 en vez de destacarla.
        const soloDestacada = await actualizarPropiedad(inquilino, propiedadId, { destacada: 1 });
        expect(soloDestacada.status()).toBe(400);
        expect((await leerPropiedad(inquilino, propiedadId)).destacada).toBe(false);

        // Mezclado con un campo real, el update se aplica pero la "destacada"
        // del usuario común se ignora en silencio.
        await jsonDe(
            await actualizarPropiedad(inquilino, propiedadId, {
                destacada: 1,
                precio: 111000
            }),
            'Actualizar propiedad como usuario común'
        );

        const actualizada = await leerPropiedad(inquilino, propiedadId);
        expect(actualizada.destacada).toBe(false);
        expect(Number(actualizada.precio)).toBe(111000);
        expect(await idsDestacadas(admin)).not.toContain(Number(propiedadId));

        // Tampoco puede escribirse al crear.
        const creada = await jsonDe(
            await inquilino.post('/api/propiedades', {
                data: datosPropiedad(`${titulo} (creada con destacada)`, { destacada: 1 })
            }),
            'Crear propiedad con destacada como usuario común'
        );
        creadaId = creada.data.id;
        expect((await leerPropiedad(inquilino, creadaId)).destacada).toBe(false);

        // El admin sí la puede destacar: lo anterior se debe al rol y no al
        // estado previo de la fila.
        await jsonDe(
            await actualizarPropiedad(admin, creadaId, { destacada: 1 }),
            'Destacar propiedad como admin'
        );
        expect((await leerPropiedad(admin, creadaId)).destacada).toBe(true);
    } finally {
        await eliminarPropiedad(inquilino, creadaId);
        await eliminarPropiedad(inquilino, propiedadId);
        await inquilino.dispose();
        await admin.dispose();
    }
});
