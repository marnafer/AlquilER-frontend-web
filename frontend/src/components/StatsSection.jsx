import { useEffect, useState } from 'react';
import { getStats } from '../services/api';

function StatsSection() {
  const [stats, setStats] = useState({
    propiedades: 0,
    usuarios: 0,
    reservas: 0,
    localidades: 0,
  });

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const items = [
    {
      value: stats.propiedades,
      label: 'Propiedades publicadas',
    },
    {
      value: stats.usuarios,
      label: 'Usuarios registrados',
    },
    {
      value: stats.reservas,
      label: 'Reservas realizadas',
    },
    {
      value: stats.localidades,
      label: 'Ciudades disponibles',
    },
  ];

  return (
    <section
      className="stats-section"
      aria-label="Alquiler en números"
    >
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}

export default StatsSection;