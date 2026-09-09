const featuredProperties = [
  { type: 'Departamento', location: 'Palermo, Buenos Aires', price: '$ 780.000', rooms: '2 ambientes', accent: 'terracotta' },
  { type: 'Casa', location: 'Villa Devoto, Buenos Aires', price: '$ 1.250.000', rooms: '4 ambientes', accent: 'sage' },
  { type: 'Departamento', location: 'Nueva Córdoba, Córdoba', price: '$ 620.000', rooms: '1 ambiente', accent: 'ochre' },
];

function App() {
  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Navegación principal">
        <a className="brand" href="/">alquiler<span>.</span></a>
        <div className="nav-links">
          <a href="#propiedades">Propiedades</a>
          <a href="#como-funciona">Cómo funciona</a>
          <button className="button button-quiet" type="button">Ingresar</button>
          <button className="button button-dark" type="button">Publicar propiedad</button>
        </div>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Tu próximo lugar empieza acá</p>
          <h1 id="hero-title">Un espacio para la vida que estás armando.</h1>
          <p className="hero-text">Busca alquileres que encajen con tu ritmo, tu presupuesto y la ciudad que quieres habitar.</p>
          <form className="search-panel" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>¿Dónde quieres vivir?</span>
              <input type="search" placeholder="Ciudad, barrio o zona" />
            </label>
            <label>
              <span>Tipo de propiedad</span>
              <select defaultValue="">
                <option value="" disabled>Seleccionar</option>
                <option>Departamento</option>
                <option>Casa</option>
                <option>PH</option>
              </select>
            </label>
            <button className="search-button" type="submit" aria-label="Buscar propiedades">Buscar <span aria-hidden="true">→</span></button>
          </form>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun"></div>
          <div className="building building-back"></div>
          <div className="building building-front"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div className="plant"></div>
        </div>
      </section>

      <section className="property-section" id="propiedades" aria-labelledby="properties-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para empezar a explorar</p>
            <h2 id="properties-title">Propiedades destacadas</h2>
          </div>
          <a className="text-link" href="#todas">Ver todas <span aria-hidden="true">↗</span></a>
        </div>
        <div className="property-grid">
          {featuredProperties.map((property) => (
            <article className="property-card" key={property.location}>
              <div className={`property-image ${property.accent}`}><span>Disponible</span><button type="button" aria-label={`Guardar ${property.location}`}>♡</button></div>
              <div className="property-content">
                <p>{property.type}</p>
                <h3>{property.location}</h3>
                <div className="property-meta"><strong>{property.price}</strong><span>{property.rooms}</span></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
