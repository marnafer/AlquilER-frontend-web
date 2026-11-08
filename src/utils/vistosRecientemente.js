// "Vistos recientemente": guardamos en localStorage solo los IDs de las
// propiedades que el visitante abrió, del más nuevo al más viejo. Guardar
// IDs (y no los objetos completos) evita datos viejos cuando una propiedad
// cambia de precio o deja de estar disponible.

const CLAVE = 'alquiler_vistos_recientemente';
const MAX = 8;
const MAX_ANTIGUEDAD_MS = 7 * 24 * 60 * 60 * 1000;

function leerEntradasVigentes() {
    try {
        const crudo = localStorage.getItem(CLAVE);
        if (!crudo) return [];

        const datos = JSON.parse(crudo);
        if (!Array.isArray(datos)) return [];

        const ahora = Date.now();
        const entradas = datos.map(entrada => {
            if (typeof entrada === 'number' || typeof entrada === 'string') {
                return { id: Number(entrada), vistoEn: ahora };
            }
            return {
                id: Number(entrada?.id),
                vistoEn: Number(entrada?.vistoEn)
            };
        }).filter(({ id, vistoEn }) => (
            Number.isInteger(id)
            && id > 0
            && Number.isFinite(vistoEn)
            && vistoEn <= ahora
            && ahora - vistoEn < MAX_ANTIGUEDAD_MS
        )).slice(0, MAX);

        localStorage.setItem(CLAVE, JSON.stringify(entradas));
        return entradas;
    } catch {
        return [];
    }
}

export function leerVistosRecientemente() {
    return leerEntradasVigentes()
        .slice(0, MAX)
        .map(({ id }) => id);
}

export function registrarVisto(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) return;

    const actuales = leerEntradasVigentes();
    const sinDuplicado = actuales.filter(entrada => entrada.id !== numero);
    const siguiente = [
        { id: numero, vistoEn: Date.now() },
        ...sinDuplicado
    ].slice(0, MAX);

    try {
        localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {
        // localStorage puede fallar (modo privado, cuota); no es crítico.
    }
}
