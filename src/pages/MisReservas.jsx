import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    getReservas,
    getReservasByPropiedad,
    getMisPropiedades,
    getPropiedades,
    aprobarReserva,
    rechazarReserva,
    finalizarReserva,
    cancelarReserva,
    createResena
} from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import Loader from '../components/Loader';

const ESTADOS = [
    { valor: 'todos', etiqueta: 'Todas' },
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'confirmada', etiqueta: 'Confirmadas' },
    { valor: 'rechazada', etiqueta: 'Rechazadas' },
    { valor: 'cancelada', etiqueta: 'Canceladas' },
    { valor: 'finalizada', etiqueta: 'Finalizadas' }
];

const ESTADO_INFO = {
    pendiente: { etiqueta: 'Pendiente', icono: 'fa-hourglass-half' },
    confirmada: { etiqueta: 'Confirmada', icono: 'fa-check-circle' },
    rechazada: { etiqueta: 'Rechazada', icono: 'fa-times-circle' },
    cancelada: { etiqueta: 'Cancelada', icono: 'fa-ban' },
    finalizada: { etiqueta: 'Finalizada', icono: 'fa-flag-checkered' }
};

const ORIGENES = [
    { valor: 'todos', etiqueta: 'Todas' },
    { valor: 'recibida', etiqueta: 'Recibidas en mis propiedades' },
    { valor: 'propia', etiqueta: 'Mis solicitudes' }
];

const soloDia = (f) => (f ? String(f).slice(0, 10) : '—');

function MisReservas() {
    const { token, usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [filtroOrigen, setFiltroOrigen] = useState('todos');
    const [accionando, setAccionando] = useState(null);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const [resenaActiva, setResenaActiva] = useState(null);
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);
    const [errorCalificacion, setErrorCalificacion] = useState('');
    const [validacionCalificacion, setValidacionCalificacion] = useState({});

    const [esGestion, setEsGestion] = useState(false);

    const puedeAprobar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'pendiente';

    const puedeRechazar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'pendiente';

    const puedeFinalizar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'confirmada';

    const puedeCancelar = (reserva) =>
        ['pendiente', 'confirmada'].includes(reserva.estado);

    const puedeCalificar = (reserva) => reserva.estado === 'finalizada';

    const cargarDatos = useCallback(async () => {
        if (!usuario) return;
        setMensaje({ tipo: '', texto: '' });
        try {
            const misProps = await getMisPropiedades(token);
            if (!Array.isArray(misProps)) throw new Error('Props inválidas');
            const catalogo = await getPropiedades();
            if (!Array.isArray(catalogo)) throw new Error('Catálogo inválido');

            const esPropietario = misProps.length > 0;
            setEsGestion(esPropietario);

            const mapPropiedad = {};
            [...misProps, ...catalogo].forEach(p => { if (p) mapPropiedad[p.id] = p; });

            const propias = [];
            const propiasRes = await getReservas(token);
            const itemsPropias = propiasRes?.data?.items || propiasRes?.data || propiasRes || [];
            (Array.isArray(itemsPropias) ? itemsPropias : []).forEach(r => {
                propias.push({
                    ...r,
                    origen: 'propia',
                    propiedad: mapPropiedad[r.propiedad_id] || null
                });
            });

            const recibidas = [];
            if (esGestion) {
                for (const p of misProps) {
                    const res = await getReservasByPropiedad(p.id, token);
                    const items = res?.data?.reservas || res?.data || [];
                    (Array.isArray(items) ? items : []).forEach(r => {
                        recibidas.push({
                            ...r,
                            origen: 'recibida',
                            propiedad: p
                        });
                    });
                }
            }

            // Deduplicamos por id porque GET /api/reservas (admin) ya devuelve todo
            const porId = new Map();
            [...propias, ...recibidas].forEach(r => porId.set(String(r.id || 0), r));
            const todas = Array.from(porId.values()).sort((a, b) =>
                String(b.id || 0).localeCompare(String(a.id || 0), undefined, { numeric: true })
            );
            setReservas(todas);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las reservas.' });
        } finally {
            setLoading(false);
        }
    }, [token, usuario, esGestion]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const ejecutarAccion = async (accion, reserva) => {
        setAccionando(reserva.id);
        setMensaje({ tipo: '', texto: '' });
        let result;
        if (accion === 'aprobar') result = await aprobarReserva(reserva.id, token);
        if (accion === 'rechazar') result = await rechazarReserva(reserva.id, token);
        if (accion === 'finalizar') result = await finalizarReserva(reserva.id, token);
        if (accion === 'cancelar') result = await cancelarReserva(reserva.id, token);

        if (result && result.success) {
            setMensaje({ tipo: 'exito', texto: result.message || 'Reserva actualizada correctamente.' });
            await cargarDatos();
        } else {
            setMensaje({
                tipo: 'error',
                texto: result?.message || result?.error || 'No se pudo actualizar la reserva.'
            });
        }
        setAccionando(null);
    };

    const abrirCalificacion = (reserva) => {
        setCalificacion(0);
        setComentario('');
        setErrorCalificacion('');
        setValidacionCalificacion({});
        setResenaActiva(reserva);
    };

    const calcularTipoResena = (reserva) =>
        reserva.origen === 'propia' ? 'propiedad' : 'inquilino';

    const enviarCalificacion = async (e) => {
        e.preventDefault();
        setErrorCalificacion('');
        setValidacionCalificacion({});

        const errores = {};
        const nota = Number(calificacion);
        if (!nota || nota < 1 || nota > 5) errores.calificacion = 'Seleccioná una calificación de 1 a 5 estrellas';
        const comentarioFinal = comentario.trim();
        if (comentarioFinal && comentarioFinal.length < 3) {
            errores.comentario = 'El comentario debe tener al menos 3 caracteres';
        }
        if (Object.keys(errores).length) {
            setValidacionCalificacion(errores);
            return;
        }

        setEnviandoCalificacion(true);
        try {
            const payload = {
                reserva_id: Number(resenaActiva.id),
                tipo: calcularTipoResena(resenaActiva),
                calificacion: nota
            };
            if (comentarioFinal) payload.comentario = comentarioFinal;

            const result = await createResena(payload, token);
            if (result.success) {
                setResenaActiva(null);
                setCalificacion(0);
                setComentario('');
                setMensaje({
                    tipo: 'exito',
                    texto: result.message || '¡Reseña publicada correctamente!'
                });
            } else {
                if (result.validation_errors) setValidacionCalificacion(result.validation_errors);
                setErrorCalificacion(
                    result.message || result.error || 'No se pudo publicar la reseña.'
                );
            }
        } catch (err) {
            setErrorCalificacion('Error de conexión al publicar la reseña.');
        } finally {
            setEnviandoCalificacion(false);
        }
    };

    const filtradas = reservas.filter(r =>
        (filtro === 'todos' || r.estado === filtro) &&
        (filtroOrigen === 'todos' || r.origen === filtroOrigen)
    );

    const conteo = (estado) => estado === 'todos'
        ? reservas.filter(r => filtroOrigen === 'todos' || r.origen === filtroOrigen).length
        : reservas.filter(r => r.estado === estado && (filtroOrigen === 'todos' || r.origen === filtroOrigen)).length;

    const conteoOrigen = (origen) => origen === 'todos'
        ? reservas.length
        : reservas.filter(r => r.origen === origen && (filtro === 'todos' || r.estado === filtro)).length;

    if (loading) return <Loader />;

    return (
        <div className="misprops-page misreservas-page">
            <div className="container">

                {/* HERO */}
                <section className="misprops-hero">
                    <div className="misprops-hero-content">
                        <span className="misprops-hero-badge">
                            <i className="fas fa-calendar-check"></i> Panel de reservas
                        </span>
                        <h1>
                            Mis <span>Reservas</span>
                        </h1>
                        <p>
                            Aprobá, rechazá o finalizá las solicitudes que recibís en tus propiedades y seguí tus propios alquileres.
                        </p>
                    </div>
                </section>

                {mensaje.texto && (
                    <div
                        className={`alert ${mensaje.tipo === 'error' ? 'alert-error' : 'alert-success'}`}
                        role="alert"
                        style={{ marginBottom: 20 }}
                    >
                        <i className={`fas ${mensaje.tipo === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ marginRight: 8 }}></i>
                        {mensaje.texto}
                    </div>
                )}

                {/* FILTROS */}
                {reservas.length > 0 && (
                    <div className="misreservas-tabs">
                        <div className="misreservas-filtros">
                            {ESTADOS.map(e => (
                                <button
                                    key={e.valor}
                                    className={`misreservas-filtro ${filtro === e.valor ? 'activo' : ''}`}
                                    onClick={() => setFiltro(e.valor)}
                                >
                                    {e.etiqueta}
                                    <span className="misreservas-filtro-count">{conteo(e.valor)}</span>
                                </button>
                            ))}
                        </div>
                        <div className="misreservas-filtros">
                            {ORIGENES.map(o => (
                                <button
                                    key={o.valor}
                                    className={`misreservas-filtro misreservas-filtro-origen ${filtroOrigen === o.valor ? 'activo' : ''}`}
                                    onClick={() => setFiltroOrigen(o.valor)}
                                >
                                    <i className={`fas ${o.valor === 'recibida' ? 'fa-inbox' : o.valor === 'propia' ? 'fa-paper-plane' : 'fa-layer-group'}`}></i>
                                    {o.etiqueta}
                                    <span className="misreservas-filtro-count">{conteoOrigen(o.valor)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* LISTA */}
                {reservas.length > 0 ? (
                    filtradas.length > 0 ? (
                        <section className="misreservas-lista">
                            {filtradas.map(reserva => {
                                const prop = reserva.propiedad;
                                const img = prop ? rutaImagenPropiedad(prop) : '';
                                return (
                                    <div className="misreservas-item" key={reserva.id}>
                                        <div className="misreservas-item-imagen">
                                            {img ? (
                                                <img src={img} alt={prop?.titulo || 'Propiedad'} />
                                            ) : (
                                                <div className="misreservas-item-placeholder">
                                                    <i className="fas fa-home"></i>
                                                </div>
                                            )}
                                            {reserva.origen === 'recibida' && (
                                                <span className="misreservas-item-tag">Recibida</span>
                                            )}
                                            {reserva.origen === 'propia' && (
                                                <span className="misreservas-item-tag propia">Solicitada</span>
                                            )}
                                        </div>

                                        <div className="misreservas-item-info">
                                            <h3>
                                                {prop?.titulo || 'Propiedad'}
                                                {prop && prop.id && (
                                                    <Link to={`/propiedades/${prop.id}`} className="misreservas-item-ver">
                                                        Ver propiedad
                                                    </Link>
                                                )}
                                            </h3>
                                            <p className="misreservas-item-solicitante">
                                                {reserva.origen === 'recibida'
                                                    ? <>Solicitada por <strong>{reserva.usuario
                                                        ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.trim() || `usuario #${reserva.usuario_id}`
                                                        : `usuario #${reserva.usuario_id}`}</strong></>
                                                    : 'Solicitud propia'}
                                            </p>
                                            {reserva.origen === 'recibida' && reserva.usuario && (
                                                <div className="misreservas-item-contacto">
                                                    <span>
                                                        <i className="fas fa-envelope"></i>
                                                        {reserva.usuario.email || '—'}
                                                    </span>
                                                    <span>
                                                        <i className="fas fa-phone-alt"></i>
                                                        {reserva.usuario.telefono || '—'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="misreservas-item-fechas">
                                                <span>
                                                    <i className="far fa-calendar-alt"></i>
                                                    Desde {soloDia(reserva.fecha_inicio_alquiler)}
                                                </span>
                                                <span>
                                                    <i className="far fa-calendar-check"></i>
                                                    Hasta {soloDia(reserva.fecha_fin_alquiler)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="misreservas-item-acciones">
                                            <span className={`dash-reserva-badge ${reserva.estado}`}>
                                                <i className={`fas ${ESTADO_INFO[reserva.estado]?.icono || 'fa-circle'}`}></i>
                                                {ESTADO_INFO[reserva.estado]?.etiqueta || reserva.estado}
                                            </span>

                                            {puedeAprobar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-primario"
                                                    onClick={() => ejecutarAccion('aprobar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-check"></i> Aprobar
                                                </button>
                                            )}
                                            {puedeFinalizar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-primario"
                                                    onClick={() => ejecutarAccion('finalizar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-flag-checkered"></i> Finalizar
                                                </button>
                                            )}
                                            {puedeRechazar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-danger"
                                                    onClick={() => {
                                                        if (window.confirm('¿Rechazar esta solicitud de reserva? El inquilino recibirá el rechazo.')) {
                                                            ejecutarAccion('rechazar', reserva);
                                                        }
                                                    }}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-times"></i> Rechazar
                                                </button>
                                            )}
                                            {puedeCancelar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-secundario"
                                                    onClick={() => {
                                                        if (window.confirm('¿Cancelar esta reserva?')) {
                                                            ejecutarAccion('cancelar', reserva);
                                                        }
                                                    }}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-ban"></i> Cancelar
                                                </button>
                                            )}
                                            {puedeCalificar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-secundario"
                                                    onClick={() => abrirCalificacion(reserva)}
                                                >
                                                    <i className="fas fa-star"></i> Calificar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    ) : (
                        <div className="propiedades-empty">
                            <div className="empty-icon">
                                <i className="fas fa-filter"></i>
                            </div>
                            <h3>No hay reservas en este estado</h3>
                            <p>Probá con otro filtro para ver más resultados.</p>
                        </div>
                    )
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h3>Todavía no tenés reservas</h3>
                        <p>
                            Las solicitudes en tus propiedades y tus propias reservas van a aparecer acá.
                        </p>
                        <Link
                            to="/propiedades"
                            className="btn-ver-todas"
                            style={{ marginTop: '20px', display: 'inline-block' }}
                        >
                            <i className="fas fa-search"></i> Explorar propiedades
                        </Link>
                    </div>
                )}

            </div>

            {resenaActiva && (
                <div
                    className="modal-backdrop-custom"
                    onClick={() => !enviandoCalificacion && setResenaActiva(null)}
                >
                    <div
                        className="modal-custom"
                        onClick={(e) => e.stopPropagation()}
                        style={{ textAlign: 'left', maxWidth: 480 }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>
                            {calcularTipoResena(resenaActiva) === 'propiedad'
                                ? 'Calificar la propiedad'
                                : 'Calificar al inquilino'}
                        </h3>
                        <p style={{ marginBottom: 14 }}>
                            {calcularTipoResena(resenaActiva) === 'propiedad'
                                ? '¿Cómo te fue en la propiedad? Tu opinión ayuda a otros usuarios.'
                                : 'Calificá tu experiencia con el inquilino de esta reserva.'}
                        </p>

                        <form onSubmit={enviarCalificacion} noValidate>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label>
                                    Calificación <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <div className="resena-estrellas resena-estrellas-grandes">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            className={`estrella-btn ${n <= calificacion ? 'estrella-llena' : ''}`}
                                            onClick={() => setCalificacion(n)}
                                            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                                        >
                                            <i className="fas fa-star"></i>
                                        </button>
                                    ))}
                                </div>
                                {validacionCalificacion.calificacion && (
                                    <span className="form-error">{validacionCalificacion.calificacion}</span>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="comentario-resena">Comentario</label>
                                <textarea
                                    id="comentario-resena"
                                    rows="4"
                                    placeholder="Contanos cómo fue tu experiencia (opcional)"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    className={validacionCalificacion.comentario ? 'input-error' : ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: `1px solid ${validacionCalificacion.comentario ? '#dc2626' : '#cbd5e1'}`,
                                        fontFamily: 'inherit',
                                        fontSize: 14,
                                        resize: 'vertical'
                                    }}
                                />
                                {validacionCalificacion.comentario && (
                                    <span className="form-error">{validacionCalificacion.comentario}</span>
                                )}
                            </div>

                            {errorCalificacion && (
                                <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                                    <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                                    {errorCalificacion}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-detalle btn-detalle-secundario"
                                    onClick={() => setResenaActiva(null)}
                                    disabled={enviandoCalificacion}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-detalle btn-detalle-primario"
                                    disabled={enviandoCalificacion}
                                >
                                    {enviandoCalificacion ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Publicando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-star"></i> Publicar reseña
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisReservas;