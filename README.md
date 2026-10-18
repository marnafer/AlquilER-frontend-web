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

