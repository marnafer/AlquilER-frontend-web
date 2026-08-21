import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPropiedades, getCategorias } from '../services/api';
import Loader from '../components/Loader';

function Home() {
    const [propiedades, setPropiedades] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [props, cats] = await Promise.all([
                getPropiedades(),
                getCategorias()
            ]);
            
            setPropiedades(props);
            setCategorias(cats);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            {/* HERO SECTION */}
            <section className="hero">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <div className="hero-badge">AlquilER</div>
                            <h1>Encontrá tu <span>propiedad ideal</span></h1>
                            <p>Las mejores propiedades en alquiler. Departamentos, casas, locales comerciales y más.</p>
                            
                            <div className="search-box">
                                <input type="text" placeholder="¿Dónde querés vivir?" />
                                <select>
                                    <option>Todas las categorías</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                <button className="btn-search">
                                    <i className="fas fa-search"></i> Buscar
                                </button>
                            </div>
                        </div>
                        
                        <div className="hero-image">
                            <img 
                                src="/assets/img/logo.png" 
                                alt="AlquilER" 
                                onError={(e) => e.target.src = '/assets/img/logo.png'}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="wave-divider">
                    <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#f0fdf4" d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,85 1440,90 L1440,100 L0,100 Z"/>
                    </svg>
                </div>
            </section>

            {/* PROPIEDADES DESTACADAS */}
            <section className="propiedades-destacadas">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Destacadas</span>
                        <h2>Propiedades Destacadas</h2>
                        <p>Las propiedades más visitadas del momento</p>
                    </div>
                    
                    <div className="propiedades-grid">
                        {propiedades.slice(0, 6).map(prop => (
                            <div className="propiedad-card" key={prop.id}>
                                <div className="propiedad-image">
                                    <img 
                                        src={`/uploads/propiedades/${prop.id}.jpg`} 
                                        alt={prop.titulo}
                                        onError={(e) => e.target.src = '/assets/img/propiedad-default.jpg'}
                                    />
                                    <span className="propiedad-badge">Destacado</span>
                                </div>
                                <div className="propiedad-info">
                                    <h3>{prop.titulo}</h3>
                                    <p className="propiedad-direccion">
                                        <i className="fas fa-map-marker-alt"></i> {prop.direccion}
                                    </p>
                                    <p className="propiedad-precio">${Number(prop.precio).toLocaleString()}</p>
                                    <div className="propiedad-features">
                                        <span><i className="fas fa-bed"></i> {prop.cantidad_dormitorios || '0'}</span>
                                        <span><i className="fas fa-bath"></i> {prop.cantidad_banos || '0'}</span>
                                        <span><i className="fas fa-arrows-alt"></i> {prop.cantidad_ambientes || '0'}</span>
                                    </div>
                                    <Link to={`/propiedades/${prop.id}`} className="btn-ver">
                                        <i className="fas fa-eye"></i> Ver más
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="section-footer">
                        <Link to="/propiedades" className="btn-ver-todas">Ver todas las propiedades</Link>
                    </div>
                </div>
            </section>

            {/* CATEGORÍAS */}
            <section className="categorias">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Categorías</span>
                        <h2>Explorar por Categoría</h2>
                        <p>Encontrá lo que buscás</p>
                    </div>
                    
                    <div className="categorias-grid">
                        {categorias.slice(0, 4).map(cat => (
                            <Link to={`/propiedades?categoria_id=${cat.id}`} className="categoria-card" key={cat.id}>
                                <div className="categoria-icon">🏠</div>
                                <h3>{cat.nombre}</h3>
                                <span>Ver propiedades</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICIOS */}
            <section className="servicios">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Servicios</span>
                        <h2>Servicios Destacados</h2>
                        <p>Comodidades que ofrecen nuestras propiedades</p>
                    </div>
                    
                    <div className="servicios-grid">
                        {['Wifi', 'Aire Acondicionado', 'Calefacción', 'Piscina', 'Estacionamiento', 'TV Cable', 'Cocina Equipada', 'Seguridad'].map((serv, i) => (
                            <div className="servicio-card" key={i}>
                                <i className={`fas fa-${['wifi', 'snowflake', 'fire', 'swimming-pool', 'car', 'tv', 'utensils', 'shower'][i]} servicio-icon`}></i>
                                <h4>{serv}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ESTADÍSTICAS */}
            <section className="estadisticas">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">{propiedades.length}</span>
                            <span className="stat-label">Propiedades publicadas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Usuarios registrados</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Reservas realizadas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Ciudades disponibles</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;