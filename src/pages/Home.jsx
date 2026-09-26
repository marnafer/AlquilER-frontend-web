import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPropiedades, getPropiedadesDestacadas, getCategorias, getServicios, getLocalidades } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import Loader from '../components/Loader';

const ICONOS_SERVICIO = {
    'Wifi': 'fa-wifi',
    'Aire Acondicionado': 'fa-snowflake',
    'Calefacción': 'fa-fire',
    'Piscina': 'fa-swimming-pool',
    'Estacionamiento': 'fa-car',
    'TV Cable': 'fa-tv',
    'Cocina Equipada': 'fa-utensils',
    'Seguridad': 'fa-shield-halved',
    'Limpieza': 'fa-broom',
    'Amueblado': 'fa-couch',
    'Balcón': 'fa-building',
    'Mascotas': 'fa-paw',
};

const iconoServicio = (nombre) => {
    const key = Object.keys(ICONOS_SERVICIO).find(
        k => k.toLowerCase() === (nombre || '').toLowerCase()
    );
    return ICONOS_SERVICIO[key] || 'fa-circle-check';
};

function Home() {
    const [propiedades, setPropiedades] = useState([]);
    const [destacadas, setDestacadas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [busqueda, setBusqueda] = useState('');
    const [categoriaBusqueda, setCategoriaBusqueda] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [props, dest, cats, serv, localidadesRes] = await Promise.all([
                getPropiedades(),
                getPropiedadesDestacadas(),
                getCategorias(),
                getServicios(),
                getLocalidades()
            ]);

            setPropiedades(props);
            setDestacadas(Array.isArray(dest) ? dest : []);
            setCategorias(cats);
            setServicios(Array.isArray(serv) ? serv : []);
            setLocalidades(Array.isArray(localidadesRes) ? localidadesRes : []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        const query = new URLSearchParams();
        if (busqueda.trim()) query.set('q', busqueda.trim());
        if (categoriaBusqueda) query.set('categoria_id', categoriaBusqueda);
        navigate(query.toString() ? `/propiedades?${query.toString()}` : '/propiedades');
    };

    if (loading) return <Loader />;

    const disponibles = propiedades.filter(p =>
        p.disponible !== false && p.disponible !== 0 && p.disponible !== '0'
    );

    const destacadasDisponibles = destacadas.filter(p =>
        p.disponible !== false && p.disponible !== 0 && p.disponible !== '0'
    );

    const hayDestacadas = destacadasDisponibles.length > 0;

    const propiedadesAMostrar = hayDestacadas
        ? destacadasDisponibles.slice(0, 6)
        : disponibles.slice(0, 6);

    const onImgError = (e) => {
        const img = e.currentTarget;
        if (img.dataset.fallback !== '1') {
            img.dataset.fallback = '1';
            img.src = '/assets/img/logo.png';
        } else {
            img.style.display = 'none';
        }
    };

    const ocultarHero = (e) => {
        const hero = e.currentTarget.closest('.hero-image');
        if (hero) hero.style.display = 'none';
    };

    return (
        <>
            {/* HERO SECTION */}
            <section className="hero">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <h1>Encontrá tu <span>propiedad ideal</span></h1>
                            <p>Las mejores propiedades en alquiler. Departamentos, casas, locales comerciales y más.</p>

                            <form onSubmit={handleBuscar} className="search-box">
                                <input
                                    type="text"
                                    placeholder="¿Dónde querés vivir?"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                                <select
                                    value={categoriaBusqueda}
                                    onChange={(e) => setCategoriaBusqueda(e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                <button type="submit" className="btn-search">
                                    <i className="fas fa-search"></i> Buscar
                                </button>
                            </form>
                        </div>

                        <div className="hero-image">
                            <img
                                src="/assets/img/logo.png"
                                alt="AlquilER"
                                style={{ maxHeight: '500px', width: 'auto' }}
                                onError={ocultarHero}
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
                        <span className="section-badge">Catálogo</span>
                        <h2>{hayDestacadas ? 'Propiedades Destacadas' : 'Propiedades Recientes'}</h2>
                        <p>{hayDestacadas ? 'Las propiedades destacadas por nuestro equipo' : 'Las últimas publicaciones en AlquilER'}</p>
                    </div>

                    <div className="propiedades-grid">
                        {propiedadesAMostrar.length === 0 && (
                            <p className="form-help" style={{ textAlign: 'center' }}>
                                Todavía no hay propiedades disponibles.
                            </p>
                        )}
                        {propiedadesAMostrar.map(prop => (
                            <div className="propiedad-card" key={prop.id}>
                                <div className="propiedad-image">
                                    <img
                                        src={rutaImagenPropiedad(prop) || '/assets/img/logo.png'}
                                        alt={prop.titulo}
                                        onError={onImgError}
                                    />
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
                        {servicios.length === 0 && (
                            <p className="form-help" style={{ textAlign: 'center' }}>
                                Todavía no hay servicios cargados.
                            </p>
                        )}
                        {servicios.slice(0, 8).map(serv => (
                            <div className="servicio-card" key={serv.id}>
                                <i className={`fas ${iconoServicio(serv.nombre)} servicio-icon`}></i>
                                <h4>{serv.nombre}</h4>
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
                            <span className="stat-number">{disponibles.length}</span>
                            <span className="stat-label">Propiedades publicadas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{categorias.length}</span>
                            <span className="stat-label">Categorías disponibles</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{servicios.length}</span>
                            <span className="stat-label">Servicios ofrecidos</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{localidades.length}</span>
                            <span className="stat-label">Ciudades disponibles</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;