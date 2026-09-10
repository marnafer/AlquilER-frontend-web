import {
  mockPropertiesResponse,
  mockCategoriesResponse,
  mockServicesResponse,
  mockStatsResponse,
} from '../mocks/home';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const API_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, mockResponse) {
  if (USE_MOCKS) {
    return mockResponse;
  }

  const response = await fetch(`${API_URL}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Error en la API');
  }

  return result;
}

function getDataItems(result) {
  return result.data?.items || result.data || [];
}

export async function getProperties() {
  const result = await request('propiedades', mockPropertiesResponse);
  const properties = getDataItems(result);

  return properties.map((property, index) => ({
    id: property.id,
    title: property.titulo,
    type: property.categoria?.nombre || 'Inmueble',
    location: property.direccion || 'Ubicación a consultar',
    price: Number(property.precio || 0),
    bedrooms: property.cantidad_dormitorios || 0,
    bathrooms: property.cantidad_banos || 0,
    rooms: property.cantidad_ambientes || 0,
    available: property.disponible ?? true,
    accent: ['terracotta', 'sage', 'ochre'][index % 3],
  }));
}

export async function getCategories() {
  const result = await request('categorias', mockCategoriesResponse);
  return getDataItems(result);
}

export async function getServices() {
  const result = await request('servicios', mockServicesResponse);
  return getDataItems(result);
}

export async function getStats() {
  const result = await request('debug/stats', mockStatsResponse);
  return result.data?.detalle || {};
}