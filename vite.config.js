/* eslint-env node */
import purgeCSSPlugin from '@fullhuman/postcss-purgecss'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Clases que el codigo construye en runtime y el analisis estatico no puede ver.
const DINAMICAS_PROPIAS = [
  'estado-pendiente',
  'estado-confirmada',
  'estado-cancelada',
  'estado-rechazada',
  'estado-finalizada',
  'register-link'
]

// Bootstrap y react-bootstrap agregan estas clases por JavaScript.
const DINAMICAS_BOOTSTRAP = [
  'show',
  'showing',
  'hide',
  'collapsing',
  'collapse',
  'fade',
  'modal-open',
  'modal-static',
  'modal-backdrop',
  'offcanvas',
  'offcanvas-backdrop',
  'dropdown-menu-end',
  'dropdown-menu-start',
  'dropdown-menu-up',
  'dropleft',
  'dropright',
  'dropup',
  'was-validated',
  'is-invalid',
  'is-valid',
  'invalid-feedback',
  'valid-feedback',
  'disabled',
  'active',
  'btn-check',
  'visually-hidden-focusable',
  // Clases por defecto de los componentes de react-bootstrap que usa el Header.
  'navbar',
  'navbar-expand',
  'navbar-brand',
  'navbar-toggler',
  'navbar-toggler-icon',
  'navbar-collapse',
  'nav',
  'nav-item',
  'nav-link',
  'dropdown',
  'dropdown-toggle',
  'dropdown-menu',
  'dropdown-item',
  'dropdown-divider',
  'dropdown-header',
  'container',
  'container-fluid',
  'btn',
  'btn-primary',
  'btn-secondary',
  'btn-outline-primary',
  'btn-outline-light',
  'btn-sm',
  'btn-lg',
  // Clases que react-bootstrap compone con template string a partir de props.
  'navbar-expand-lg',
  'navbar-dark',
  'navbar-nav',
  'nav-item',
  'bg-dark',
  'fixed-top',
  'btn-link'
]

// Clases de la capa de iconos (Phosphor) que el codigo compone en runtime.
const DINAMICAS_ICONOS = [
  'ph-icon'
]

// Vite sirve el HTML con "Content-Type: text/html" sin charset. Chrome da
// prioridad al header HTTP sobre el <meta charset>, así que en algunos equipos
// (codepage regional Windows-1252) todos los acentos se rompen. Forzamos
// charset=utf-8 en el header para el dev server y el preview.
function charsetUtf8Plugin() {
  return {
    name: 'charset-utf8',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const setHeader = res.setHeader.bind(res);
        res.setHeader = (name, value) => {
          if (
            String(name).toLowerCase() === 'content-type' &&
            typeof value === 'string' &&
            value.startsWith('text/html') &&
            !/charset/i.test(value)
          ) {
            value = `${value}; charset=utf-8`;
          }
          return setHeader(name, value);
        };
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const setHeader = res.setHeader.bind(res);
        res.setHeader = (name, value) => {
          if (
            String(name).toLowerCase() === 'content-type' &&
            typeof value === 'string' &&
            value.startsWith('text/html') &&
            !/charset/i.test(value)
          ) {
            value = `${value}; charset=utf-8`;
          }
          return setHeader(name, value);
        };
        next();
      });
    }
  };
}

export default defineConfig(({ command }) => ({
  plugins: [charsetUtf8Plugin(), react()],
  css: {
    postcss: {
      // La purga corre solo en build. En desarrollo se conserva el CSS completo
      // para que las clases que aparecen en caliente sigan teniendo estilo.
      plugins:
        command === 'build'
          ? [
              purgeCSSPlugin({
                content: [
                  './index.html',
                  './src/**/*.jsx',
                  './src/**/*.js',
                  // react-bootstrap arma sus classNames por JavaScript, asi que
                  // hay que leer su codigo o se pierden .navbar, .btn y .dropdown-menu.
                  './node_modules/react-bootstrap/**/*.js'
                ],
                defaultExtractor: (content) => content.match(/[\w-/:]+(?:#\w+)?/g) || [],
                safelist: [...DINAMICAS_PROPIAS, ...DINAMICAS_BOOTSTRAP, ...DINAMICAS_ICONOS],
                fontFace: false,
                keyframes: false
              })
            ]
          : []
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}))
