import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropiedad, getCategorias } from '../services/api';
import Loader from './Loader';

function PropiedadDetalle() {
    const { id } = useParams();
    const [propiedad, setPropiedad] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [prop, cats] = await Promise.all([
                getPropiedad(id),
                getCategorias()
            ]);
            setPropiedad(prop);
            setCategorias(cats);
        } catch (error) {
            console.error('Error cargando detalle:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!propiedad) {
        return (
            <div className="container propiedades-page">
                <div className="propiedades-empty">
                    <div className="empty-icon"><i className="fas fa-home"></i></div>
                    <h3>Propiedad no encontrada</h3>
                    <p>La propiedad que buscás no existe o fue eliminada.</p>
                    <Link to="/propiedades" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    const categoriaNombre = categorias.find(c => c.id === propiedad.categoria_id)?.nombre;
    const disponible = propiedad.disponible !== false;

    return (
        <div className="props-page">
            <div className="container propiedades-page">
                <Link to="/propiedades" className="detalle-volver">
                    <i className="fas fa-arrow-left"></i> Volver a propiedades
                </Link>

                <div className="propiedad-detalle">
                    <div className="propiedad-detalle-imagen">
                        {imgError ? (
                            <div className="propiedad-placeholder">
                                <i className="fas fa-home"></i>
                            </div>
                        ) : (
                            <img
                                src={`/uploads/propiedades/${propiedad.id}.jpg`}
                                alt={propiedad.titulo || 'Propiedad'}
                                onError={() => setImgError(true)}
                            />
                        )}
                        <div className="detalle-chips">
                            {categoriaNombre && (
                                <span className="propiedad-categoria">{categoriaNombre}</span>
                            )}
                            <span className={`propiedad-badge ${disponible ? 'disponible' : 'alquilada'}`}>
                                {disponible ? 'Disponible' : 'Alquilada'}
                            </span>
                        </div>
                        <div className="propiedad-precio-pill detalle-precio-pill">
                            ${Number(propiedad.precio || 0).toLocaleString()}<span>/mes</span>
                        </div>
                    </div>

                    <div className="propiedad-detalle-contenido">
                        <div className="propiedad-detalle-header">
                            <h1>{propiedad.titulo || 'Propiedad'}</h1>
                            <p className="propiedad-direccion">
                                <i className="fas fa-map-marker-alt"></i>{' '}
                                {propiedad.direccion || 'Dirección no especificada'}
                            </p>
                        </div>

                        <div className="propiedad-detalle-features">
                            <div className="detalle-feature">
                                <i className="fas fa-bed"></i>
                                <span className="feature-num">{propiedad.cantidad_dormitorios || 0}</span>
                                <span className="feature-label">Dormitorios</span>
                            </div>
                            <div className="detalle-feature">
                                <i className="fas fa-bath"></i>
                                <span className="feature-num">{propiedad.cantidad_banos || 0}</span>
                                <span className="feature-label">Baños</span>
                            </div>
                            <div className="detalle-feature">
                                <i className="fas fa-arrows-alt"></i>
                                <span className="feature-num">{propiedad.cantidad_ambientes || 0}</span>
                                <span className="feature-label">Ambientes</span>
                            </div>
                            <div className="detalle-feature">
                                <i className="fas fa-users"></i>
                                <span className="feature-num">{propiedad.capacidad || 0}</span>
                                <span className="feature-label">Capacidad</span>
                            </div>
                        </div>

                        <p className="propiedad-detalle-descripcion">
                            {propiedad.descripcion || 'Sin descripción'}
                        </p>

                        <div className="propiedad-detalle-acciones">
                            <button className="btn-detalle btn-detalle-primario" disabled={!disponible}>
                                <i className="fas fa-calendar-check"></i>{' '}
                                {disponible ? 'Reservar ahora' : 'No disponible'}
                            </button>
                            <button className="btn-detalle btn-detalle-secundario">
                                <i className="fas fa-question-circle"></i> Consultar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropiedadDetalle;