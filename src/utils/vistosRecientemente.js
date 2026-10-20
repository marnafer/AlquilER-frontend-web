// "Vistos recientemente": guardamos en localStorage solo los IDs de las
// propiedades que el visitante abrió, del más nuevo al más viejo. Guardar
// IDs (y no los objetos completos) evita datos viejos cuando una propiedad
// cambia de precio o deja de estar disponible.

const CLAVE = 'alquiler_vistos_recientemente';
const MAX = 8;

export function leerVistosRecientemente() {
    try {
        const crudo = localStorage.getItem(CLAVE);
        if (!crudo) return [];
        const ids = JSON.parse(crudo);
        return Array.isArray(ids)
            ? ids.map(Number).filter(id => Number.isInteger(id) && id > 0)
            : [];
    } catch {
        return [];
    }
}

export function registrarVisto(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) return;

    const actuales = leerVistosRecientemente();
    const sinDuplicado = actuales.filter(x => x !== numero);
    const siguiente = [numero, ...sinDuplicado].slice(0, MAX);

    try {
        localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {
        // localStorage puede fallar (modo privado, cuota); no es crítico.
    }
}
