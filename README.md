# Alquiler Frontend

Frontend desacoplado construido con React y Vite. El proyecto PHP anterior se conserva temporalmente en `legacy-php/` como referencia y no forma parte de la aplicación nueva.

## Estructura

- `frontend/`: aplicación React, sus dependencias y configuración de Vite.
- `legacy-php/`: código PHP anterior, aislado durante la migración.

## Desarrollo

Requisitos: Node.js 20 o superior.

```bash
cd frontend
npm install
npm run dev
```

## Build de producción

```bash
cd frontend
npm run build
```

El resultado se genera en `frontend/dist/` y es la única carpeta que debe publicarse como frontend compilado.

## API

La aplicación está preparada para consumir un backend externo. Copia `frontend/.env.example` como `frontend/.env` y configura la URL base de la API mediante `VITE_API_BASE_URL` cuando se integren los servicios reales.

## Migración

El contenido de `legacy-php/` puede eliminarse cuando todas las pantallas, contratos de API y flujos de autenticación estén migrados y verificados en React.
