// Icono de cada servicio del catalogo. La clave es el nombre exacto que
// devuelve la API (/api/servicios y /api/propiedades/{id}/servicios).
// La busqueda ignora mayusculas y acentos leves, asi que "Calefaccion"
// tambien encuentra el icono de "Calefacción".
const ICONOS_SERVICIO = {
    'Wifi': 'fa-wifi',
    'Aire Acondicionado': 'fa-temperature-arrow-down',
    'Calefacción': 'fa-temperature-arrow-up',
    'Piscina': 'fa-person-swimming',
    'Estacionamiento': 'fa-car',
    'TV Cable': 'fa-tv',
    'Cocina Equipada': 'fa-kitchen-set',
    'Seguridad': 'fa-shield-halved',
    'Limpieza': 'fa-broom',
    'Amueblado': 'fa-couch',
    'Balcón': 'fa-window-restore',
    'Mascotas': 'fa-paw',
    'Gas natural': 'fa-fire-flame-curved',
    'Gas envasado': 'fa-gas-pump',
    'Hijos': 'fa-children',
    'Estacionamiento abierto': 'fa-square-parking',
    'Estacionamiento cerrado': 'fa-warehouse',
    'Agua': 'fa-faucet',
    'Luz': 'fa-bolt',
    'Agua caliente': 'fa-temperature-high',
    'Heladera': 'fa-temperature-low',
    'Lavadero': 'fa-shirt',
    'Patio': 'fa-tree',
    'Gimnasio': 'fa-dumbbell',
    'Ascensor': 'fa-elevator',
    'Escritorio': 'fa-laptop',
    'Patio interno': 'fa-archway',
    'Limpieza general': 'fa-broom',
    'Corte de césped': 'fa-sprout',
    'Calle asfaltada': 'fa-road',
    'Calle de tierra': 'fa-mound',
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
