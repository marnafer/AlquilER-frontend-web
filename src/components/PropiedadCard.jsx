import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { addFavorito, removeFavorito } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';

function PropiedadCard({ propiedad, categoriaNombre, esFavoritoInicial = false, onFavorito }) {
    const [imgError, setImgError] = useState(false);
    const [esFavorito, setEsFavorito] = useState(() => Boolean(esFavoritoInicial));
    const [favLoading, setFavLoading] = useState(false);
    const { isAuthenticated, token } = useAuth();

    useEffect(() => {
        setEsFavorito(Boolean(esFavoritoInicial));
    }, [esFavoritoInicial]);

    const imagen = rutaImagenPropiedad(propiedad);

    // Normalizar disponibilidad (por si el backend no la envía)
    const disponible = propiedad.disponible !== false;

    const handleFavorito = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated || favLoading) return;

        setFavLoading(true);
        try {
            if (esFavorito) {
                const result = await removeFavorito(propiedad.id, token);
                if (result?.success) {
                    setEsFavorito(false);
                    if (onFavorito) onFavorito(propiedad.id, false);
                }
            } else {
                const result = await addFavorito(propiedad.id, token);
                const yaEstaba = result?.error && String(result.error).toLowerCase().includes('ya está');
                if (result?.success || yaEstaba) {
                    setEsFavorito(true);
                    if (onFavorito) onFavorito(propiedad.id, true);
                }
            }
        } catch (error) {
            console.error('Error actualizando favorito:', error);
        } finally {
            setFavLoading(false);
        }
    };

    return (
        <div className="propiedad-card">
            <div className="propiedad-image">
                {!imagen || imgError ? (
                    <div className="propiedad-placeholder">
                        <i className="fas fa-home"></i>
                    </div>
                ) : (
                    <img
                        src={imagen}
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
                        aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        aria-pressed={esFavorito}
                        disabled={favLoading}
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