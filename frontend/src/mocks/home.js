export const mockPropertiesResponse = {
  success: true,
  data: [
    {
      id: 1,
      titulo: 'Departamento luminoso',
      direccion: 'Palermo, Buenos Aires',
      precio: 780000,
      cantidad_dormitorios: 1,
      cantidad_banos: 1,
      cantidad_ambientes: 2,
      disponible: true,
    },
    {
      id: 2,
      titulo: 'Casa con jardín',
      direccion: 'Villa Devoto, Buenos Aires',
      precio: 1250000,
      cantidad_dormitorios: 3,
      cantidad_banos: 2,
      cantidad_ambientes: 4,
      disponible: true,
    },
  ],
};

export const mockCategoriesResponse = {
  success: true,
  data: [
    { id: 1, nombre: 'Departamento' },
    { id: 2, nombre: 'Casa' },
    { id: 3, nombre: 'PH' },
    { id: 4, nombre: 'Local' },
  ],
};

export const mockServicesResponse = {
  success: true,
  data: [
    { id: 1, nombre: 'Wi-Fi' },
    { id: 2, nombre: 'Aire acondicionado' },
    { id: 3, nombre: 'Cochera' },
    { id: 4, nombre: 'TV' },
  ],
};

export const mockStatsResponse = {
  success: true,
  data: {
    detalle: {
      propiedades: 120,
      usuarios: 850,
      reservas: 240,
      localidades: 12,
    },
  },
};