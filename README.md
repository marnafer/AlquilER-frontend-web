# Alquiler Frontend

Frontend desacoplado construido con **React 19 y Vite 5**.

## Estructura

- `src/`: aplicación principal en React (enrutamiento, autenticación, componentes y vistas).
- `legacy-php/`: código PHP anterior, aislado como referencia histórica.

## Desarrollo

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

La aplicación iniciará en `http://localhost:3000`.

## Build de producción

```bash
npm run build
```

El resultado se genera en `dist/` y es la carpeta optimizada que debe publicarse como frontend compilado.

## API

La aplicación está preparada para consumir un backend externo. Configura la URL base de la API creando un archivo `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

## Tests

### E2E (Playwright)

La suite vive en `tests/` y corre sobre cuatro viewports (390, 768, 1024 y 1440 px).

- `tests/e2e/`: flujos de administración, destacadas, notificaciones y usuario (incluye registro y refresh de sesión). Los helpers comparten sesiones de API con cookies aisladas.
- `tests/chips-solapamiento.spec.js`: regresión de los chips de categoría/estado en el detalle y las tarjetas.

Requisitos:

- MySQL corriendo con la base de desarrollo.
- Playwright levanta el backend en `http://127.0.0.1:8000` con `APP_ENV=development` (las cookies de autenticación no llevan `Secure` para poder viajar por HTTP) y `DISABLE_RATE_LIMIT=1`. Si ya hay algo escuchando en ese puerto, lo reutiliza.
- Servidor SMTP local en `127.0.0.1:1025`; el registro lo necesita. Playwright lo levanta solo (`tests/e2e/smtp-server.cjs`).
- Vite en `http://127.0.0.1:3000`; Playwright lo levanta solo.
- Usuarios de prueba (`e2e.admin@test.com` y `e2e.inquilino@test.com`, contraseña `E2e123456`): `php ../AlquilER/scripts/seed_e2e_users.php`.

```bash
npx playwright test                                  # suite completa
npx playwright test tests/e2e --project=desktop-1440 # solo los flujos E2E
```

Los tests unitarios del frontend todavía no están configurados (pendiente de Vitest).
