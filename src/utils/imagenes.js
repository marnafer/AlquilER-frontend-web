import { API_URL } from '../services/api';

// Devuelve la URL absoluta de la imagen destacada de una propiedad,
// o null si la propiedad no tiene imágenes.
// Prioridad: 'imagen_url' (accesor del backend) -> principal de 'imagenes'
// -> primera de 'imagenes' -> 'imagenPrincipal.ruta'.
export function rutaImagenPropiedad(propiedad) {
    if (!propiedad) return null;

    const principal = (propiedad.imagenes || []).find(i => Number(i.es_principal) === 1);
    const primera = propiedad.imagenes?.[0];

    const rutaRelativa = propiedad.imagen_url
        || principal?.ruta
        || primera?.ruta
        || propiedad.imagenPrincipal?.ruta
        || null;

    if (!rutaRelativa) return null;

    // Si ya viene una URL completa, se usa tal cual
    if (/^https?:\/\//i.test(rutaRelativa)) return rutaRelativa;

    return `${API_URL}${rutaRelativa.startsWith('/') ? rutaRelativa : `/${rutaRelativa}`}`;
}