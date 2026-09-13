import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropiedades, getPropiedad, getCategorias } from '../services/api';
import PropiedadCard from '../components/PropiedadCard';

function Propiedades() {
    const { id } = useParams();
    const [propiedades, setPropiedades] = useState([]);
    const [propiedad, setPropiedad] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDetail, setIsDetail] = useState(false);
    const [search, setSearch] = useState('');
    const [imgError, setImgError] = useState(false);

    const categoriasMap = {};
    categorias.forEach(cat => { categoriasMap[cat.id] = cat.nombre; });

    useEffect(() => {
        if (id) {
            cargarPropiedad(id);
        } else {
            cargarPropiedades();
        }
    }, [id]);

    const cargarPropiedades = async () => {
        try {
            const [props, cats] = await Promise.all([getPropiedades(), getCategorias()]);
            setPropiedades(props);
            setCategorias(cats);
            setIsDetail(false);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarPropiedad = async (propiedadId) => {
        try {
            setImgError(false);
            setLoading(true);
            const data = await getPropiedad(propiedadId);
            setPropiedad(data);
            setIsDetail(true);
        } catch (error) {
            console.error('Error cargando propiedad:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isDetail) {
        return (
            <div className="props-page">
                <section className="props-hero">
                    <div className="container">
                        <span className="prop-hero-badge">Catálogo de alquileres</span>
                        <h2>Encontrá tu próximo <span>hogar</span></h2>
                        <p>Las mejores propiedades en alquiler, listas para que te mudes.</p>
                    </div>
                </section>
                <div className="container props-body">
                    <div className="skeleton-grid propiedades-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div className="propiedad-card" key={i}>
                                <div className="skeleton skeleton-img"></div>
                                <div className="propiedad-info">
                                    <div className="skeleton skeleton-line" style={{ width: '70%' }}></div>
                                    <div className="skeleton skeleton-line" style={{ width: '55%' }}></div>
                                    <div className="skeleton skeleton-line" style={{ width: '100%', height: '40px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isDetail && propiedad) {
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
                                {categoriasMap[propiedad.categoria_id] && (
                                    <span className="propiedad-categoria">{categoriasMap[propiedad.categoria_id]}</span>
                                )}
                                <span className={`propiedad-badge ${propiedad.disponible ? 'disponible' : 'alquilada'}`}>
                                    {propiedad.disponible ? 'Disponible' : 'Alquilada'}
                                </span>
                            </div>
                            <div className="propiedad-precio-pill detalle-precio-pill">
                                ${Number(propiedad.precio).toLocaleString()}<span>/mes</span>
                            </div>
                        </div>

                        <div className="propiedad-detalle-contenido">
                            <div className="propiedad-detalle-header">
                                <h1>{propiedad.titulo || 'Propiedad'}</h1>
                                <p className="propiedad-direccion">
                                    <i className="fas fa-map-marker-alt"></i> {propiedad.direccion || 'Dirección no especificada'}
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
                                <button className="btn-detalle btn-detalle-primario">
                                    <i className="fas fa-calendar-check"></i> Reservar ahora
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

    const filtradas = propiedades.filter(p =>
        (p.titulo || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.direccion || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="props-page">
            <section className="props-hero">
                <div className="container">
                    <span className="prop-hero-badge"><i className="fas fa-bolt"></i> Catálogo de alquileres</span>
                    <h2>Encontrá tu próximo <span>hogar</span></h2>
                    <p>Las mejores propiedades en alquiler, listas para que te mudes.</p>

                    <div className="search-box propiedades-search">
                        <input
                            type="text"
                            placeholder="Buscar por título o dirección..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn-search">
                            <i className="fas fa-search"></i> Buscar
                        </button>
                    </div>

                    <div className="props-hero-stats">
                        <div className="props-hero-stat">
                            <i className="fas fa-home"></i>
                            <span><strong>{propiedades.length}</strong> en alquiler</span>
                        </div>
                        <div className="props-hero-stat">
                            <i className="fas fa-tags"></i>
                            <span><strong>{categorias.length}</strong> categorías</span>
                        </div>
                        <div className="props-hero-stat">
                            <i className="fas fa-map-marker-alt"></i>
                            <span><strong>+40</strong> localidades</span>
                        </div>
                    </div>
                </div>
                <div className="wave-divider">
                    <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#f0fdf4" d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,85 1440,90 L1440,100 L0,100 Z"/>
                    </svg>
                </div>
            </section>

            <div className="container props-body">
                <div className="props-results">
                    <p className="props-results-count">
                        <strong>{filtradas.length}</strong> {filtradas.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                    </p>
                    {search && (
                        <button className="props-clear" onClick={() => setSearch('')}>
                            Limpiar búsqueda <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>

                {filtradas.length > 0 ? (
                    <div className="propiedades-grid">
                        {filtradas.map(prop => (
                            <PropiedadCard
                                key={prop.id}
                                propiedad={prop}
                                categoriaNombre={categoriasMap[prop.categoria_id]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon"><i className="fas fa-home"></i></div>
                        <h3>No encontramos resultados</h3>
                        <p>Probá con otro término de búsqueda o revisá la dirección.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Propiedades;