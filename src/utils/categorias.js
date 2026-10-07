// Icono de cada categoría del catálogo. La clave es el nombre exacto que
// devuelve la API (/api/categorias).
// La búsqueda ignora mayúsculas y acentos leves, así que "Cabana" también
// encuentra el icono de "Cabaña".
const ICONOS_CATEGORIA = {
    'Casa': 'fa-house',
    'Departamento': 'fa-building',
    'Cabaña': 'fa-campground',
    'Local Comercial': 'fa-store',
    'Duplex': 'fa-layer-group',
    'Monoambiente': 'fa-door-open',
    'Oficina': 'fa-briefcase',
    'Terreno': 'fa-mountain',
    'Cochera': 'fa-square-parking',
    'PH': 'fa-building-user',
};

const normalizar = (texto) => (texto || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const iconoCategoria = (nombre) => {
    const objetivo = normalizar(nombre);
    const key = Object.keys(ICONOS_CATEGORIA).find(k => normalizar(k) === objetivo);
    return key ? ICONOS_CATEGORIA[key] : 'fa-house';
};