import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { getProperties } from '../services/api';

function PropertyGrid() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProperties()
      .then(setProperties)
      .catch(() => setError('No se pudieron cargar las propiedades.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="property-section"
      id="propiedades"
      aria-labelledby="properties-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Destacadas</p>
          <h2 id="properties-title">Propiedades Destacadas</h2>
          <p className="section-description">
            Las propiedades más visitadas del momento
          </p>
        </div>

        <a className="text-link" href="#propiedades">
          Ver todas <span aria-hidden="true">↗</span>
        </a>
      </div>

      {loading && <p>Cargando propiedades...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p>No hay propiedades disponibles.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="property-grid">
          {properties.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PropertyGrid;