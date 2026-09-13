import { useEffect, useState } from 'react';
import { getServices } from '../services/api';

function ServicesGrid() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="services-section"
      aria-labelledby="services-title"
    >
      <p className="eyebrow">Servicios</p>

      <h2 id="services-title">Servicios Destacados</h2>

      <p className="section-description">
        Comodidades que ofrecen nuestras propiedades
      </p>

      {loading && <p>Cargando servicios...</p>}

      {!loading && (
        <div className="services-list">
          {services.map((service) => (
            <span key={service.id}>{service.nombre}</span>
          ))}
        </div>
      )}
    </section>
  );
}

export default ServicesGrid;