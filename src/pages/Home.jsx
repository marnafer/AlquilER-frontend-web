import Icon from '../components/Icon';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPropiedades, getPropiedadesDestacadas, getCategorias, getServicios, getLocalidades } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import PropiedadCardImage from '../components/PropiedadCardImage';
import ServicioIcono from '../components/ServicioIcono';
import { iconoCategoria } from '../utils/categorias';
import { useSEO } from '../hooks/useSEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';

function Home() {
    useSEO(
        'Alquiler de propiedades',
        'AlquilER: encontrá el departamento, casa o dúplex que necesitás. Departamentos, casas, dúplex y monoambientes en alquiler con búsqueda por provincia, categoría y precio.'
    );
    useScrollReveal();

    const [propiedades, setPropiedades] = useState([]);
    const [destacadas, setDestacadas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [categoriaBusqueda, setCategoriaBusqueda] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
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
            setError(error.message || 'No pudimos cargar el sitio. Probá de nuevo en unos momentos.');
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

    if (error) {
        return (
            <div className="estatica-page">
                <div className="container">
                    <ErrorState mensaje={error} onReintentar={cargarDatos} />
                </div>
            </div>
        );
    }

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
                                    aria-label="Buscar propiedad por dirección o título"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                                <select
                                    aria-label="Filtrar por categoría"
                                    value={categoriaBusqueda}
                                    onChange={(e) => setCategoriaBusqueda(e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                <button type="submit" className="btn-search">
                                    <Icon name="fas fa-search" /> Buscar
                                </button>
                            </form>
                        </div>

                        <div className="hero-image">
                            <img
                                src="/assets/img/hero-interior.jpg"
                                alt="Interior luminoso de una propiedad en alquiler"
                                fetchPriority="high"
                                decoding="async"
                                onError={ocultarHero}
                            />
                        </div>
                    </div>
                </div>

                <div className="wave-divider">
                    <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
                        <path fill="var(--primary-bg)" d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,85 1440,90 L1440,100 L0,100 Z"/>
                    </svg>
                </div>
            </section>

            {/* PROPIEDADES DESTACADAS */}
            <section className="propiedades-destacadas">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">Catálogo</span>
                        <h2>{hayDestacadas ? 'Propiedades Destacadas' : 'Propiedades Recientes'}</h2>
                        <p>{hayDestacadas ? 'Las propiedades destacadas por nuestro equipo' : 'Las últimas publicaciones en AlquilER'}</p>
                    </div>

                    <div className="propiedades-grid">
                        {propiedadesAMostrar.length === 0 && (
                            <EmptyState
                                icono="fa-home"
                                titulo="Todavía no hay propiedades disponibles"
                                descripcion="Pronto vas a encontrar departamentos, casas y más en alquiler."
                            />
                        )}
                        {propiedadesAMostrar.map((prop, i) => (
                            <div
                                className="propiedad-card reveal"
                                key={prop.id}
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <div className="propiedad-image">
                                    <PropiedadCardImage
                                        src={rutaImagenPropiedad(prop)}
                                        alt={prop.titulo || 'Propiedad'}
                                    />
                                </div>
                                <div className="propiedad-info">
                                    <h3>{prop.titulo}</h3>
                                    <p className="propiedad-direccion">
                                        <Icon name="fas fa-map-marker-alt" /> {prop.direccion}
                                    </p>
                                    <p className="propiedad-precio">
                                        ${Number(prop.precio || 0).toLocaleString()}<span>/mes</span>
                                    </p>
                                    <div className="propiedad-features">
                                        <span><Icon name="fas fa-bed" /> {prop.cantidad_dormitorios || 0} dorm.</span>
                                        <span><Icon name="fas fa-bath" /> {prop.cantidad_banos || 0} {Number(prop.cantidad_banos) === 1 ? 'baño' : 'baños'}</span>
                                        <span><Icon name="fas fa-arrows-alt" /> {prop.cantidad_ambientes || 0} amb.</span>
                                    </div>
                                    <Link to={`/propiedades/${prop.id}`} className="btn-ver">
                                        <Icon name="fas fa-eye" /> Ver más
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="section-footer reveal">
                        <Link to="/propiedades" className="btn-ver-todas">Ver todas las propiedades</Link>
                    </div>
                </div>
            </section>

            {/* CATEGORÍAS */}
            <section className="categorias">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">Categorías</span>
                        <h2>Explorar por Categoría</h2>
                        <p>Encontrá lo que buscás</p>
                    </div>

                    <div className="categorias-grid">
                        {categorias.map((cat, i) => (
                            <Link
                                to={`/propiedades?categoria_id=${cat.id}`}
                                className="categoria-card reveal"
                                key={cat.id}
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <div className="categoria-icon">
                                    <Icon name={`fas ${iconoCategoria(cat.nombre)}`} />
                                </div>
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
                    <div className="section-header reveal">
                        <span className="section-badge">Servicios</span>
                        <h2>Servicios Destacados</h2>
                        <p>Comodidades que ofrecen nuestras propiedades</p>
                        {servicios.length > 8 && (
                            <Link to="/servicios" className="servicios-ver-todos">
                                Ver todos los servicios
                                <Icon name="fas fa-arrow-right" />
                            </Link>
                        )}
                    </div>

                    <div className="servicios-grid">
                        {servicios.length === 0 && (
                            <EmptyState
                                icono="fa-concierge-bell"
                                titulo="Todavía no hay servicios cargados"
                                descripcion="Pronto vas a poder filtrar las propiedades por servicios."
                            />
                        )}
                        {servicios.slice(0, 8).map((serv, i) => (
                            <div
                                className="servicio-card reveal"
                                key={serv.id}
                                style={{ transitionDelay: `${i * 70}ms` }}
                            >
                                <ServicioIcono nombre={serv.nombre} className="servicio-icon" />
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
                        {[
                            { numero: disponibles.length, label: 'Propiedades publicadas' },
                            { numero: categorias.length, label: 'Categorías disponibles' },
                            { numero: servicios.length, label: 'Servicios ofrecidos' },
                            { numero: localidades.length, label: 'Ciudades disponibles' },
                        ].map((stat, i) => (
                            <div
                                className="stat-item reveal"
                                key={stat.label}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <span className="stat-number">{stat.numero}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;