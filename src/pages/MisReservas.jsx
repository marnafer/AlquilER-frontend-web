import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    getReservas,
    getReservasByPropiedad,
    getMisPropiedades,
    getPropiedades,
    cancelarReserva,
    aprobarReserva,
    rechazarReserva,
    finalizarReserva
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

const soloDia = (f) => (f ? String(f).slice(0, 10) : '—');

function MisReservas() {
    const { token, usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [accionando, setAccionando] = useState(null);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const esGestion = true;

    const esSolicitanteDe = (reserva) => usuario && String(reserva.usuario_id) === String(usuario.id);

    const puedeCancelar = (reserva) =>
        esSolicitanteDe(reserva) && ['pendiente', 'confirmada'].includes(reserva.estado);

    const puedeAprobar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'pendiente';

    const puedeRechazar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'pendiente';

    const puedeFinalizar = (reserva) =>
        esGestion && reserva.origen === 'recibida' && reserva.estado === 'confirmada';

    const cargarDatos = useCallback(async () => {
        if (!usuario) return;
        setMensaje({ tipo: '', texto: '' });
        try {
            const misProps = await getMisPropiedades(token);
            if (!Array.isArray(misProps)) throw new Error('Props inválidas');
            const catalogo = await getPropiedades();
            if (!Array.isArray(catalogo)) throw new Error('Catálogo inválido');

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

            const todas = [...propias, ...recibidas].sort((a, b) =>
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
        if (accion === 'cancelar') result = await cancelarReserva(reserva.id, token);
        if (accion === 'aprobar') result = await aprobarReserva(reserva.id, token);
        if (accion === 'rechazar') result = await rechazarReserva(reserva.id, token);
        if (accion === 'finalizar') result = await finalizarReserva(reserva.id, token);

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

    const filtradas = filtro === 'todos'
        ? reservas
        : reservas.filter(r => r.estado === filtro);

    const conteo = (estado) => estado === 'todos'
        ? reservas.length
        : reservas.filter(r => r.estado === estado).length;

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
                                                    ? <>Solicitada por <strong>usuario #{reserva.usuario_id}</strong></>
                                                    : 'Solicitud propia'}
                                            </p>
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
                                                {reserva.estado}
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
                                            {puedeRechazar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-danger"
                                                    onClick={() => ejecutarAccion('rechazar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-times"></i> Rechazar
                                                </button>
                                            )}
                                            {puedeFinalizar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-secundario"
                                                    onClick={() => ejecutarAccion('finalizar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-flag-checkered"></i> Finalizar
                                                </button>
                                            )}
                                            {puedeCancelar(reserva) && (
                                                <button
                                                    className="btn-detalle btn-detalle-danger"
                                                    onClick={() => ejecutarAccion('cancelar', reserva)}
                                                    disabled={accionando === reserva.id}
                                                >
                                                    <i className="fas fa-ban"></i> Cancelar
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
        </div>
    );
}

export default MisReservas;