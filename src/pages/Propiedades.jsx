import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPropiedades, getCategorias, getProvincias, getLocalidades, getFavoritos } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PropiedadCard from '../components/PropiedadCard';

function Propiedades() {
    const { token } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [propiedades, setPropiedades] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [favoritoIds, setFavoritoIds] = useState(() => new Set());
    const [loading, setLoading] = useState(true);

    // Filtros
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [categoriaId, setCategoriaId] = useState(searchParams.get('categoria_id') || '');
    const [provinciaId, setProvinciaId] = useState(searchParams.get('provincia_id') || '');
    const [localidadId, setLocalidadId] = useState(searchParams.get('localidad_id') || '');
    const [precioMax, setPrecioMax] = useState(searchParams.get('precio_max') || '');
    const [orden, setOrden] = useState(searchParams.get('orden') || 'recientes');
    const [pagina, setPagina] = useState(Number(searchParams.get('pagina')) || 1);

    const POR_PAGINA = 9;

    useEffect(() => {
        cargarDatos();
    }, []);

    // Sincronizar filtros con la URL
    useEffect(() => {
        const params = {};
        if (search) params.q = search;
        if (categoriaId) params.categoria_id = categoriaId;
        if (provinciaId) params.provincia_id = provinciaId;
        if (localidadId) params.localidad_id = localidadId;
        if (precioMax) params.precio_max = precioMax;
        if (orden !== 'recientes') params.orden = orden;
        if (pagina > 1) params.pagina = pagina;
        setSearchParams(params, { replace: true });
    }, [search, categoriaId, provinciaId, localidadId, precioMax, orden, pagina]);

    const cargarDatos = async () => {
        try {
            const [props, cats, provs, locs] = await Promise.all([
                getPropiedades(),
                getCategorias(),
                getProvincias(),
                getLocalidades()
            ]);
            setPropiedades(props);
            setCategorias(cats);
            setProvincias(provs);
            setLocalidades(locs);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar IDs favoritos del usuario autenticado
    useEffect(() => {
        if (!token) {
            setFavoritoIds(new Set());
            return;
        }

        let cancelado = false;
        getFavoritos(token)
            .then(result => {
                if (cancelado) return;
                const items = result?.data;
                const ids = Array.isArray(items)
                    ? items.map(fav => Number(fav.propiedad_id)).filter(Boolean)
                    : [];
                setFavoritoIds(new Set(ids));
            })
            .catch(error => console.error('Error cargando favoritos:', error));
        return () => { cancelado = true; };
    }, [token]);

    // Mapa de categorías
    const categoriasMap = useMemo(() => {
        const map = {};
        categorias.forEach(cat => { map[cat.id] = cat.nombre; });
        return map;
    }, [categorias]);

    // Localidad -> provincia (para filtrar propiedades por provincia)
    const localidadProvinciaMap = useMemo(() => {
        const map = {};
        localidades.forEach(loc => { map[String(loc.id)] = String(loc.provincia_id); });
        return map;
    }, [localidades]);

    // Localidades que dependen de la provincia elegida
    const localidadesDeProvincia = useMemo(() => {
        if (!provinciaId) return localidades;
        return localidades.filter(loc => String(loc.provincia_id) === String(provinciaId));
    }, [localidades, provinciaId]);

    // Filtrado y ordenamiento
    const filtradas = useMemo(() => {
        let resultado = [...propiedades];

        if (search.trim()) {
            const q = search.toLowerCase();
            resultado = resultado.filter(p =>
                (p.titulo || '').toLowerCase().includes(q) ||
                (p.direccion || '').toLowerCase().includes(q) ||
                (p.descripcion || '').toLowerCase().includes(q)
            );
        }

        if (categoriaId) {
            resultado = resultado.filter(p => String(p.categoria_id) === String(categoriaId));
        }

        if (provinciaId) {
            resultado = resultado.filter(p =>
                localidadProvinciaMap[String(p.localidad_id)] === String(provinciaId)
            );
        }

        if (localidadId) {
            resultado = resultado.filter(p => String(p.localidad_id) === String(localidadId));
        }

        if (precioMax) {
            resultado = resultado.filter(p => Number(p.precio) <= Number(precioMax));
        }

        switch (orden) {
            case 'precio_asc':
                resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
                break;
            case 'precio_desc':
                resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
                break;
            case 'titulo':
                resultado.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
                break;
            default:
                resultado.sort((a, b) => Number(b.id) - Number(a.id));
        }

        return resultado;
    }, [propiedades, search, categoriaId, provinciaId, localidadId, localidadProvinciaMap, precioMax, orden]);

    // Paginación
    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const paginadas = filtradas.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );

    const limpiarFiltros = () => {
        setSearch('');
        setCategoriaId('');
        setProvinciaId('');
        setLocalidadId('');
        setPrecioMax('');
        setOrden('recientes');
        setPagina(1);
    };

    const handleFavorito = (propiedadId, esFavorito) => {
        setFavoritoIds(prev => {
            const next = new Set(prev);
            if (esFavorito) {
                next.add(Number(propiedadId));
            } else {
                next.delete(Number(propiedadId));
            }
            return next;
        });
    };

    const hayFiltros = search || categoriaId || provinciaId || localidadId || precioMax || orden !== 'recientes';

    return (
        <div className="props-page">
            <div className="container props-body">
                {/* BUSCADOR + FILTROS */}
                <div className="props-filtros">
                    <div className="filtro-group filtro-search">
                        <label><i className="fas fa-search"></i> Buscar</label>
                        <input
                            type="text"
                            placeholder="Título o dirección..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPagina(1); }}
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-tag"></i> Categoría</label>
                        <select
                            value={categoriaId}
                            onChange={(e) => { setCategoriaId(e.target.value); setPagina(1); }}
                        >
                            <option value="">Todas</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-map-marker-alt"></i> Provincia</label>
                        <select
                            value={provinciaId}
                            onChange={(e) => { setProvinciaId(e.target.value); setLocalidadId(''); setPagina(1); }}
                        >
                            <option value="">Todas</option>
                            {provincias.map(prov => (
                                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-city"></i> Localidad</label>
                        <select
                            value={localidadId}
                            onChange={(e) => { setLocalidadId(e.target.value); setPagina(1); }}
                            disabled={localidadesDeProvincia.length === 0}
                        >
                            <option value="">Todas</option>
                            {localidadesDeProvincia.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-dollar-sign"></i> Precio máximo</label>
                        <input
                            type="number"
                            placeholder="Ej: 50000"
                            value={precioMax}
                            onChange={(e) => { setPrecioMax(e.target.value); setPagina(1); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-sort"></i> Ordenar por</label>
                        <select
                            value={orden}
                            onChange={(e) => { setOrden(e.target.value); setPagina(1); }}
                        >
                            <option value="recientes">Más recientes</option>
                            <option value="precio_asc">Menor precio</option>
                            <option value="precio_desc">Mayor precio</option>
                            <option value="titulo">Título (A-Z)</option>
                        </select>
                    </div>

                    {hayFiltros && (
                        <button className="btn-limpiar" onClick={limpiarFiltros}>
                            <i className="fas fa-times"></i> Limpiar
                        </button>
                    )}
                </div>

                {/* RESULTADOS */}
                <div className="props-results">
                    <p className="props-results-count">
                        <strong>{filtradas.length}</strong>{' '}
                        {filtradas.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                    </p>
                    {totalPaginas > 1 && (
                        <p className="props-results-count">
                            Página <strong>{paginaActual}</strong> de {totalPaginas}
                        </p>
                    )}
                </div>

                {/* GRID */}
                {loading ? (
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
                ) : paginadas.length > 0 ? (
                    <>
                        <div className="propiedades-grid">
                            {paginadas.map(prop => (
                                <PropiedadCard
                                    key={prop.id}
                                    propiedad={prop}
                                    categoriaNombre={categoriasMap[prop.categoria_id]}
                                    esFavoritoInicial={favoritoIds.has(Number(prop.id))}
                                    onFavorito={handleFavorito}
                                />
                            ))}
                        </div>

                        {/* PAGINACIÓN */}
                        {totalPaginas > 1 && (
                            <div className="props-paginacion">
                                <button
                                    className="pag-btn"
                                    disabled={paginaActual === 1}
                                    onClick={() => setPagina(paginaActual - 1)}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                {Array.from({ length: totalPaginas }).map((_, i) => {
                                    const num = i + 1;
                                    if (
                                        num === 1 ||
                                        num === totalPaginas ||
                                        Math.abs(num - paginaActual) <= 1
                                    ) {
                                        return (
                                            <button
                                                key={num}
                                                className={`pag-btn ${num === paginaActual ? 'active' : ''}`}
                                                onClick={() => setPagina(num)}
                                            >
                                                {num}
                                            </button>
                                        );
                                    }
                                    if (num === 2 || num === totalPaginas - 1) {
                                        return <span key={num} className="pag-dots">…</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    className="pag-btn"
                                    disabled={paginaActual === totalPaginas}
                                    onClick={() => setPagina(paginaActual + 1)}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon"><i className="fas fa-home"></i></div>
                        <h3>No encontramos resultados</h3>
                        <p>Probá con otro término de búsqueda o ajustá los filtros.</p>
                        {hayFiltros && (
                            <button className="btn-ver-todas" onClick={limpiarFiltros} style={{ marginTop: '20px' }}>
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Propiedades;