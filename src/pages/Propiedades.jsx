import Icon from '../components/Icon';
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

const nombreProvinciaVisible = (provincia) =>
    String(provincia?.nombre || '').replace(/\s+New$/, '');

const ORDENES_VALIDOS = ['antiguedad_desc', 'antiguedad_asc', 'precio_asc', 'precio_desc'];
const leerOrden = (params) => {
    const orden = params.get('orden');
    return ORDENES_VALIDOS.includes(orden) ? orden : 'antiguedad_desc';
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
    const [catalogosCargados, setCatalogosCargados] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [recarga, setRecarga] = useState(0);

    // Filtros
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
    const [orden, setOrden] = useState(() => leerOrden(searchParams));
    const [pagina, setPagina] = useState(() => {
        const paginaInicial = Number(searchParams.get('pagina'));
        return Number.isInteger(paginaInicial) && paginaInicial > 0 ? paginaInicial : 1;
    });

    const [aplicados, setAplicados] = useState(() => ({
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
        orden: leerOrden(searchParams)
    }));

    const POR_PAGINA = 10;

    useSEO(
        'Propiedades en alquiler',
        'AlquilER: buscá propiedades en alquiler por provincia, categoría, ambientes y precio. Departamentos, casas y locales comerciales.'
    );

    // Sincronizar filtros con la URL. Los filtros con varias opciones van como
    // arreglo para que React Router los escriba repetidos (categoria_id=1&...).
    useEffect(() => {
        const params = {};
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
        if (aplicados.orden !== 'antiguedad_desc') params.orden = aplicados.orden;
        if (pagina > 1) params.pagina = pagina;
        setSearchParams(params, { replace: true });
    }, [aplicados, pagina]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [cats, provs, locs, servs] = await Promise.all([
                getCategorias(),
                getProvincias(),
                getLocalidades(),
                getServicios()
            ]);
            setCategorias(cats);
            setProvincias(provs);
            setLocalidades(locs);
            setServicios(servs);
            setCatalogosCargados(true);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
            setError(error.message || 'No pudimos cargar las propiedades. Probá de nuevo en unos momentos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (!catalogosCargados) return undefined;

        let cancelado = false;
        const cargarPagina = async () => {
            setLoading(true);
            setError('');

            const localidadesProvincia = aplicados.provinciaId
                ? localidades
                    .filter(loc => String(loc.provincia_id) === String(aplicados.provinciaId))
                    .map(loc => String(loc.id))
                : null;
            const localidadesSeleccionadas = aplicados.localidadIds.map(String);
            const localidadIds = localidadesProvincia
                ? localidadesSeleccionadas.length > 0
                    ? localidadesSeleccionadas.filter(id => localidadesProvincia.includes(id))
                    : localidadesProvincia
                : localidadesSeleccionadas;

            if (localidadesProvincia && localidadIds.length === 0) {
                setPropiedades([]);
                setTotal(0);
                setTotalPaginas(1);
                setPagina(1);
                setLoading(false);
                return;
            }

            try {
                const resultado = await getPropiedades({
                    page: pagina,
                    perPage: POR_PAGINA,
                    categoriaIds: aplicados.categoriaIds,
                    localidadIds,
                    servicioIds: aplicados.servicioIds,
                    precioMin: aplicados.precioMin,
                    precioMax: aplicados.precioMax,
                    ambientes: aplicados.ambientes,
                    dormitorios: aplicados.dormitorios,
                    banos: aplicados.banos,
                    capacidad: aplicados.capacidad,
                    aceptaMascotas: aplicados.aceptaMascotas,
                    aceptaHijos: aplicados.aceptaHijos,
                    orden: aplicados.orden
                });

                if (cancelado) return;
                setPropiedades(resultado.items);
                setTotal(resultado.total);
                setTotalPaginas(resultado.pagination.last_page || 1);
                setPagina(Math.min(resultado.pagination.current_page, resultado.pagination.last_page || 1));
            } catch (error) {
                if (cancelado) return;
                console.error('Error cargando propiedades:', error);
                setError(error.message || 'No pudimos cargar las propiedades. Probá de nuevo en unos momentos.');
                setPropiedades([]);
                setTotal(0);
                setTotalPaginas(1);
            } finally {
                if (!cancelado) setLoading(false);
            }
        };

        cargarPagina();
        return () => { cancelado = true; };
    }, [catalogosCargados, aplicados, pagina, localidades, recarga]);

    const reintentar = () => {
        if (!catalogosCargados) {
            cargarDatos();
            return;
        }
        setRecarga(valor => valor + 1);
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

    // Localidades que dependen de la provincia elegida
    const localidadesDeProvincia = useMemo(() => {
        if (!provinciaId) return localidades;
        return localidades.filter(loc => String(loc.provincia_id) === String(provinciaId));
    }, [localidades, provinciaId]);

    const limpiarFiltros = () => {
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
        setOrden('antiguedad_desc');
        setAplicados({
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
            orden: 'antiguedad_desc'
        });
        setPagina(1);
    };

    const buscar = () => {
        setAplicados({
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

    const hayFiltros = aplicados.categoriaIds.length > 0
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
        || aplicados.orden !== 'antiguedad_desc';

    return (
        <div className="props-page">
            <div className="container props-body">
                {/* BUSCADOR + FILTROS */}
                <div className="props-filtros">
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
                            <option value="antiguedad_desc">Más recientes</option>
                            <option value="antiguedad_asc">Más antiguas</option>
                            <option value="precio_asc">Menor precio</option>
                            <option value="precio_desc">Mayor precio</option>
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
                        <strong>{total}</strong>{' '}
                        {total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                    </p>
                    {totalPaginas > 1 && (
                        <p className="props-results-count">
                            Página <strong>{pagina}</strong> de {totalPaginas}
                        </p>
                    )}
                </div>

                {/* GRID */}
                {error ? (
                    <ErrorState mensaje={error} onReintentar={reintentar} />
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
                ) : propiedades.length > 0 ? (
                    <>
                        <div className="propiedades-grid">
                            {propiedades.map(prop => (
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
                                    disabled={pagina === 1 || loading}
                                    onClick={() => setPagina(pagina - 1)}
                                >
                                    <Icon name="fas fa-chevron-left" />
                                </button>

                                {Array.from({ length: totalPaginas }).map((_, i) => {
                                    const num = i + 1;
                                    if (
                                        num === 1 ||
                                        num === totalPaginas ||
                                        Math.abs(num - pagina) <= 1
                                    ) {
                                        return (
                                            <button
                                                key={num}
                                                className={`pag-btn ${num === pagina ? 'active' : ''}`}
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
                                    disabled={pagina === totalPaginas || loading}
                                    onClick={() => setPagina(pagina + 1)}
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
                        descripcion="Probá ajustar los filtros para encontrar propiedades."
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