import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Loader';
import Alert from '../Alert';

// Componente CRUD genérico configurable.
// config espera:
//   titulo, nombreSingular, icono, descripcion, columnaPrincipal
//   obtener: (token) => Promise -> { data: { items } } | [array]
//   crear / actualizar / eliminar: (payload, token) => Promise -> { success, message|error, validation_errors? }
//   columnas: [{ key, label, render?: (item, externos) => node, csv?: (item, externos) => string }]
//   campos:   [{ name, label, type?, requerido?, min?, max?, placeholder?, ayuda?, opciones? }]
//   externos?: [{ clave, cargar: () => Promise -> [array] }]   (fuentes para selects/columnas)
//   normalizarEdicion?: (item) => objeto   (transforma el item antes de precargar el modal de edición)
//   filtros?: [{ parametro, label, tipo?: 'select'|'date'|'number'|'text', opciones?: [{ value, label }] }]
//              (filtros server-side; obtener y papelera.obtener reciben (token, filtros))
//   acciones?: [{ etiqueta, icono, clase?, permitido?: (item) => bool, ejecutar: (item, token) => Promise }]
//              (botones contextuales por fila; se muestran antes de Editar/Eliminar)
//   detalle?: { titulo?: (item) => string, cargar: (item, token) => Promise, filas: [{ label, valor: (data) => node }] }
//              (muestra un botón "Ver" por fila y un modal de detalle con las filas)
//   csvNombre?: string   (nombre base del archivo exportado; por defecto usa el título)
// El botón "Exportar CSV" descarga las filas filtradas y ordenadas (ignora la paginación),
// separadas con ";" y con BOM UTF-8 para Excel.
function PanelCrud({ config }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [items, setItems] = useState([]);
    const [externos, setExternos] = useState({});
    const [modal, setModal] = useState(null); // null | 'crear' | 'editar'
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({});
    const [erroresForm, setErroresForm] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [itemAEliminar, setItemAEliminar] = useState(null);
    const [detalleItem, setDetalleItem] = useState(null);
    const [detalleDatos, setDetalleDatos] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [modoPapelera, setModoPapelera] = useState(false);
    const [restaurandoId, setRestaurandoId] = useState(null);
    const [ejecutandoAccion, setEjecutandoAccion] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtros, setFiltros] = useState(null);
    const [borradorFiltros, setBorradorFiltros] = useState(() => {
        const f = {};
        (config.filtros || []).forEach(x => { f[x.parametro] = ''; });
        return f;
    });
    const [ordenKey, setOrdenKey] = useState(null);
    const [ordenDir, setOrdenDir] = useState('asc');
    const [pagina, setPagina] = useState(1);

    const formVacio = () => {
        const f = {};
        config.campos.forEach(c => { f[c.name] = ''; });
        return f;
    };

    const cargar = useCallback(async () => {
        setLoading(true);
        setMensaje(null);
        try {
            const externosCargados = {};
            const obtener = config.papelera && modoPapelera
                ? config.papelera.obtener
                : config.obtener;
            const params = filtros
                ? Object.fromEntries(
                    Object.entries(filtros).filter(([, v]) => v !== '' && v !== null && v !== undefined)
                )
                : {};
            const promesas = [obtener(token, params)];
            if (config.externos) {
                config.externos.forEach(e => {
                    promesas.push(
                        e.cargar()
                            .then(data => { externosCargados[e.clave] = Array.isArray(data) ? data : []; })
                            .catch(() => { externosCargados[e.clave] = []; })
                    );
                });
            }
            const [res] = await Promise.all(promesas);
            const datos = Array.isArray(res) ? res : (res?.data?.items ?? res?.data ?? []);
            setItems(Array.isArray(datos) ? datos : []);
            setExternos(externosCargados);
        } catch (error) {
            console.error('Error cargando datos del panel:', error);
            setMensaje({ type: 'danger', text: 'Error al cargar los datos.' });
        } finally {
            setLoading(false);
        }
    }, [config, token, modoPapelera, filtros]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const abrirCrear = () => {
        setForm(formVacio());
        setEditId(null);
        setErroresForm(null);
        setMensaje(null);
        setModal('crear');
    };

    const abrirEditar = (item) => {
        const base = config.normalizarEdicion ? config.normalizarEdicion(item) : item;
        const f = {};
        config.campos.forEach(c => { f[c.name] = base[c.name] ?? ''; });
        setForm(f);
        setEditId(item.id);
        setErroresForm(null);
        setMensaje(null);
        setModal('editar');
    };

    const filtrosVacio = () => {
        const f = {};
        (config.filtros || []).forEach(x => { f[x.parametro] = ''; });
        return f;
    };

    const aplicarFiltros = () => {
        const activos = {};
        Object.entries(borradorFiltros).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) activos[k] = v;
        });
        setFiltros(Object.keys(activos).length ? activos : null);
        setPagina(1);
    };

    const limpiarFiltros = () => {
        setBorradorFiltros(filtrosVacio());
        setFiltros(null);
    };

    const abrirDetalle = async (item) => {
        if (!config.detalle) return;
        setDetalleItem(item);
        setDetalleDatos(null);
        setCargandoDetalle(true);
        try {
            const res = await config.detalle.cargar(item, token);
            setDetalleDatos(res?.data ?? res);
        } catch {
            setDetalleDatos({ error: true });
        } finally {
            setCargandoDetalle(false);
        }
    };

    const cerrarDetalle = () => setDetalleItem(null);

    const validar = () => {
        const errores = {};
        config.campos.forEach(c => {
            const val = String(form[c.name] ?? '').trim();
            if (c.requerido && !val) {
                errores[c.name] = ['Este campo es obligatorio'];
            } else if (val && c.min && val.length < c.min) {
                errores[c.name] = [`Debe tener al menos ${c.min} caracteres`];
            } else if (val && c.max && val.length > c.max) {
                errores[c.name] = [`No puede superar los ${c.max} caracteres`];
            }
        });
        return errores;
    };

    const construirPayload = () => {
        const payload = {};
        config.campos.forEach(c => {
            const val = form[c.name];
            const esVacio = val === '' || val === null || val === undefined;
            if (esVacio && !c.requerido) return;
            payload[c.name] = c.type === 'select' || c.type === 'number'
                ? (esVacio ? null : Number(val))
                : (typeof val === 'string' ? val.trim() : val);
        });
        return payload;
    };

    const guardar = async () => {
        const errores = validar();
        if (Object.keys(errores).length) {
            setErroresForm(errores);
            return;
        }
        setGuardando(true);
        setMensaje(null);
        setErroresForm(null);
        try {
            const payload = construirPayload();
            const res = editId
                ? await config.actualizar(editId, payload, token)
                : await config.crear(payload, token);

            if (res?.success) {
                setMensaje({ type: 'success', text: res.message || 'Operación realizada correctamente' });
                setModal(null);
                await cargar();
            } else {
                setErroresForm(
                    res?.validation_errors
                        ? { ...res.validation_errors }
                        : { global: [res?.error || res?.message || 'No se pudo guardar'] }
                );
            }
        } catch (error) {
            setErroresForm({ global: ['Error de conexión al guardar'] });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminar = async () => {
        if (!itemAEliminar) return;
        setEliminando(true);
        try {
            const res = await config.eliminar(itemAEliminar.id, token);
            if (res?.success) {
                setItems(prev => prev.filter(i => String(i.id) !== String(itemAEliminar.id)));
                setItemAEliminar(null);
                setMensaje({ type: 'success', text: res.message || 'Eliminado correctamente' });
            } else {
                setItemAEliminar(null);
                setMensaje({ type: 'danger', text: `No se pudo eliminar: ${res?.error || res?.message || 'error desconocido'}` });
            }
        } catch (error) {
            setItemAEliminar(null);
            setMensaje({ type: 'danger', text: 'Error de conexión al eliminar' });
        } finally {
            setEliminando(false);
        }
    };

    const restaurar = async (item) => {
        if (!config.papelera) return;
        setRestaurandoId(String(item.id));
        try {
            const res = await config.papelera.restaurar(item.id, token);
            if (res?.success) {
                setItems(prev => prev.filter(i => String(i.id) !== String(item.id)));
                setMensaje({ type: 'success', text: res.message || 'Restaurado correctamente' });
            } else {
                setMensaje({ type: 'danger', text: `No se pudo restaurar: ${res?.error || res?.message || 'error desconocido'}` });
            }
        } catch (error) {
            setMensaje({ type: 'danger', text: 'Error de conexión al restaurar' });
        } finally {
            setRestaurandoId(null);
        }
    };

    const ejecutarAccion = async (accion, item) => {
        setEjecutandoAccion(String(item.id));
        try {
            const res = await accion.ejecutar(item, token);
            if (res?.success) {
                setMensaje({ type: 'success', text: res.message || 'Operación realizada correctamente' });
                await cargar();
            } else {
                setMensaje({ type: 'danger', text: `No se pudo completar: ${res?.error || res?.message || 'error desconocido'}` });
            }
        } catch (error) {
            setMensaje({ type: 'danger', text: 'Error de conexión al ejecutar la acción' });
        } finally {
            setEjecutandoAccion(null);
        }
    };

    const identidad = (item) => config.columnaPrincipal
        ? (item[config.columnaPrincipal] ?? `#${item.id}`)
        : `#${item.id}`;

    const filasPorPagina = config.filasPorPagina || 10;
    const texto = busqueda.trim().toLowerCase();

    const filtrados = useMemo(() => {
        if (!texto) return items;
        return items.filter(item =>
            config.columnas.some(c => {
                const val = item[c.key];
                return val !== null && val !== undefined && String(val).toLowerCase().includes(texto);
            }) || String(item.id).includes(texto)
        );
    }, [items, texto, config.columnas]);

    const ordenados = useMemo(() => {
        if (!ordenKey) return filtrados;
        const limpia = (v) => (v === null || v === undefined ? '' : v);
        const arr = [...filtrados].sort((a, b) => {
            const va = limpia(a[ordenKey]);
            const vb = limpia(b[ordenKey]);
            const na = Number(va);
            const nb = Number(vb);
            if (va !== '' && vb !== '' && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
            return String(va).localeCompare(String(vb), 'es');
        });
        return ordenDir === 'desc' ? arr.reverse() : arr;
    }, [filtrados, ordenKey, ordenDir]);

    const totalPaginas = Math.max(1, Math.ceil(ordenados.length / filasPorPagina));
    const paginaActual = Math.min(pagina, totalPaginas);
    const visibles = ordenados.slice((paginaActual - 1) * filasPorPagina, paginaActual * filasPorPagina);

    const cambiarOrden = (key) => {
        if (ordenKey === key) {
            setOrdenDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setOrdenKey(key);
            setOrdenDir('asc');
        }
    };

    useEffect(() => {
        setPagina(1);
    }, [busqueda, modoPapelera]);

    const valorCsv = (columna, item, externosRef) => {
        if (typeof columna.csv === 'function') {
            const v = columna.csv(item, externosRef);
            return v == null ? '' : String(v);
        }
        if (typeof columna.render === 'function') {
            try {
                const nodo = columna.render(item, externosRef);
                if (nodo === null || nodo === undefined) return '';
                if (typeof nodo === 'string') return nodo;
                if (typeof nodo === 'number' || typeof nodo === 'boolean') return String(nodo);
                const html = renderToStaticMarkup(nodo);
                return html
                    .replace(/<br\s*\/?>/gi, ' ')
                    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, ' ')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&nbsp;/gi, ' ')
                    .replace(/&amp;/gi, '&')
                    .replace(/&lt;/gi, '<')
                    .replace(/&gt;/gi, '>')
                    .replace(/&quot;/gi, '"')
                    .replace(/&#0*39;/gi, "'")
                    .replace(/&#x27;/gi, "'")
                    .replace(/\s+/g, ' ')
                    .trim();
            } catch (e) { /* continúa con el valor crudo */ }
        }
        const crudo = item[columna.key];
        if (typeof crudo === 'boolean') return crudo ? 'Sí' : 'No';
        if (crudo !== null && crudo !== undefined && (typeof crudo === 'string' || typeof crudo === 'number')) {
            return String(crudo);
        }
        return crudo == null ? '' : String(crudo);
    };

    const descargarCsv = () => {
        if (!ordenados.length) return;
        const escapado = (v) => {
            const s = v == null ? '' : String(v);
            return `"${s.replace(/"/g, '""')}"`;
        };
        const sep = ';';
        const encabezado = config.columnas.map(c => escapado(c.label));
        const filas = ordenados.map(item =>
            config.columnas.map(c => escapado(valorCsv(c, item, externos))).join(sep)
        );
        const csv = '\uFEFF' + [encabezado.join(sep), ...filas].join('\r\n');
        const nombreBase = (config.csvNombre || config.titulo.toLowerCase()).replace(/\s+/g, '_');
        const ahora = new Date();
        const stamp =
            `${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, '0')}${String(ahora.getDate()).padStart(2, '0')}-` +
            `${String(ahora.getHours()).padStart(2, '0')}${String(ahora.getMinutes()).padStart(2, '0')}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreBase}_${stamp}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-page">
            <div className="container">

                <section className="admin-hero">
                    <div className="admin-hero-content">
                        <span className="admin-hero-badge">
                            <i className={`fas ${config.icono}`}></i> Administración
                        </span>
                        <h1>{config.titulo}</h1>
                        <p>{config.descripcion}</p>
                    </div>
                    <div className="admin-hero-actions">
                        {config.papelera && (
                            <button
                                className="btn-detalle btn-detalle-secundario"
                                onClick={() => setModoPapelera(v => !v)}
                                disabled={loading}
                            >
                                <i className={modoPapelera ? 'fas fa-list' : 'fas fa-trash-can-arrow-up'}></i>
                                {modoPapelera ? 'Ver activos' : 'Papelera'}
                            </button>
                        )}
                        {config.crear && !modoPapelera && (
                            <button className="btn-detalle btn-detalle-primario" onClick={abrirCrear}>
                                <i className="fas fa-plus"></i> Nuevo
                            </button>
                        )}
                    </div>
                </section>

                <Alert type={mensaje?.type} message={mensaje?.text} />

                {modoPapelera && (
                    <div className="alert alert-info d-flex align-items-center gap-2">
                        <i className="fas fa-trash-can-arrow-up"></i>
                        <span>Estás viendo la papelera. Los elementos eliminados se muestran acá y podés restaurarlos.</span>
                    </div>
                )}

                <div className="admin-tabla-toolbar">
                            {config.filtros && config.filtros.length > 0 && (
                                <div className="admin-filtros">
                                    {config.filtros.map(f => (
                                        <label className="admin-filtro" key={f.parametro}>
                                            <span className="admin-filtro-label">{f.label}</span>
                                            {f.tipo === 'select' ? (
                                                <select
                                                    className="form-control"
                                                    value={borradorFiltros[f.parametro] ?? ''}
                                                    onChange={e => setBorradorFiltros({ ...borradorFiltros, [f.parametro]: e.target.value })}
                                                >
                                                    <option value="">Todos</option>
                                                    {(f.opciones || []).map(op => (
                                                        <option key={op.value} value={op.value}>{op.label ?? op.value}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={f.tipo || 'text'}
                                                    className="form-control"
                                                    value={borradorFiltros[f.parametro] ?? ''}
                                                    onChange={e => setBorradorFiltros({ ...borradorFiltros, [f.parametro]: e.target.value })}
                                                />
                                            )}
                                        </label>
                                    ))}
                                    <button
                                        className="admin-filtros-btn admin-filtros-btn-primario"
                                        onClick={aplicarFiltros}
                                        title="Aplicar filtros"
                                    >
                                        <i className="fas fa-filter"></i> Filtrar
                                    </button>
                                    <button
                                        className="admin-filtros-btn admin-filtros-btn-secundario"
                                        onClick={limpiarFiltros}
                                        disabled={!filtros}
                                        title="Quitar filtros"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            )}
                            <div className="admin-buscador-wrapper">
                                <i className="fas fa-search"></i>
                                <input
                                    className="form-control admin-buscador"
                                    placeholder={`Buscar en ${config.titulo.toLowerCase()}...`}
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                            </div>
                            <span className="admin-tabla-total">
                                {modoPapelera ? 'papelera' : 'registros'}: {ordenados.length} / {items.length}
                            </span>
                            <button
                                className="admin-btn-exportar"
                                onClick={descargarCsv}
                                disabled={!ordenados.length}
                                title="Descargar las filas filtradas en CSV"
                            >
                                <i className="fas fa-file-csv"></i> Exportar CSV
                            </button>
                        </div>

                        {items.length > 0 ? (
                            <>
                                {visibles.length > 0 ? (
                            <div className="admin-tabla-container">
                                <table className="admin-tabla">
                                    <thead>
                                        <tr>
                                            {config.columnas.map(c => (
                                                <th
                                                    key={c.key}
                                                    className="admin-th-orden"
                                                    onClick={() => cambiarOrden(c.key)}
                                                    title={`Ordenar por ${c.label}`}
                                                >
                                                    {c.label}{' '}
                                                    <i className={`fas ${ordenKey === c.key ? (ordenDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`}></i>
                                                </th>
                                            ))}
{!config.soloLectura || config.eliminar || config.papelera ? (
                                        <th className="admin-tabla-acciones">Acciones</th>
                                    ) : null}
                                </tr>
                            </thead>
                                    <tbody>
                                        {visibles.map(item => (
                                            <tr key={item.id}>
                                                {config.columnas.map(c => (
                                                    <td key={c.key}>
                                                        {c.render ? c.render(item, externos) : (item[c.key] ?? '—')}
                                                    </td>
                                                ))}
{!config.soloLectura || config.eliminar || config.papelera ? (
                                                    <td className="admin-tabla-acciones">
                                                        {config.detalle && (
                                                            <button
                                                                className="admin-btn ver"
                                                                onClick={() => abrirDetalle(item)}
                                                                title="Ver detalle"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                        )}
                                                        {!modoPapelera && (config.acciones || [])
                                                            .filter(a => !a.permitido || a.permitido(item))
                                                            .map(a => (
                                                                <button
                                                                    key={a.etiqueta}
                                                                    className={`admin-btn ${a.clase || ''}`}
                                                                    onClick={() => ejecutarAccion(a, item)}
                                                                    title={a.etiqueta}
                                                                    disabled={ejecutandoAccion === String(item.id)}
                                                                >
                                                                    <i className={ejecutandoAccion === String(item.id) ? 'fas fa-spinner fa-spin' : `fas ${a.icono}`}></i>
                                                                </button>
                                                            ))}
                                                        {modoPapelera ? (
                                                            <button
                                                                className="admin-btn restaurar"
                                                                onClick={() => restaurar(item)}
                                                                title="Restaurar"
                                                                disabled={restaurandoId === String(item.id)}
                                                            >
                                                                <i className={restaurandoId === String(item.id) ? 'fas fa-spinner fa-spin' : 'fas fa-rotate-left'}></i>
                                                            </button>
                                                        ) : (
                                                            <>
                                                                {config.actualizar && !config.soloLectura && (
                                                                <button
                                                                    className="admin-btn editar"
                                                                    onClick={() => abrirEditar(item)}
                                                                    title="Editar"
                                                                >
                                                                    <i className="fas fa-pen"></i>
                                                                </button>
                                                                )}
                                                                {config.eliminar && !config.soloLectura && (
                                                                <button
                                                                    className="admin-btn eliminar"
                                                                    onClick={() => setItemAEliminar(item)}
                                                                    title="Eliminar"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                ) : null}
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="admin-paginacion">
                                    <button
                                        className="admin-btn"
                                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                                        disabled={paginaActual <= 1}
                                        title="Anterior"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <span>
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <button
                                        className="admin-btn"
                                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                        disabled={paginaActual >= totalPaginas}
                                        title="Siguiente"
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="propiedades-empty">
                                <div className="empty-icon">
                                    <i className="fas fa-search-minus"></i>
                                </div>
                                <h3>Sin resultados</h3>
                                <p>No hay registros que coincidan con tu búsqueda.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className={`fas ${modoPapelera ? 'fa-trash-can-arrow-up' : config.icono}`}></i>
                        </div>
                        <h3>{modoPapelera ? 'La papelera está vacía' : (filtros ? 'Sin resultados' : 'Aún no hay registros')}</h3>
                        <p>
                            {modoPapelera
                                ? 'Los elementos eliminados aparecerán acá y podrás restaurarlos.'
                                : (filtros
                                    ? 'Ningún registro coincide con los filtros aplicados. Probá quitarlos o cambiarlos.'
                                    : (config.crear
                                        ? 'Podés crear el primero haciendo clic en "Nuevo".'
                                        : 'Aún no se cargaron registros en este panel.'))}
                        </p>
                    </div>
                )}

            </div>

            {/* MODAL CREAR / EDITAR */}
            {modal && (
                <div className="modal-backdrop-custom" onClick={() => { if (!guardando) setModal(null); }}>
                    <div className="modal-custom admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>
                            {modal === 'crear'
                                ? `Nueva ${config.nombreSingular}`
                                : `Editar ${config.nombreSingular} ${identidad(items.find(i => String(i.id) === String(editId)) || {})}`}
                        </h3>

                        {erroresForm?.global && (
                            <div className="alert alert-danger">
                                {(Array.isArray(erroresForm.global) ? erroresForm.global : [erroresForm.global]).join(' ')}
                            </div>
                        )}

                        {config.campos.map(campo => {
                            const err = erroresForm?.[campo.name];
                            return (
                                <div className="admin-form-grupo" key={campo.name}>
                                    <label htmlFor={`campo-${campo.name}`}>
                                        {campo.label}{campo.requerido && <span className="admin-req">*</span>}
                                    </label>

                                    {campo.type === 'select' ? (
                                        <select
                                            id={`campo-${campo.name}`}
                                            value={form[campo.name] ?? ''}
                                            onChange={e => setForm({ ...form, [campo.name]: e.target.value })}
                                            className="form-control"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {(externos[campo.opciones] || []).map(op => (
                                                <option key={op.id} value={op.value ?? op.id}>
                                                    {op.label ?? op.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    ) : campo.type === 'textarea' ? (
                                        <textarea
                                            id={`campo-${campo.name}`}
                                            rows={campo.rows || 4}
                                            value={form[campo.name] ?? ''}
                                            onChange={e => setForm({ ...form, [campo.name]: e.target.value })}
                                            className="form-control"
                                            placeholder={campo.placeholder || ''}
                                            minLength={campo.min}
                                            maxLength={campo.max}
                                            style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                                        />
                                    ) : (
                                        <input
                                            id={`campo-${campo.name}`}
                                            type={campo.type || 'text'}
                                            value={form[campo.name] ?? ''}
                                            onChange={e => setForm({ ...form, [campo.name]: e.target.value })}
                                            className="form-control"
                                            placeholder={campo.placeholder || ''}
                                            minLength={campo.min}
                                            maxLength={campo.max}
                                        />
                                    )}

                                    {campo.ayuda && (
                                        <small className="admin-form-ayuda">{campo.ayuda}</small>
                                    )}
                                    {err && (
                                        <div className="admin-form-error">
                                            {(Array.isArray(err) ? err : [err]).map((m, idx) => (
                                                <div key={idx}>{m}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="modal-actions">
                            <button
                                className="btn-detalle btn-detalle-secundario"
                                onClick={() => setModal(null)}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-detalle btn-detalle-primario"
                                onClick={guardar}
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i> Guardar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMAR ELIMINACIÓN */}
            {itemAEliminar && (
                <div className="modal-backdrop-custom" onClick={() => { if (!eliminando) setItemAEliminar(null); }}>
                    <div className="modal-custom" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon-danger">
                            <i className="fas fa-trash-alt"></i>
                        </div>
                        <h3>¿Eliminar {config.nombreSingular}?</h3>
                        <p>
                            Estás por eliminar <strong>{identidad(itemAEliminar)}</strong>.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-detalle btn-detalle-secundario"
                                onClick={() => setItemAEliminar(null)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-detalle btn-detalle-danger"
                                onClick={confirmarEliminar}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-trash"></i> Sí, eliminar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VER DETALLE */}
            {detalleItem && config.detalle && (
                <div className="modal-backdrop-custom" onClick={cerrarDetalle}>
                    <div className="modal-custom admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>
                            <i className={`fas ${config.icono}`}></i>{' '}
                            {typeof config.detalle.titulo === 'function'
                                ? config.detalle.titulo(detalleItem)
                                : (config.detalle.titulo || 'Detalle')}
                        </h3>

                        {cargandoDetalle ? (
                            <div className="text-center py-4"><Loader /></div>
                        ) : detalleDatos?.error ? (
                            <div className="alert alert-danger">No se pudo cargar el detalle.</div>
                        ) : detalleDatos ? (
                            <dl className="admin-detalle">
                                {(config.detalle.filas || []).map(f => (
                                    <div className="admin-detalle-fila" key={f.label}>
                                        <dt>{f.label}</dt>
                                        <dd>{f.valor(detalleDatos)}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : null}

                        <div className="modal-actions">
                            <button
                                className="btn-detalle btn-detalle-secundario"
                                onClick={cerrarDetalle}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PanelCrud;