import { useEffect, useState } from 'react';
import { getCategories } from '../services/api';

const icons = ['▦', '⌂', '▤', '□'];

function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="category-section"
      id="categorias"
      aria-labelledby="categories-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Categorías</p>
          <h2 id="categories-title">Explorar por Categoría</h2>
          <p className="section-description">
            Encontrá lo que buscás
          </p>
        </div>
      </div>

      {loading && <p>Cargando categorías...</p>}

      {!loading && (
        <div className="category-grid">
          {categories.map((category, index) => (
            <a
              className="category-card"
              href="#propiedades"
              key={category.id}
            >
              <span className="category-icon" aria-hidden="true">
                {icons[index % icons.length]}
              </span>

              <strong>{category.nombre}</strong>
              <small>Propiedades disponibles</small>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryGrid;