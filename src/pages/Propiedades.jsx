import Icon from '../components/Icon';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTodasLasPropiedades, getCategorias, getProvincias, getLocalidades, getFavoritos, getServicios } from '../services/api';
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

const nombreProvinciaVisible = (provincia) =>
    String(provincia?.nombre || '').replace(/\s+New$/, '');

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

    const [aplicados, setAplicados] = useState(() => ({
        search: searchParams.get('q') || '',
        categoriaIds: leerMultiples(searchParams, 'categoria_id'),
        provinciaId: searchParams.get('provincia_id') || '',
        localidadIds: leerMultiples(searchParams, 'localidad_id'),
        servicioIds: leerMultiples(searchParams, 'servicio_id'),
        precioMin: searchParams.get('precio_min') || '',
        precioMax: searchParams.get('precio_max') || '',
        ambientes: searchParams.get('cantidad_ambientes') || '',
        dormitorios: searchParams.get('cantidad_dormitorios') || '',
        banos: searchParams.get('cantidad_banos') || '',
        capacidad: searchParams.get('capacidad') || '',
        aceptaMascotas: searchParams.get('acepta_mascotas') || '',
        aceptaHijos: searchParams.get('acepta_hijos') || '',
        orden: searchParams.get('orden') || 'recientes'
    }));

    const POR_PAGINA = 10;

    // La description refleja la busqueda activa: si el visitante llego desde
    // Google con "departamentos en Rosario", el snippet debe coincidir.
    const descripcionSEO = aplicados.search.trim()
        ? `Resultados para "${aplicados.search.trim()}" en alquiler. Filtrá por provincia, categoría, cantidad de ambientes y precio.`
        : 'AlquilER: buscá propiedades en alquiler por provincia, categoría, ambientes y precio. Departamentos, casas y locales comerciales.';

    useSEO('Propiedades en alquiler', descripcionSEO);

    useEffect(() => {
        cargarDatos();
    }, []);

    // Sincronizar filtros con la URL. Los filtros con varias opciones van como
    // arreglo para que React Router los escriba repetidos (categoria_id=1&...).
    useEffect(() => {
        const params = {};
        if (aplicados.search) params.q = aplicados.search;
        if (aplicados.categoriaIds.length > 0) params.categoria_id = aplicados.categoriaIds.map(String);
        if (aplicados.provinciaId) params.provincia_id = aplicados.provinciaId;
        if (aplicados.localidadIds.length > 0) params.localidad_id = aplicados.localidadIds.map(String);
        if (aplicados.servicioIds.length > 0) params.servicio_id = aplicados.servicioIds.map(String);
        if (aplicados.precioMin) params.precio_min = aplicados.precioMin;
        if (aplicados.precioMax) params.precio_max = aplicados.precioMax;
        if (aplicados.ambientes) params.cantidad_ambientes = aplicados.ambientes;
        if (aplicados.dormitorios) params.cantidad_dormitorios = aplicados.dormitorios;
        if (aplicados.banos) params.cantidad_banos = aplicados.banos;
        if (aplicados.capacidad) params.capacidad = aplicados.capacidad;
        if (aplicados.aceptaMascotas) params.acepta_mascotas = aplicados.aceptaMascotas;
        if (aplicados.aceptaHijos) params.acepta_hijos = aplicados.aceptaHijos;
        if (aplicados.orden !== 'recientes') params.orden = aplicados.orden;
        if (pagina > 1) params.pagina = pagina;
        setSearchParams(params, { replace: true });
    }, [aplicados, pagina]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [props, cats, provs, locs, servs] = await Promise.all([
                getTodasLasPropiedades(),
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

        if (aplicados.search.trim()) {
            const q = aplicados.search.toLowerCase();
            resultado = resultado.filter(p =>
                (p.titulo || '').toLowerCase().includes(q) ||
                (p.direccion || '').toLowerCase().includes(q) ||
                (p.descripcion || '').toLowerCase().includes(q)
            );
        }

        // Categorías y localidades: con que coincida con alguna alcanza (whereIn)
        if (aplicados.categoriaIds.length > 0) {
            const elegidas = aplicados.categoriaIds.map(String);
            resultado = resultado.filter(p => elegidas.includes(String(p.categoria_id)));
        }

        if (aplicados.provinciaId) {
            resultado = resultado.filter(p =>
                localidadProvinciaMap[String(p.localidad_id)] === String(aplicados.provinciaId)
            );
        }

        if (aplicados.localidadIds.length > 0) {
            const elegidas = aplicados.localidadIds.map(String);
            resultado = resultado.filter(p => elegidas.includes(String(p.localidad_id)));
        }

        // Servicios: tiene que tener TODOS los elegidos, no al menos uno
        if (aplicados.servicioIds.length > 0) {
            const exigidos = aplicados.servicioIds.map(String);
            resultado = resultado.filter(p => {
                const deLaPropiedad = serviciosPorPropiedad[String(p.id)];
                return deLaPropiedad
                    && exigidos.every(id => deLaPropiedad.has(id));
            });
        }

        // Los filtros numéricos son "al menos", igual que los >= del backend
        if (aplicados.aceptaMascotas === '1') {
            resultado = resultado.filter(p => p.acepta_mascotas === true || p.acepta_mascotas === 1 || p.acepta_mascotas === '1');
        }

        if (aplicados.aceptaHijos === '1') {
            resultado = resultado.filter(p => p.acepta_hijos === true || p.acepta_hijos === 1 || p.acepta_hijos === '1');
        }

        if (aplicados.precioMin) {
            resultado = resultado.filter(p => Number(p.precio) >= Number(aplicados.precioMin));
        }

        if (aplicados.precioMax) {
            resultado = resultado.filter(p => Number(p.precio) <= Number(aplicados.precioMax));
        }

        if (aplicados.ambientes) {
            resultado = resultado.filter(p => Number(p.cantidad_ambientes) >= Number(aplicados.ambientes));
        }

        if (aplicados.dormitorios) {
            resultado = resultado.filter(p => Number(p.cantidad_dormitorios) >= Number(aplicados.dormitorios));
        }

        if (aplicados.banos) {
            resultado = resultado.filter(p => Number(p.cantidad_banos) >= Number(aplicados.banos));
        }

        if (aplicados.capacidad) {
            resultado = resultado.filter(p => Number(p.capacidad) >= Number(aplicados.capacidad));
        }

        switch (aplicados.orden) {
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
    }, [propiedades, aplicados, localidadProvinciaMap, serviciosPorPropiedad]);

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
        setAplicados({
            search: '',
            categoriaIds: [],
            provinciaId: '',
            localidadIds: [],
            servicioIds: [],
            precioMin: '',
            precioMax: '',
            ambientes: '',
            dormitorios: '',
            banos: '',
            capacidad: '',
            aceptaMascotas: '',
            aceptaHijos: '',
            orden: 'recientes'
        });
        setPagina(1);
    };

    const buscar = () => {
        setAplicados({
            search,
            categoriaIds,
            provinciaId,
            localidadIds,
            servicioIds,
            precioMin,
            precioMax,
            ambientes,
            dormitorios,
            banos,
            capacidad,
            aceptaMascotas,
            aceptaHijos,
            orden
        });
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

    const hayFiltros = aplicados.search
        || aplicados.categoriaIds.length > 0
        || aplicados.provinciaId
        || aplicados.localidadIds.length > 0
        || aplicados.servicioIds.length > 0
        || aplicados.precioMin
        || aplicados.precioMax
        || aplicados.ambientes
        || aplicados.dormitorios
        || aplicados.banos
        || aplicados.capacidad
        || aplicados.aceptaMascotas
        || aplicados.aceptaHijos
        || aplicados.orden !== 'recientes';

    return (
        <div className="props-page">
            <div className="container props-body">
                {/* BUSCADOR + FILTROS */}
                <div className="props-filtros">
                    <div className="filtro-group">
                        <label htmlFor="filtro-buscar"><Icon name="fas fa-search" /> Buscar</label>
                        <input
                            id="filtro-buscar"
                            type="text"
                            placeholder="Título o dirección..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); }}
                        />
                    </div>

                    <MultiSelect
                        label="Categoría"
                        icon="fa-tag"
                        options={categorias}
                        selected={categoriaIds}
                        onChange={valores => { setCategoriaIds(valores); }}
                    />

                    <div className="filtro-group">
                        <label><Icon name="fas fa-map-marker-alt" /> Provincia</label>
                        <select
                            value={provinciaId}
                            onChange={(e) => { setProvinciaId(e.target.value); setLocalidadIds([]); }}
                        >
                            <option value="">Todas</option>
                            {provincias.map(prov => (
                                <option key={prov.id} value={prov.id}>{nombreProvinciaVisible(prov)}</option>
                            ))}
                        </select>
                    </div>

                    <MultiSelect
                        label="Localidad"
                        icon="fa-city"
                        options={localidadesDeProvincia}
                        selected={localidadIds}
                        onChange={valores => { setLocalidadIds(valores); }}
                        disabled={localidadesDeProvincia.length === 0}
                    />

                    <MultiSelect
                        label="Servicios"
                        icon="fa-plug"
                        options={servicios}
                        selected={servicioIds}
                        onChange={valores => { setServicioIds(valores); }}
                    />

                    <div className="filtro-group">
                        <label><Icon name="fas fa-paw" /> Mascotas</label>
                        <select
                            value={aceptaMascotas}
                            onChange={(e) => { setAceptaMascotas(e.target.value); }}
                        >
                            <option value="">Todas</option>
                            <option value="1">Se aceptan</option>
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-children" /> Hijos</label>
                        <select
                            value={aceptaHijos}
                            onChange={(e) => { setAceptaHijos(e.target.value); }}
                        >
                            <option value="">Todos</option>
                            <option value="1">Se aceptan</option>
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-dollar-sign" /> Precio mín.</label>
                        <input
                            type="number"
                            placeholder="Ej: 100000"
                            value={precioMin}
                            onChange={(e) => { setPrecioMin(e.target.value); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-dollar-sign" /> Precio máx.</label>
                        <input
                            type="number"
                            placeholder="Ej: 250000"
                            value={precioMax}
                            onChange={(e) => { setPrecioMax(e.target.value); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-couch" /> Ambientes</label>
                        <input
                            type="number"
                            placeholder="Mín."
                            value={ambientes}
                            onChange={(e) => { setAmbientes(e.target.value); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-bed" /> Dormitorios</label>
                        <input
                            type="number"
                            placeholder="Mín."
                            value={dormitorios}
                            onChange={(e) => { setDormitorios(e.target.value); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-bath" /> Baños</label>
                        <input
                            type="number"
                            placeholder="Mín."
                            value={banos}
                            onChange={(e) => { setBanos(e.target.value); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-users" /> Capacidad</label>
                        <input
                            type="number"
                            placeholder="Mín. personas"
                            value={capacidad}
                            onChange={(e) => { setCapacidad(e.target.value); }}
                            min="0"
                        />
                    </div>

                    <div className="filtro-group">
                        <label><Icon name="fas fa-sort" /> Ordenar por</label>
                        <select
                            value={orden}
                            onChange={(e) => { setOrden(e.target.value); }}
                        >
                            <option value="recientes">Más recientes</option>
                            <option value="precio_asc">Menor precio</option>
                            <option value="precio_desc">Mayor precio</option>
                            <option value="titulo">Título (A-Z)</option>
                        </select>
                    </div>

                    <button className="btn-buscar" onClick={buscar}>
                        <Icon name="fas fa-search" /> Buscar
                    </button>

                    {hayFiltros && (
                        <button className="btn-limpiar" onClick={limpiarFiltros}>
                            <Icon name="fas fa-times" /> Limpiar
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
                                    <Icon name="fas fa-chevron-left" />
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
                                    <Icon name="fas fa-chevron-right" />
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
                                    <Icon name="fas fa-times" /> Limpiar filtros
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