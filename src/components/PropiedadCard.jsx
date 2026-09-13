import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function PropiedadCard({ propiedad, categoriaNombre, onFavorito }) {
    const [imgError, setImgError] = useState(false);
    const [esFavorito, setEsFavorito] = useState(false);
    const { isAuthenticated } = useAuth();

    // Normalizar disponibilidad (por si el backend no la envía)
    const disponible = propiedad.disponible !== false;

    const handleFavorito = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        setEsFavorito(!esFavorito);
        if (onFavorito) onFavorito(propiedad.id, !esFavorito);
    };

    return (
        <div className="propiedad-card">
            <div className="propiedad-image">
                {imgError ? (
                    <div className="propiedad-placeholder">
                        <i className="fas fa-home"></i>
                    </div>
                ) : (
                    <img
                        src={`/uploads/propiedades/${propiedad.id}.jpg`}
                        alt={propiedad.titulo || 'Propiedad'}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                )}

                {categoriaNombre && (
                    <span className="propiedad-categoria">
                        <i className="fas fa-tag"></i> {categoriaNombre}
                    </span>
                )}

                {isAuthenticated && (
                    <button
                        className={`propiedad-fav ${esFavorito ? 'active' : ''}`}
                        aria-label="Agregar a favoritos"
                        onClick={handleFavorito}
                    >
                        <i className={esFavorito ? 'fas fa-heart' : 'far fa-heart'}></i>
                    </button>
                )}

                <div className="propiedad-precio-pill">
                    ${Number(propiedad.precio || 0).toLocaleString()}<span>/mes</span>
                </div>

                <span className={`propiedad-badge ${disponible ? 'disponible' : 'alquilada'}`}>
                    {disponible ? 'Disponible' : 'Alquilada'}
                </span>
            </div>

            <div className="propiedad-info">
                <h3>{propiedad.titulo || 'Propiedad sin título'}</h3>
                <p className="propiedad-direccion">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    {propiedad.direccion || 'Dirección no especificada'}
                </p>
                <div className="propiedad-features">
                    <span><i className="fas fa-bed"></i> {propiedad.cantidad_dormitorios || 0}</span>
                    <span><i className="fas fa-bath"></i> {propiedad.cantidad_banos || 0}</span>
                    <span><i className="fas fa-arrows-alt"></i> {propiedad.cantidad_ambientes || 0}</span>
                </div>
                <Link to={`/propiedades/${propiedad.id}`} className="btn-ver">
                    Ver detalle <i className="fas fa-arrow-right"></i>
                </Link>
            </div>
        </div>
    );
}

export default PropiedadCard;