// Hook para SEO por pagina: cambia el <title> y la <meta description>.
//
// El backend es una API pura que devuelve JSON, asi que no hay Blade ni SSR.
// El <head> se arma en index.html durante el build, y despues lo modifica
// este hook en el navegador. Es el mecanismo estandar en una SPA: Google
// ejecuta el JavaScript y lee el title final.
//
// Uso:
//   useSEO('Propiedades', 'Busca departamentos, casas y locales...');
//
// Opciones: { noindex: true } para paginas privadas que no deben indexarse,
// { imagen: '/ruta.jpg' } para cambiar la preview al compartir en redes.

import { useEffect } from 'react';

const DOMINIO = 'https://alquilerr.alwaysdata.net';

// Bootstrap / FontAwesome se importan en main.jsx, pero Google no los necesita.
function metaNombre(nombre) {
    let tag = document.querySelector(`meta[name="${nombre}"]`);

    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', nombre);
        document.head.appendChild(tag);
    }

    return tag;
}

function metaPropiedad(propiedad) {
    let tag = document.querySelector(`meta[property="${propiedad}"]`);

    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', propiedad);
        document.head.appendChild(tag);
    }

    return tag;
}

function linkRel(rel) {
    let tag = document.querySelector(`link[rel="${rel}"]`);

    if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
    }

    return tag;
}

function escribirContenido(tag, contenido) {
    // El detalle de propiedad carga los datos despues del primer render, asi
    // que puede venir null. En ese caso se deja el valor anterior.
    if (contenido == null || contenido === '') return;

    if (tag.getAttribute('content') !== contenido) {
        tag.setAttribute('content', contenido);
    }
}

export function useSEO(titulo, descripcion, opciones = {}) {
    const { noindex = false, imagen = '/assets/img/logo.webp' } = opciones;

    // isCanonical cambia segun la ruta, asi que lo derivamos del location.
    const ruta = typeof window !== 'undefined' ? window.location.pathname : '/';
    const url = `${DOMINIO}${ruta === '/' ? '' : ruta}`;

    useEffect(() => {
        // Si el titulo todavia no llego (el detalle carga por fetch), no se
        // pisa el title base de index.html con un "undefined | AlquilER".
        if (!titulo) return;

        const tituloFinal = titulo.includes('|') ? titulo : `${titulo} | AlquilER`;
        const urlImagen = imagen.startsWith('http') ? imagen : `${DOMINIO}${imagen}`;

        document.title = tituloFinal;

        escribirContenido(metaNombre('description'), descripcion);
        escribirContenido(metaNombre('robots'), noindex ? 'noindex, nofollow' : 'index, follow');

        escribirContenido(metaPropiedad('og:title'), tituloFinal);
        escribirContenido(metaPropiedad('og:description'), descripcion);
        escribirContenido(metaPropiedad('og:url'), url);
        escribirContenido(metaPropiedad('og:image'), urlImagen);

        escribirContenido(
            metaNombre('twitter:title'),
            tituloFinal
        );
        escribirContenido(metaNombre('twitter:description'), descripcion);
        escribirContenido(metaNombre('twitter:image'), urlImagen);

        linkRel('canonical').setAttribute('href', url);
    }, [titulo, descripcion, noindex, imagen, url]);
}