import Icon from '../components/Icon';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTodasLasPropiedades, getPropiedadesDestacadas, getCategorias, getServicios, getLocalidades } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import { leerVistosRecientemente } from '../utils/vistosRecientemente';
import PropiedadCardImage from '../components/PropiedadCardImage';
import ServicioIcono from '../components/ServicioIcono';
import { iconoCategoria } from '../utils/categorias';
import { useSEO } from '../hooks/useSEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SkeletonCard from '../components/SkeletonCard';

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
    const [vistosIds, setVistosIds] = useState(() => leerVistosRecientemente());
    const [paginaCarrusel, setPaginaCarrusel] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [categoriaBusqueda, setCategoriaBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (busqueda.trim().length < 2) {
            setSugerencias([]);
            return;
        }
        const q = busqueda.toLowerCase();
        const matches = localidades
            .filter(l => (l.nombre || '').toLowerCase().includes(q))
            .slice(0, 8);
        setSugerencias(matches);
    }, [busqueda, localidades]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [props, dest, cats, serv, localidadesRes] = await Promise.all([
                getTodasLasPropiedades(),
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

    if (loading) {
        return (
            <>
                <section className="hero">
                    <div className="container">
                        <div className="hero-grid">
                            <div className="hero-content">
                                <div className="skeleton" style={{ height: '46px', width: '90%', marginBottom: '12px', borderRadius: '10px' }} />
                                <div className="skeleton" style={{ height: '18px', width: '80%', marginBottom: '26px', borderRadius: '8px' }} />
                                <div className="skeleton" style={{ height: '58px', width: '100%', borderRadius: '12px' }} />
                            </div>
                            <div className="hero-image">
                                <div className="skeleton" style={{ height: '100%', width: '100%', borderRadius: '16px', minHeight: '260px' }} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="propiedades-home">
                    <div className="container">
                        <div className="propiedades-header">
                            <div className="skeleton" style={{ height: '24px', width: '240px', borderRadius: '8px' }} />
                            <div className="skeleton" style={{ height: '40px', width: '180px', borderRadius: '8px' }} />
                        </div>
                        <div className="propiedades-grid">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                </section>
            </>
        );
    }

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

    // Un solo carrusel: destacadas primero y luego recientes (sin duplicar)
    const propiedadesCarrusel = [
        ...destacadasDisponibles,
        ...disponibles.filter(p => !destacadasDisponibles.some(d => Number(d.id) === Number(p.id)))
    ].slice(0, 12);

    const porPaginaCarrusel = 4;
    const totalPaginasCarrusel = Math.max(1, Math.ceil(propiedadesCarrusel.length / porPaginaCarrusel));
    const paginaSeguraCarrusel = Math.min(paginaCarrusel, totalPaginasCarrusel - 1);
    const propiedadesAMostrar = propiedadesCarrusel.slice(
        paginaSeguraCarrusel * porPaginaCarrusel,
        (paginaSeguraCarrusel + 1) * porPaginaCarrusel
    );

    // "Vistos recientemente": resolvemos los IDs guardados contra las
    // propiedades ya cargadas, así no hacemos ningún pedido extra. Solo
    // mostramos las que siguen disponibles y sin repetir la actual.
    const vistosRecientes = vistosIds
        .map(id => disponibles.find(p => Number(p.id) === id))
        .filter(Boolean)
        .slice(0, 4);

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
                                <div className="search-box-row">
                                    <div className="search-autocomplete">
                                        <input
                                            type="text"
                                            placeholder="Localidad"
                                            aria-label="Buscar propiedad por dirección o título"
                                            value={busqueda}
                                            onChange={(e) => { setBusqueda(e.target.value); setMostrarSugerencias(true); }}
                                            onFocus={() => setMostrarSugerencias(true)}
                                            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                                            autoComplete="off"
                                        />
                                        {mostrarSugerencias && sugerencias.length > 0 && (
                                            <ul className="search-sugerencias">
                                                {sugerencias.map(s => (
                                                    <li
                                                        key={s.id}
                                                        onMouseDown={() => {
                                                            setBusqueda(s.nombre);
                                                            setMostrarSugerencias(false);
                                                        }}
                                                    >
                                                        <Icon name="fas fa-map-marker-alt" /> {s.nombre}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <button type="submit" className="btn-search">
                                        <Icon name="fas fa-search" /> Buscar
                                    </button>
                                </div>
                                <div className="home-categorias">
                                    <button
                                        type="button"
                                        className={`home-categoria-btn ${categoriaBusqueda === '' ? 'active' : ''}`}
                                        onClick={() => setCategoriaBusqueda('')}
                                    >
                                        Todas
                                    </button>
                                    {categorias.map(cat => (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            className={`home-categoria-btn ${String(categoriaBusqueda) === String(cat.id) ? 'active' : ''}`}
                                            onClick={() => setCategoriaBusqueda(String(cat.id))}
                                        >
                                            {cat.nombre}
                                        </button>
                                    ))}
                                </div>
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

            {/* PROPIEDADES DESTACADAS / RECIENTES (CARRUSEL) */}
            <section className="propiedades-destacadas">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">Catálogo</span>
                        <h2>{hayDestacadas ? 'Propiedades Destacadas' : 'Propiedades Recientes'}</h2>
                        <p>{hayDestacadas ? 'Las propiedades destacadas por nuestro equipo' : 'Las últimas publicaciones en AlquilER'}</p>
                    </div>

                    <div className="home-carrusel">
                        <button
                            type="button"
                            className="home-carrusel-btn"
                            onClick={() => setPaginaCarrusel(p => Math.max(0, p - 1))}
                            disabled={paginaSeguraCarrusel === 0}
                            aria-label="Anterior"
                        >
                            <Icon name="fas fa-chevron-left" />
                        </button>

                        <div className="propiedades-grid home-carrusel-grid">
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

                        <button
                            type="button"
                            className="home-carrusel-btn"
                            onClick={() => setPaginaCarrusel(p => Math.min(totalPaginasCarrusel - 1, p + 1))}
                            disabled={paginaSeguraCarrusel >= totalPaginasCarrusel - 1}
                            aria-label="Siguiente"
                        >
                            <Icon name="fas fa-chevron-right" />
                        </button>
                    </div>

                    {totalPaginasCarrusel > 1 && (
                        <div className="home-carrusel-dots">
                            {Array.from({ length: totalPaginasCarrusel }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`home-carrusel-dot ${i === paginaSeguraCarrusel ? 'active' : ''}`}
                                    onClick={() => setPaginaCarrusel(i)}
                                    aria-label={`Página ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="section-footer reveal">
                        <Link to="/propiedades" className="btn-ver-todas">Ver todas las propiedades</Link>
                    </div>
                </div>
            </section>

            {/* VISTOS RECIENTEMENTE */}
            {vistosRecientes.length > 0 && (
                <section className="propiedades-destacadas vistos-recientemente">
                    <div className="container">
                        <div className="section-header reveal">
                            <span className="section-badge">Tu historial</span>
                            <h2>Vistos recientemente</h2>
                            <p>Seguí donde lo dejaste</p>
                        </div>

                        <div className="propiedades-grid">
                            {vistosRecientes.map((prop, i) => (
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
                    </div>
                </section>
            )}

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