import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPropiedades, getCategorias, getProvincias, getLocalidades, getFavoritos, getServicios } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSEO } from '../hooks/useSEO';
import PropiedadCard from '../components/PropiedadCard';
import MultiSelect from '../components/MultiSelect';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

// Acepta el valor repetido (categoria_id=1&categoria_id=2) y tambien el
// separado por comas (categoria_id=1,2), que es como vienen los links viejos.
const leerMultiples = (params, clave) => {
    const repetidos = params.getAll(clave);
    const crudos = repetidos.length > 0
        ? repetidos
        : (params.get(clave) ? [params.get(clave)] : []);

    return crudos
        .flatMap(valor => String(valor).split(','))
        .map(valor => Number(valor.trim()))
        .filter(valor => Number.isInteger(valor) && valor > 0);
};

function Propiedades() {
    const { token } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [propiedades, setPropiedades] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [favoritoIds, setFavoritoIds] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtros
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [categoriaIds, setCategoriaIds] = useState(() => leerMultiples(searchParams, 'categoria_id'));
    const [provinciaId, setProvinciaId] = useState(searchParams.get('provincia_id') || '');
    const [localidadIds, setLocalidadIds] = useState(() => leerMultiples(searchParams, 'localidad_id'));
    const [servicioIds, setServicioIds] = useState(() => leerMultiples(searchParams, 'servicio_id'));
    const [precioMin, setPrecioMin] = useState(searchParams.get('precio_min') || '');
    const [precioMax, setPrecioMax] = useState(searchParams.get('precio_max') || '');
    const [ambientes, setAmbientes] = useState(searchParams.get('cantidad_ambientes') || '');
    const [dormitorios, setDormitorios] = useState(searchParams.get('cantidad_dormitorios') || '');
    const [banos, setBanos] = useState(searchParams.get('cantidad_banos') || '');
    const [capacidad, setCapacidad] = useState(searchParams.get('capacidad') || '');
    const [aceptaMascotas, setAceptaMascotas] = useState(searchParams.get('acepta_mascotas') || '');
    const [aceptaHijos, setAceptaHijos] = useState(searchParams.get('acepta_hijos') || '');
    const [orden, setOrden] = useState(searchParams.get('orden') || 'recientes');
    const [pagina, setPagina] = useState(Number(searchParams.get('pagina')) || 1);

    const POR_PAGINA = 9;

    // La description refleja la busqueda activa: si el visitante llego desde
    // Google con "departamentos en Rosario", el snippet debe coincidir.
    const descripcionSEO = search.trim()
        ? `Resultados para "${search.trim()}" en alquiler. Filtrá por provincia, categoría, cantidad de ambientes y precio.`
        : 'AlquilER: buscá propiedades en alquiler por provincia, categoría, ambientes y precio. Departamentos, casas y locales comerciales.';

    useSEO('Propiedades en alquiler', descripcionSEO);

    useEffect(() => {
        cargarDatos();
    }, []);

    // Sincronizar filtros con la URL. Los filtros con varias opciones van como
    // arreglo para que React Router los escriba repetidos (categoria_id=1&...).
    useEffect(() => {
        const params = {};
        if (search) params.q = search;
        if (categoriaIds.length > 0) params.categoria_id = categoriaIds.map(String);
        if (provinciaId) params.provincia_id = provinciaId;
        if (localidadIds.length > 0) params.localidad_id = localidadIds.map(String);
        if (servicioIds.length > 0) params.servicio_id = servicioIds.map(String);
        if (precioMin) params.precio_min = precioMin;
        if (precioMax) params.precio_max = precioMax;
        if (ambientes) params.cantidad_ambientes = ambientes;
        if (dormitorios) params.cantidad_dormitorios = dormitorios;
        if (banos) params.cantidad_banos = banos;
        if (capacidad) params.capacidad = capacidad;
        if (aceptaMascotas) params.acepta_mascotas = aceptaMascotas;
        if (aceptaHijos) params.acepta_hijos = aceptaHijos;
        if (orden !== 'recientes') params.orden = orden;
        if (pagina > 1) params.pagina = pagina;
        setSearchParams(params, { replace: true });
    }, [search, categoriaIds, provinciaId, localidadIds, servicioIds, precioMin, precioMax, ambientes, dormitorios, banos, capacidad, aceptaMascotas, aceptaHijos, orden, pagina]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [props, cats, provs, locs, servs] = await Promise.all([
                getPropiedades(),
                getCategorias(),
                getProvincias(),
                getLocalidades(),
                getServicios()
            ]);
            setPropiedades(props);
            setCategorias(cats);
            setProvincias(provs);
            setLocalidades(locs);
            setServicios(servs);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
            setError(error.message || 'No pudimos cargar las propiedades. Probá de nuevo en unos momentos.');
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

    // Ids de los servicios de cada propiedad, para filtrar sin volver a pedirlo
    const serviciosPorPropiedad = useMemo(() => {
        const map = {};
        propiedades.forEach(p => {
            map[String(p.id)] = new Set(
                (p.servicios || []).map(s => String(s.id))
            );
        });
        return map;
    }, [propiedades]);

    // Filtrado y ordenamiento
    const filtradas = useMemo(() => {
        let resultado = [...propiedades];

        // Excluir del catálogo público las propiedades marcadas como no disponibles
        resultado = resultado.filter(p =>
            p.disponible !== false && p.disponible !== 0 && p.disponible !== '0'
        );

        if (search.trim()) {
            const q = search.toLowerCase();
            resultado = resultado.filter(p =>
                (p.titulo || '').toLowerCase().includes(q) ||
                (p.direccion || '').toLowerCase().includes(q) ||
                (p.descripcion || '').toLowerCase().includes(q)
            );
        }

        // Categorías y localidades: con que coincida con alguna alcanza (whereIn)
        if (categoriaIds.length > 0) {
            const elegidas = categoriaIds.map(String);
            resultado = resultado.filter(p => elegidas.includes(String(p.categoria_id)));
        }

        if (provinciaId) {
            resultado = resultado.filter(p =>
                localidadProvinciaMap[String(p.localidad_id)] === String(provinciaId)
            );
        }

        if (localidadIds.length > 0) {
            const elegidas = localidadIds.map(String);
            resultado = resultado.filter(p => elegidas.includes(String(p.localidad_id)));
        }

        // Servicios: tiene que tener TODOS los elegidos, no al menos uno
        if (servicioIds.length > 0) {
            const exigidos = servicioIds.map(String);
            resultado = resultado.filter(p => {
                const deLaPropiedad = serviciosPorPropiedad[String(p.id)];
                return deLaPropiedad
                    && exigidos.every(id => deLaPropiedad.has(id));
            });
        }

        // Los filtros numéricos son "al menos", igual que los >= del backend
        if (aceptaMascotas === '1') {
            resultado = resultado.filter(p => p.acepta_mascotas === true || p.acepta_mascotas === 1 || p.acepta_mascotas === '1');
        }

        if (aceptaHijos === '1') {
            resultado = resultado.filter(p => p.acepta_hijos === true || p.acepta_hijos === 1 || p.acepta_hijos === '1');
        }

        if (precioMin) {
            resultado = resultado.filter(p => Number(p.precio) >= Number(precioMin));
        }

        if (precioMax) {
            resultado = resultado.filter(p => Number(p.precio) <= Number(precioMax));
        }

        if (ambientes) {
            resultado = resultado.filter(p => Number(p.cantidad_ambientes) >= Number(ambientes));
        }

        if (dormitorios) {
            resultado = resultado.filter(p => Number(p.cantidad_dormitorios) >= Number(dormitorios));
        }

        if (banos) {
            resultado = resultado.filter(p => Number(p.cantidad_banos) >= Number(banos));
        }

        if (capacidad) {
            resultado = resultado.filter(p => Number(p.capacidad) >= Number(capacidad));
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
    }, [propiedades, search, categoriaIds, provinciaId, localidadIds, localidadProvinciaMap, servicioIds, serviciosPorPropiedad, precioMin, precioMax, ambientes, dormitorios, banos, capacidad, aceptaMascotas, aceptaHijos, orden]);

    // Paginación
    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const paginadas = filtradas.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );

    const limpiarFiltros = () => {
        setSearch('');
        setCategoriaIds([]);
        setProvinciaId('');
        setLocalidadIds([]);
        setServicioIds([]);
        setPrecioMin('');
        setPrecioMax('');
        setAmbientes('');
        setDormitorios('');
        setBanos('');
        setCapacidad('');
        setAceptaMascotas('');
        setAceptaHijos('');
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

    const hayFiltros = search
        || categoriaIds.length > 0
        || provinciaId
        || localidadIds.length > 0
        || servicioIds.length > 0
        || precioMin
        || precioMax
        || ambientes
        || dormitorios
        || banos
        || capacidad
        || aceptaMascotas
        || aceptaHijos
        || orden !== 'recientes';

    return (
        <div className="props-page">
            <div className="container props-body">
                {/* BUSCADOR + FILTROS */}
                <div className="props-filtros">
                    <div className="filtro-group filtro-search">
                        <label htmlFor="filtro-buscar"><i className="fas fa-search"></i> Buscar</label>
                        <input
                            id="filtro-buscar"
                            type="text"
                            placeholder="Título o dirección..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPagina(1); }}
                        />
                    </div>

                    <MultiSelect
                        label="Categoría"
                        icon="fa-tag"
                        options={categorias}
                        selected={categoriaIds}
                        onChange={valores => { setCategoriaIds(valores); setPagina(1); }}
                    />

                    <div className="filtro-group">
                        <label><i className="fas fa-map-marker-alt"></i> Provincia</label>
                        <select
                            value={provinciaId}
                            onChange={(e) => { setProvinciaId(e.target.value); setLocalidadIds([]); setPagina(1); }}
                        >
                            <option value="">Todas</option>
                            {provincias.map(prov => (
                                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <MultiSelect
                        label="Localidad"
                        icon="fa-city"
                        options={localidadesDeProvincia}
                        selected={localidadIds}
                        onChange={valores => { setLocalidadIds(valores); setPagina(1); }}
                        disabled={localidadesDeProvincia.length === 0}
                    />

                    <MultiSelect
                        label="Servicios"
                        icon="fa-plug"
                        options={servicios}
                        selected={servicioIds}
                        onChange={valores => { setServicioIds(valores); setPagina(1); }}
                    />

                    <div className="filtro-group">
                        <label><i className="fas fa-paw"></i> Mascotas</label>
                        <select
                            value={aceptaMascotas}
                            onChange={(e) => { setAceptaMascotas(e.target.value); setPagina(1); }}
                        >
                            <option value="">Todas</option>
                            <option value="1">Se aceptan</option>
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-children"></i> Hijos</label>
                        <select
                            value={aceptaHijos}
                            onChange={(e) => { setAceptaHijos(e.target.value); setPagina(1); }}
                        >
                            <option value="">Todos</option>
                            <option value="1">Se aceptan</option>
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-dollar-sign"></i> Precio mín.</label>
                        <input
                            type="number"
                            placeholder="Ej: 100000"
                            value={precioMin}
                            onChange={(e) => { setPrecioMin(e.target.value); setPagina(1); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-dollar-sign"></i> Precio máx.</label>
                        <input
                            type="number"
                            placeholder="Ej: 250000"
                            value={precioMax}
                            onChange={(e) => { setPrecioMax(e.target.value); setPagina(1); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-couch"></i> Ambientes</label>
                        <input
                            type="number"
                            placeholder="Mín."
                            value={ambientes}
                            onChange={(e) => { setAmbientes(e.target.value); setPagina(1); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-bed"></i> Dormitorios</label>
                        <input
                            type="number"
                            placeholder="Mín."
                            value={dormitorios}
                            onChange={(e) => { setDormitorios(e.target.value); setPagina(1); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-bath"></i> Baños</label>
                        <input
                            type="number"
                            placeholder="Mín."
                            value={banos}
                            onChange={(e) => { setBanos(e.target.value); setPagina(1); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><i className="fas fa-users"></i> Capacidad</label>
                        <input
                            type="number"
                            placeholder="Mín. personas"
                            value={capacidad}
                            onChange={(e) => { setCapacidad(e.target.value); setPagina(1); }}
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
                {error ? (
                    <ErrorState mensaje={error} onReintentar={cargarDatos} />
                ) : loading ? (
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
                    <EmptyState
                        icono="fa-search"
                        titulo="No encontramos resultados"
                        descripcion="Probá con otro término de búsqueda o ajustá los filtros."
                        action={
                            hayFiltros ? (
                                <button className="btn-ver-todas" onClick={limpiarFiltros} style={{ marginTop: '20px' }}>
                                    <i className="fas fa-times"></i> Limpiar filtros
                                </button>
                            ) : null
                        }
                    />
                )}
            </div>
        </div>
    );
}

export default Propiedades;