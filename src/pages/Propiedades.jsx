import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropiedades, getPropiedad } from '../services/api';
import PropiedadCard from '../components/PropiedadCard';
import Loader from '../components/Loader';

function Propiedades() {
    const { id } = useParams();
    const [propiedades, setPropiedades] = useState([]);
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDetail, setIsDetail] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (id) {
            cargarPropiedad(id);
        } else {
            cargarPropiedades();
        }
    }, [id]);

    const cargarPropiedades = async () => {
        try {
            const data = await getPropiedades();
            setPropiedades(data);
            setIsDetail(false);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarPropiedad = async (propiedadId) => {
        try {
            const data = await getPropiedad(propiedadId);
            setPropiedad(data);
            setIsDetail(true);
        } catch (error) {
            console.error('Error cargando propiedad:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    if (isDetail && propiedad) {
        return (
            <div className="propiedades-page container">
                <Link to="/propiedades" className="detalle-volver">
                    <i className="fas fa-arrow-left"></i> Volver a propiedades
                </Link>

                <div className="propiedad-detalle">
                    <div className="propiedad-detalle-imagen">
                        <img
                            src={`/uploads/propiedades/${propiedad.id}.jpg`}
                            alt={propiedad.titulo || 'Propiedad'}
                            onError={(e) => e.target.src = '/assets/img/propiedad-default.jpg'}
                        />
                        <span className={`propiedad-badge ${propiedad.disponible ? 'disponible' : 'alquilada'}`}>
                            {propiedad.disponible ? 'Disponible' : 'Alquilada'}
                        </span>
                    </div>

                    <div className="propiedad-detalle-contenido">
                        <div className="propiedad-detalle-header">
                            <div>
                                <h1>{propiedad.titulo || 'Propiedad'}</h1>
                                <p className="propiedad-direccion">
                                    <i className="fas fa-map-marker-alt"></i> {propiedad.direccion || 'Dirección no especificada'}
                                </p>
                            </div>
                            <div className="propiedad-detalle-precio">
                                ${Number(propiedad.precio).toLocaleString()}
                                {propiedad.expensas > 0 && (
                                    <span>Expensas: ${Number(propiedad.expensas).toLocaleString()}</span>
                                )}
                            </div>
                        </div>

                        <p className="propiedad-detalle-descripcion">
                            {propiedad.descripcion || 'Sin descripción'}
                        </p>

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

                        <div className="propiedad-detalle-acciones">
                            <button className="btn-detalle btn-detalle-primario">
                                <i className="fas fa-calendar-check"></i> Reservar
                            </button>
                            <button className="btn-detalle btn-detalle-secundario">
                                <i className="fas fa-question-circle"></i> Consultar
                            </button>
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
        <div className="propiedades-page container">
            <div className="section-header">
                <span className="section-badge">Propiedades</span>
                <h2>🏠 Todas las propiedades</h2>
                <p>Encontrá la propiedad que estás buscando</p>
            </div>

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

            {filtradas.length > 0 ? (
                <div className="propiedades-grid">
                    {filtradas.map(propiedad => (
                        <PropiedadCard key={propiedad.id} propiedad={propiedad} />
                    ))}
                </div>
            ) : (
                <p className="empty-message" style={{ padding: '40px 0' }}>
                    No se encontraron propiedades
                </p>
            )}
        </div>
    );
}

export default Propiedades;