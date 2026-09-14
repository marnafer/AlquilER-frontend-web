import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFavoritos, removeFavorito } from '../services/api';
import PropiedadCard from '../components/PropiedadCard';
import Loader from '../components/Loader';

function Favoritos() {
    const { token } = useAuth();
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarFavoritos = useCallback(async () => {
        try {
            const result = await getFavoritos(token);

            // Normalizar distintos formatos de respuesta
            let items = [];
            if (result?.success && result?.data) {
                items = result.data.items || result.data || [];
            } else if (Array.isArray(result)) {
                items = result;
            } else if (result?.data) {
                items = result.data;
            }

            setFavoritos(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            setFavoritos([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        cargarFavoritos();
    }, [cargarFavoritos]);

    const handleEliminar = async (propiedadId) => {
        try {
            const result = await removeFavorito(propiedadId, token);
            if (result?.success) {
                // Actualizamos la lista local sin recargar
                setFavoritos(prev =>
                    prev.filter(fav => {
                        const favId = fav.propiedad_id || fav.id;
                        return String(favId) !== String(propiedadId);
                    })
                );
            }
        } catch (error) {
            console.error('Error eliminando favorito:', error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="favoritos-page">
            <div className="container">

                {/* HERO */}
                <section className="fav-hero">
                    <div className="fav-hero-content">
                        <span className="fav-hero-badge">
                            <i className="fas fa-heart"></i> Tus favoritos
                        </span>
                        <h1>
                            Propiedades que <span>te gustaron</span>
                        </h1>
                        <p>
                            Guardá las propiedades que más te interesan y volvé a ellas cuando quieras.
                        </p>
                    </div>
                    <div className="fav-hero-icon">
                        <i className="fas fa-heart"></i>
                    </div>
                </section>

                {/* RESULTADOS */}
                {favoritos.length > 0 ? (
                    <>
                        <div className="fav-results">
                            <p className="fav-results-count">
                                <strong>{favoritos.length}</strong>{' '}
                                {favoritos.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                            </p>
                        </div>

                        <div className="propiedades-grid">
                            {favoritos.map(fav => {
                                // La propiedad puede venir anidada o plana
                                const prop = fav.propiedad || fav;
                                const propiedadId = prop.id || fav.propiedad_id;

                                return (
                                    <div key={propiedadId} className="fav-item-wrapper">
                                        <PropiedadCard
                                            propiedad={{ ...prop, id: propiedadId }}
                                            categoriaNombre={prop.categoria_nombre}
                                        />
                                        <button
                                            className="fav-remove-btn"
                                            onClick={() => handleEliminar(propiedadId)}
                                            title="Quitar de favoritos"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                            <span>Quitar</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className="far fa-heart"></i>
                        </div>
                        <h3>No tenés favoritos todavía</h3>
                        <p>
                            Cuando encuentres una propiedad que te guste, tocá el corazón
                            para guardarla acá.
                        </p>
                        <Link to="/propiedades" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                            <i className="fas fa-search"></i> Explorar propiedades
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Favoritos;