// Icono de cada servicio del catalogo. La clave es el nombre exacto que
// devuelve la API (/api/servicios y /api/propiedades/{id}/servicios).
// La busqueda ignora mayusculas y acentos leves, asi que "Calefaccion"
// tambien encuentra el icono de "Calefacción".
const ICONOS_SERVICIO = {
    'Wifi': 'fa-wifi',
    'Aire Acondicionado': 'fa-snowflake',
    'Calefacción': 'fa-fire',
    'Piscina': 'fa-swimming-pool',
    'Estacionamiento': 'fa-car',
    'TV Cable': 'fa-tv',
    'Cocina Equipada': 'fa-utensils',
    'Seguridad': 'fa-shield-halved',
    'Limpieza': 'fa-broom',
    'Amueblado': 'fa-couch',
    'Balcón': 'fa-building',
    'Mascotas': 'fa-paw',
    'Gas natural': 'fa-fire-flame-curved',
    'Agua': 'fa-droplet',
    'Luz': 'fa-bolt',
    'Agua caliente': 'fa-temperature-high',
    'Heladera': 'fa-temperature-low',
    'Lavadero': 'fa-shirt',
    'Patio': 'fa-tree',
    'Gimnasio': 'fa-dumbbell',
    'Ascensor': 'fa-elevator',
    'Escritorio': 'fa-laptop',
};

const normalizar = (texto) => (texto || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const iconoServicio = (nombre) => {
    const objetivo = normalizar(nombre);
    const key = Object.keys(ICONOS_SERVICIO).find(k => normalizar(k) === objetivo);
    return key ? ICONOS_SERVICIO[key] : 'fa-circle-check';
};
