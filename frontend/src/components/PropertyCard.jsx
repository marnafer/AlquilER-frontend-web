function PropertyCard({ property }) {
  const formattedPrice = new Intl.NumberFormat('es-AR').format(property.price);

  return (
    <article className="property-card">
      <div className={`property-image ${property.accent || 'terracotta'}`}>
        <span className={property.available ? 'available' : 'unavailable'}>
          {property.available ? 'Disponible' : 'No disponible'}
        </span>

        <button
          type="button"
          aria-label={`Guardar ${property.location}`}
        >
          ♡
        </button>
      </div>

      <div className="property-content">
        <p>{property.type}</p>

        <h3>{property.title}</h3>

        <p className="property-location">
          ⌖ {property.location}
        </p>

        <div className="property-details">
          <span>{property.bedrooms} dorm.</span>
          <span>{property.bathrooms} baños</span>
          <span>{property.rooms} amb.</span>
        </div>

        <div className="property-meta">
          <strong>${formattedPrice}</strong>
          <span>/mes</span>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;