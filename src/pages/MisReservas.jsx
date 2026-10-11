import Icon from '../components/Icon';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import {
    getReservas,
    separarReservas,
    aprobarReserva,
    rechazarReserva,
    finalizarReserva,
    cancelarReserva,
    createResena,
    getResenasByUsuario
} from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import { useSEO } from '../hooks/useSEO';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

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
    useSEO('Mis reservas', 'Tus reservas de propiedades en alquiler y sus estados.', { noindex: true });

    const { token, usuario } = useAuth();
    const { confirm, showToast } = useUI();
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

    const [misResenasHechas, setMisResenasHechas] = useState([]);

    const [esGestion, setEsGestion] = useState(false);

    const puedeAprobar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'pendiente';

    const puedeRechazar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'pendiente';

    const puedeFinalizar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'confirmada';

    const puedeCancelar = (reserva) =>
        ['pendiente', 'confirmada'].includes(reserva.estado);

    const yaCalificoReserva = (reserva) => {
        const tipo = reserva.origen === 'propia' ? 'propiedad' : 'inquilino';
        return misResenasHechas.some(
            (r) => String(r.reserva_id) === String(reserva.id) && r.tipo === tipo
        );
    };

    const estaVencidaNoFinalizada = (reserva) => {
        if (reserva.estado !== 'confirmada') return false;
        const finStr = reserva.fecha_fin_alquiler
            ? String(reserva.fecha_fin_alquiler).slice(0, 10)
            : null;
        if (!finStr) return false;
        const hoyStr = new Date().toISOString().slice(0, 10);
        return finStr < hoyStr;
    };

    const puedeCalificar = (reserva) =>
        reserva.estado === 'finalizada' && !yaCalificoReserva(reserva);

    const cargarDatos = useCallback(async () => {
        if (!usuario) return;
        setMensaje({ tipo: '', texto: '' });
        try {
            const resHechas = await getResenasByUsuario(usuario.id, token);
            const itemsHechas = resHechas?.data?.items || resHechas?.items || [];
            setMisResenasHechas(Array.isArray(itemsHechas) ? itemsHechas : []);

            // El backend ya clasifica: mis solicitudes vs. las recibidas en mis
            // propiedades. Acá solo etiquetamos el origen para los filtros y
            // unimos ambas listas para la vista.
            const { misReservas, reservasDeMisPropiedades } = separarReservas(
                await getReservas(token)
            );

            setEsGestion(reservasDeMisPropiedades.length > 0);

            const todas = [
                ...misReservas.map(r => ({ ...r, origen: 'propia' })),
                ...reservasDeMisPropiedades.map(r => ({ ...r, origen: 'recibida' }))
            ].sort((a, b) =>
                String(b.id || 0).localeCompare(String(a.id || 0), undefined, { numeric: true })
            );

            setReservas(todas);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las reservas.' });
        } finally {
            setLoading(false);
        }
    }, [token, usuario]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const ejecutarAccion = async (accion, reserva) => {
        setAccionando(reserva.id);
        let result;
        if (accion === 'aprobar') result = await aprobarReserva(reserva.id, token);
        if (accion === 'rechazar') result = await rechazarReserva(reserva.id, token);
        if (accion === 'finalizar') result = await finalizarReserva(reserva.id, token);
        if (accion === 'cancelar') result = await cancelarReserva(reserva.id, token);

        if (result && result.success) {
            showToast(result.message || 'Reserva actualizada correctamente.');
            await cargarDatos();
        } else {
            showToast(result?.message || result?.error || 'No se pudo actualizar la reserva.', 'error');
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
                            <Icon name="fas fa-calendar-check" /> Panel de reservas
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
                        <Icon name={`fas ${mensaje.tipo === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ marginRight: 8 }} />
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
                                    <Icon name={`fas ${o.valor === 'recibida' ? 'fa-inbox' : o.valor === 'propia' ? 'fa-paper-plane' : 'fa-layer-group'}`} />
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
                                                <img src={img} alt={prop?.titulo || 'Propiedad'} loading="lazy" decoding="async" />
                                            ) : (
                                                <div className="misreservas-item-placeholder">
                                                    <Icon name="fas fa-home" />
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
                                                        <Icon name="fas fa-envelope" />
                                                        {reserva.usuario.email || '—'}
                                                    </span>
                                                    <span>
                                                        <Icon name="fas fa-phone-alt" />
                                                        {reserva.usuario.telefono || '—'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="misreservas-item-fechas">
                                                <span>
                                                    <Icon name="far fa-calendar-alt" />
                                                    Desde {soloDia(reserva.fecha_inicio_alquiler)}
                                                </span>
                                                <span>
                                                    <Icon name="far fa-calendar-check" />
                                                    Hasta {soloDia(reserva.fecha_fin_alquiler)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="misreservas-item-acciones">
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <span className={`dash-reserva-badge ${reserva.estado}`}>
                                                    <Icon name={`fas ${ESTADO_INFO[reserva.estado]?.icono || 'fa-circle'}`} />
                                                    {ESTADO_INFO[reserva.estado]?.etiqueta || reserva.estado}
                                                </span>
                                                {estaVencidaNoFinalizada(reserva) && (
                                                    <span className="dash-reserva-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                                                        <Icon name="fas fa-exclamation-triangle" /> Vencida
                                                    </span>
                                                )}
                                            </div>

                                            {puedeAprobar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-primario"
                                                    onClick={() => ejecutarAccion('aprobar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <Icon name="fas fa-check" /> Aprobar
                                                </button>
                                            )}
                                            {puedeFinalizar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-primario"
                                                    onClick={() => ejecutarAccion('finalizar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <Icon name="fas fa-flag-checkered" />{' '}
                                                    {estaVencidaNoFinalizada(reserva) ? 'Finalizar (vencida)' : 'Finalizar'}
                                                </button>
                                            )}
                                            {puedeRechazar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-danger"
                                                    onClick={async () => {
                                                        const aceptado = await confirm({
                                                            titulo: '¿Rechazar solicitud?',
                                                            mensaje: 'El inquilino recibirá el rechazo de su solicitud de reserva.',
                                                            textoAceptar: 'Rechazar',
                                                            textoCancelar: 'Cancelar',
                                                            peligro: true
                                                        });
                                                        if (aceptado) ejecutarAccion('rechazar', reserva);
                                                    }}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <Icon name="fas fa-times" /> Rechazar
                                                </button>
                                            )}
                                            {puedeCancelar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-secundario"
                                                    onClick={async () => {
                                                        const aceptado = await confirm({
                                                            titulo: '¿Cancelar esta reserva?',
                                                            mensaje: '',
                                                            textoAceptar: 'Cancelar reserva',
                                                            textoCancelar: 'Volver',
                                                            peligro: true
                                                        });
                                                        if (aceptado) ejecutarAccion('cancelar', reserva);
                                                    }}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <Icon name="fas fa-ban" /> Cancelar
                                                </button>
                                            )}
                                             {puedeCalificar(reserva) && (
                                                 <button
                                                     className="btn-detalle btn-detalle-secundario"
                                                     onClick={() => abrirCalificacion(reserva)}
                                                 >
                                                     <Icon name="fas fa-star" /> Calificar
                                                 </button>
                                             )}
                                             {reserva.estado === 'finalizada' && yaCalificoReserva(reserva) && (
                                                 <span className="dash-reserva-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                                     <Icon name="fas fa-star" /> Ya calificaste
                                                 </span>
                                             )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Link to={`/reservas/${reserva.id}`} className="link-underline">
                                                <Icon name="fas fa-eye" /> Ver detalle
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    ) : (
                        <EmptyState
                            icono="fa-filter"
                            titulo="No hay reservas en este estado"
                            descripcion="Probá con otro filtro para ver más resultados."
                        />
                    )
                ) : (
                    <EmptyState
                        icono="fa-calendar-times"
                        titulo="Todavía no tenés reservas"
                        descripcion="Las solicitudes en tus propiedades y tus propias reservas van a aparecer acá."
                        action={
                            <Link
                                to="/propiedades"
                                className="btn-ver-todas"
                                style={{ marginTop: '20px', display: 'inline-block' }}
                            >
                                <Icon name="fas fa-search" /> Explorar propiedades
                            </Link>
                        }
                    />
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
                            <Icon name="fas fa-star" style={{ color: '#f59e0b' }} />
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
                                            <Icon name="fas fa-star" />
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
                                    <Icon name="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
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
                                            <Icon name="fas fa-spinner fa-spin" /> Publicando...
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="fas fa-star" /> Publicar reseña
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
