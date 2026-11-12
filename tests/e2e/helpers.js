import { expect, request as playwrightRequest } from '@playwright/test';

export const ADMIN = { email: 'e2e.admin@test.com', contrasena: 'E2e123456' };
export const INQUILINO = { email: 'e2e.inquilino@test.com', contrasena: 'E2e123456' };

export const API_URL = process.env.E2E_API_URL || 'http://127.0.0.1:8000';
export const E2E_ORIGIN = process.env.E2E_ORIGIN || 'http://127.0.0.1:3000';

const POR_PAGINA_CARRUSEL = 4;

// ============================================
// SESIONES DE API
// ============================================

/**
 * Crea un contexto HTTP aislado con su propia cookie jar y lo deja logueado.
 * Cada rol necesita su contexto: si se reutiliza uno solo, el segundo login
 * pisa las cookies del primero.
 */
export async function crearSesionApi(request, credenciales) {
    const sesion = await playwrightRequest.newContext({
        baseURL: API_URL,
        // CookieCsrfMiddleware exige un Origin permitido en los métodos que
        // escriben y viajan con cookies de autenticación.
        extraHTTPHeaders: {
            Accept: 'application/json',
            Origin: E2E_ORIGIN
        }
    });

    const res = await sesion.post('/api/autenticador/login', {
        data: credenciales
    });

    if (!res.ok()) {
        const detalle = await res.text().catch(() => '');
        await sesion.dispose();
        throw new Error(`Login API falló (${res.status()}): ${detalle}`);
    }

    return sesion;
}

export async function jsonDe(res, contexto) {
    if (!res.ok()) {
        const detalle = await res.text().catch(() => '');
        throw new Error(`${contexto} falló (${res.status()}): ${detalle}`);
    }
    return res.json();
}

// ============================================
// LOGIN EN EL NAVEGADOR
// ============================================

/**
 * En pantallas menores a 992px el navbar colapsa y el menú de usuario queda
 * oculto. El helper abre el collapse cuando hace falta.
 */
export async function abrirNavbar(page) {
    const toggler = page.locator('.navbar-toggler');
    if (!(await toggler.isVisible())) return;

    const collapse = page.locator('#basic-navbar-nav');
    const abierto = await collapse.evaluate(el => el.classList.contains('show'));
    if (abierto) return;

    await toggler.click();
    await expect(collapse).toHaveClass(/show/);
}

export async function login(page, credenciales) {
    await page.goto('/login');
    await page.locator('#email').fill(credenciales.email);
    await page.locator('#password').fill(credenciales.contrasena);

    await Promise.all([
        page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 20000 }),
        page.getByRole('button', { name: 'Iniciar sesión' }).click()
    ]);

    await expect(page.locator('#basic-nav-dropdown')).toBeAttached({ timeout: 20000 });
    await abrirNavbar(page);
}

export async function loginAdmin(page) {
    await login(page, ADMIN);
    await expect(page.locator('#admin-nav-dropdown')).toBeAttached({ timeout: 20000 });
    await abrirNavbar(page);
}

// ============================================
// DATOS DE PRUEBA
// ============================================

export function datosPropiedad(titulo, overrides = {}) {
    return {
        titulo,
        descripcion: 'Propiedad creada por la suite E2E de AlquilER.',
        precio: 120000,
        expensas: 0,
        direccion: 'Calle E2E 456',
        cantidad_ambientes: 3,
        cantidad_dormitorios: 2,
        cantidad_banos: 1,
        capacidad: 4,
        disponible: 1,
        acepta_mascotas: 1,
        acepta_hijos: 1,
        categoria_id: 1,
        localidad_id: 1,
        ...overrides
    };
}

export async function crearPropiedad(sesion, titulo, overrides = {}) {
    const res = await sesion.post('/api/propiedades', {
        data: datosPropiedad(titulo, overrides)
    });
    const body = await jsonDe(res, 'Crear propiedad');
    return body.data.id;
}

export async function leerPropiedad(sesion, id) {
    const res = await sesion.get(`/api/propiedades/${id}`);
    const body = await jsonDe(res, 'Leer propiedad');
    return body.data;
}

export async function actualizarPropiedad(sesion, id, data) {
    return sesion.put(`/api/propiedades/${id}`, { data });
}

export async function idsDestacadas(sesion) {
    const res = await sesion.get('/api/propiedades/destacadas');
    const body = await jsonDe(res, 'Listar destacadas');
    return (body.data.items || []).map(p => Number(p.id));
}

// ============================================
// LIMPIEZA
// ============================================

export async function limpiarFavoritos(sesion) {
    const res = await sesion.get('/api/favoritos');
    if (!res.ok()) return;

    const body = await res.json().catch(() => ({}));
    const items = body?.data?.items || body?.data || [];
    if (!Array.isArray(items)) return;

    for (const fav of items) {
        const propiedadId = fav?.propiedad_id ?? fav?.propiedad?.id ?? fav?.id;
        if (propiedadId) {
            await sesion.delete(`/api/favoritos/propiedad/${propiedadId}`).catch(() => {});
        }
    }
}

export async function eliminarReservasDePropiedad(sesion, propiedadId) {
    const res = await sesion.get('/api/reservas');
    if (!res.ok()) return;

    const body = await res.json().catch(() => ({}));
    const data = body?.data || {};
    const reservas = [
        ...(data.mis_reservas || []),
        ...(data.reservas_de_mis_propiedades || [])
    ];

    for (const reserva of reservas) {
        if (Number(reserva?.propiedad_id) === Number(propiedadId)) {
            await sesion.delete(`/api/reservas/${reserva.id}`).catch(() => {});
        }
    }
}

export async function eliminarConsultasDePropiedad(sesion, propiedadId) {
    const res = await sesion.get('/api/consultas');
    if (!res.ok()) return;

    const body = await res.json().catch(() => ({}));
    const items = body?.data?.items || body?.data || [];
    if (!Array.isArray(items)) return;

    for (const consulta of items) {
        if (Number(consulta?.propiedad_id) === Number(propiedadId)) {
            await sesion.delete(`/api/consultas/${consulta.id}`).catch(() => {});
        }
    }
}

export async function eliminarPropiedad(sesion, propiedadId) {
    if (!propiedadId) return;
    await sesion.delete(`/api/propiedades/${propiedadId}`).catch(() => {});
}

// ============================================
// CARRUSEL DEL HOME
// ============================================

/**
 * Devuelve la posición (0-based) del título en el carrusel principal del Home,
 * recorriendo todas sus páginas. Devuelve -1 si no aparece.
 */
export async function posicionEnCarrusel(page, titulo) {
    const seccion = page.locator('section.propiedades-destacadas').first();
    const dots = seccion.locator('.home-carrusel-dot');
    const totalPaginas = Math.max(1, await dots.count());

    for (let pagina = 0; pagina < totalPaginas; pagina++) {
        if (totalPaginas > 1) {
            await dots.nth(pagina).click();
            await expect(dots.nth(pagina)).toHaveClass(/active/);
        }

        const cards = seccion.locator('.home-carrusel-grid .propiedad-card');
        const cantidad = await cards.count();

        for (let i = 0; i < cantidad; i++) {
            const texto = await cards.nth(i).innerText();
            if (texto.includes(titulo)) {
                return pagina * POR_PAGINA_CARRUSEL + i;
            }
        }
    }

    return -1;
}

export async function esperarDestacadasDelHome(page) {
    const seccion = page.locator('section.propiedades-destacadas').first();
    await expect(seccion.locator('h2')).toHaveText('Propiedades Destacadas');
    await expect(seccion.locator('.home-carrusel-grid .propiedad-card').first()).toBeVisible();
    return seccion;
}
