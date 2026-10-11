import Icon from './Icon';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { addFavorito, removeFavorito } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import PropiedadCardImage from './PropiedadCardImage';

function PropiedadCard({ propiedad, categoriaNombre, esFavoritoInicial = false, onFavorito }) {
    const [esFavorito, setEsFavorito] = useState(() => Boolean(esFavoritoInicial));
    const [favLoading, setFavLoading] = useState(false);
    const { isAuthenticated, token } = useAuth();

    useEffect(() => {
        setEsFavorito(Boolean(esFavoritoInicial));
    }, [esFavoritoInicial]);

    const imagen = rutaImagenPropiedad(propiedad);

    // Vista previa de la descripcion para la tarjeta: recorta por caracteres
    // para que todas las tarjetas ocupen lo mismo, sin depender del ancho.
    const descripcion = (() => {
        const texto = (propiedad.descripcion || '').trim();
        if (!texto) return '';
        return texto.length > 150
            ? `${texto.slice(0, 150).trimEnd()}...`
            : texto;
    })();

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
            <PropiedadCardImage
                src={imagen}
                alt={propiedad.titulo || 'Propiedad'}
            />

                {categoriaNombre && (
                    <span className="propiedad-categoria">
                        <Icon name="fas fa-tag" /> {categoriaNombre}
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
                        <Icon name={esFavorito ? 'fas fa-heart' : 'far fa-heart'} />
                    </button>
                )}

                <span className={`propiedad-badge ${disponible ? 'disponible' : 'alquilada'}`}>
                    {disponible ? 'Disponible' : 'Alquilada'}
                </span>
            </div>

            <div className="propiedad-info">
                <h3>{propiedad.titulo || 'Propiedad sin título'}</h3>
                <p className="propiedad-direccion">
                    <Icon name="fas fa-map-marker-alt" />{' '}
                    {propiedad.direccion || 'Dirección no especificada'}
                </p>
                <p className="propiedad-precio">
                    ${Number(propiedad.precio || 0).toLocaleString()}<span>/mes</span>
                </p>
                <div className="propiedad-features">
                    <span><Icon name="fas fa-bed" /> {propiedad.cantidad_dormitorios || 0} dorm.</span>
                    <span><Icon name="fas fa-bath" /> {propiedad.cantidad_banos || 0} {Number(propiedad.cantidad_banos) === 1 ? 'baño' : 'baños'}</span>
                    <span><Icon name="fas fa-arrows-alt" /> {propiedad.cantidad_ambientes || 0} amb.</span>
                </div>
                {descripcion && (
                    <p className="propiedad-card-descripcion">{descripcion}</p>
                )}
                <div className="propiedad-politicas">
                    <span className={`politica-badge ${propiedad.acepta_mascotas ? 'si' : 'no'}`}>
                        <Icon name="fas fa-paw" /> Mascotas
                    </span>
                    <span className={`politica-badge ${propiedad.acepta_hijos ? 'si' : 'no'}`}>
                        <Icon name="fas fa-children" /> Hijos
                    </span>
                </div>
                <Link to={`/propiedades/${propiedad.id}`} className="btn-ver">
                    Ver detalle <Icon name="fas fa-arrow-right" />
                </Link>
            </div>
        </div>
    );
}

export default PropiedadCard;