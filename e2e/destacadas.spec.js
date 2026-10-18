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

async function crearPropiedad(request, token, titulo) {
    const res = await request.post(`${API}/api/propiedades`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
            titulo,
            descripcion: 'Propiedad creada por el test e2e de destacadas.',
            precio: 120000,
            expensas: 0,
            direccion: 'Calle Destacada 456',
            cantidad_ambientes: 3,
            cantidad_dormitorios: 2,
            cantidad_banos: 1,
            capacidad: 4,
            disponible: true,
            categoria_id: 1,
            localidad_id: 1
        }
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()).data.id;
}

async function actualizarPropiedad(request, token, id, data) {
    const res = await request.put(`${API}/api/propiedades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data
    });
    expect(res.ok()).toBeTruthy();
}

async function leerPropiedad(request, id) {
    const res = await request.get(`${API}/api/propiedades/${id}`);
    expect(res.ok()).toBeTruthy();
    return (await res.json()).data;
}

async function destacadasIds(request) {
    const res = await request.get(`${API}/api/propiedades/destacadas`);
    expect(res.ok()).toBeTruthy();
    return (await res.json()).data.items.map(p => p.id);
}

async function loginComoAdmin(page) {
    await page.goto('/login');
    await page.locator('#email').fill(ADMIN.email);
    await page.locator('#password').fill(ADMIN.contrasena);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.locator('#basic-nav-dropdown')).toBeVisible();
}

test('destacadas: el admin marca una propiedad y el Home la muestra en su seccion', async ({ page, request }) => {
    const tokenInquilino = await apiLogin(request, INQUILINO);
    const tokenAdmin = await apiLogin(request, ADMIN);

    const titulo = `Depto E2E Destacada ${Date.now()}`;
    const propiedadId = await crearPropiedad(request, tokenInquilino, titulo);

    try {
        // Por defecto una propiedad recien creada no esta destacada
        expect((await leerPropiedad(request, propiedadId)).destacada).toBe(false);
        expect(await destacadasIds(request)).not.toContain(propiedadId);

        // El admin si puede destacarla
        await actualizarPropiedad(request, tokenAdmin, propiedadId, { destacada: 1 });
        expect((await leerPropiedad(request, propiedadId)).destacada).toBe(true);
        expect(await destacadasIds(request)).toContain(propiedadId);

        // El panel admin muestra el badge y el select refleja el valor
        await loginComoAdmin(page);
        await page.goto('/admin/propiedades');
        await page.locator('.admin-buscador').fill(titulo);

        const fila = page.locator('table.admin-tabla tbody tr').filter({ hasText: titulo });
        await expect(fila).toHaveCount(1);
        await expect(fila.locator('.admin-badge', { hasText: 'Destacada' })).toBeVisible();

        await fila.locator('.admin-btn.editar').click();
        await expect(page.locator('#campo-destacada')).toHaveValue('1');

        // El Home ya no cae en el fallback de "Propiedades Recientes"
        await page.goto('/');
        await expect(page.locator('.propiedades-destacadas h2')).toHaveText('Propiedades Destacadas');
        await expect(page.locator('.propiedades-destacadas .propiedad-card').filter({ hasText: titulo })).toHaveCount(1);

        // Desdestacar desde el panel saca la propiedad del Home
        await page.goto('/admin/propiedades');
        await page.locator('.admin-buscador').fill(titulo);
        const fila2 = page.locator('table.admin-tabla tbody tr').filter({ hasText: titulo });
        await fila2.locator('.admin-btn.editar').click();
        await page.locator('#campo-destacada').selectOption('0');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.locator('#campo-destacada')).toHaveCount(0);

        await expect(fila2.locator('.admin-badge', { hasText: 'Destacada' })).toHaveCount(0);
        expect(await destacadasIds(request)).not.toContain(propiedadId);

        await page.goto('/');
        await expect(page.locator('.propiedades-destacadas .propiedad-card').filter({ hasText: titulo })).toHaveCount(0);
    } finally {
        await request.delete(`${API}/api/propiedades/${propiedadId}`, {
            headers: { Authorization: `Bearer ${tokenInquilino}` }
        });
    }
});

test('destacadas: un usuario comun no puede destacarla aunque lo pida por API', async ({ request }) => {
    const tokenInquilino = await apiLogin(request, INQUILINO);
    const tokenAdmin = await apiLogin(request, ADMIN);

    const titulo = `Depto E2E No Destacable ${Date.now()}`;
    const propiedadId = await crearPropiedad(request, tokenInquilino, titulo);
    let creadaId = null;

    try {
        // Enviar solo "destacada" no deja campos actualizables: el servidor
        // descarta el campo y responde 400 en vez de destacarla.
        const soloDestacada = await request.put(`${API}/api/propiedades/${propiedadId}`, {
            headers: { Authorization: `Bearer ${tokenInquilino}` },
            data: { destacada: 1 }
        });
        expect(soloDestacada.status()).toBe(400);
        expect((await leerPropiedad(request, propiedadId)).destacada).toBe(false);

        // Mezclado con un campo real, el update se aplica pero la
        // "destacada" del usuario comun se ignora en silencio.
        await actualizarPropiedad(request, tokenInquilino, propiedadId, {
            destacada: 1,
            precio: 111000
        });
        const actualizada = await leerPropiedad(request, propiedadId);
        expect(actualizada.destacada).toBe(false);
        expect(actualizada.precio).toBe(111000);
        expect(await destacadasIds(request)).not.toContain(propiedadId);

        // Tampoco puede escribirse al crear
        const res = await request.post(`${API}/api/propiedades`, {
            headers: { Authorization: `Bearer ${tokenInquilino}` },
            data: {
                titulo: `${titulo} (creada con destacada)`,
                descripcion: 'Intento de crear ya destacada como usuario comun.',
                precio: 90000,
                expensas: 0,
                direccion: 'Calle Destacada 789',
                cantidad_ambientes: 2,
                cantidad_dormitorios: 1,
                cantidad_banos: 1,
                capacidad: 2,
                disponible: true,
                destacada: 1,
                categoria_id: 1,
                localidad_id: 1
            }
        });
        expect(res.ok()).toBeTruthy();
        creadaId = (await res.json()).data.id;
        expect((await leerPropiedad(request, creadaId)).destacada).toBe(false);

        // El admin si la puede destacar, para confirmar que lo anterior
        // se debe al rol y no al estado previo de la fila
        await actualizarPropiedad(request, tokenAdmin, creadaId, { destacada: 1 });
        expect((await leerPropiedad(request, creadaId)).destacada).toBe(true);
    } finally {
        if (creadaId) {
            await request.delete(`${API}/api/propiedades/${creadaId}`, {
                headers: { Authorization: `Bearer ${tokenInquilino}` }
            });
        }
        await request.delete(`${API}/api/propiedades/${propiedadId}`, {
            headers: { Authorization: `Bearer ${tokenInquilino}` }
        });
    }
});
