import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import {
    getNotificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas
} from '../services/api';
import Loader from '../components/Loader';

const POR_PAGINA = 8;

const ICONOS_POR_TIPO = {
    reserva_confirmada: 'fa-check-circle',
    reserva_rechazada: 'fa-times-circle',
    reserva_nueva: 'fa-calendar-plus',
    consulta_nueva: 'fa-comment-dots',
    mensaje_nuevo: 'fa-envelope'
};

function Notificaciones() {
    const { token } = useAuth();
    const { showToast } = useUI();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [marcandoId, setMarcandoId] = useState(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);
    const [pagina, setPagina] = useState(1);

    const extraerItems = (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        return [];
    };

    const cargar = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getNotificaciones(token);
            if (res.success) {
                setItems(extraerItems(res));
            } else {
                setError(res.error || 'No se pudieron cargar las notificaciones.');
            }
        } catch (e) {
            setError('Error de conexión al cargar las notificaciones.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    useEffect(() => {
        setPagina(1);
    }, [items.length]);

    const marcarLeida = async (id) => {
        setMarcandoId(id);
        try {
            const res = await marcarNotificacionLeida(id, token);
            if (res.success) {
                setItems(prev =>
                    prev.map(n => (n.id === id ? { ...n, leida: true } : n))
                );
            } else {
                showToast(res.error || 'No se pudo marcar como leída', 'error');
            }
        } catch (e) {
            showToast('Error de conexión', 'error');
        } finally {
            setMarcandoId(null);
        }
    };

    const marcarTodasLeidas = async () => {
        setMarcandoTodas(true);
        try {
            const res = await marcarTodasNotificacionesLeidas(token);
            if (res.success) {
                setItems(prev =>
                    prev.map(n => ({ ...n, leida: true }))
                );
                showToast('Todas las notificaciones marcadas como leídas', 'success');
            } else {
                showToast(res.error || 'No se pudieron marcar como leídas', 'error');
            }
        } catch (e) {
            showToast('Error de conexión', 'error');
        } finally {
            setMarcandoTodas(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const iconoDe = (tipo) => ICONOS_POR_TIPO[tipo] || 'fa-bell';

    const noLeidas = items.filter(n => !n.leida).length;

    const totalPaginas = Math.max(1, Math.ceil(items.length / POR_PAGINA));
    const paginaSegura = Math.min(pagina, totalPaginas);
    const visibles = items.slice(
        (paginaSegura - 1) * POR_PAGINA,
        paginaSegura * POR_PAGINA
    );
    const irAPagina = (p) => setPagina(Math.min(Math.max(1, p), totalPaginas));
    const paginasVisibles = () => {
        if (totalPaginas <= 7) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const inicio = Math.max(1, Math.min(paginaSegura - 3, totalPaginas - 6));
        return Array.from({ length: 7 }, (_, i) => inicio + i);
    };

    if (loading) return <Loader />;

    return (
        <div className="notificaciones-page">
            <div className="container">
                {/* HERO */}
                <section className="notificaciones-hero">
                    <div className="notificaciones-hero-content">
                        <span className="notificaciones-hero-badge">
                            <i className="fas fa-bell"></i> Notificaciones
                        </span>
                        <h1>Centro de <span>notificaciones</span></h1>
                        <p>
                            Consultá los avisos sobre tus reservas, consultas y mensajes.
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="alert alert-error" role="alert" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </span>
                        <button
                            onClick={cargar}
                            className="btn-detalle btn-detalle-secundario"
                            style={{ padding: '4px 12px', fontSize: 13 }}
                        >
                            <i className="fas fa-redo-alt"></i> Reintentar
                        </button>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="notificaciones-toolbar">
                        <span className="notificaciones-resumen">
                            {noLeidas > 0
                                ? `${noLeidas} sin leer de ${items.length}`
                                : 'Todas leídas'}
                        </span>
                        {noLeidas > 0 && (
                            <button
                                type="button"
                                className="btn-detalle btn-detalle-primario"
                                onClick={marcarTodasLeidas}
                                disabled={marcandoTodas}
                                style={{ padding: '6px 16px', fontSize: 13 }}
                            >
                                {marcandoTodas ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Marcando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-double"></i> Marcar todas leídas
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {items.length > 0 ? (
                    <div className="notificaciones-lista">
                        {visibles.map(n => (
                            <div
                                key={n.id}
                                className={`notificaciones-item ${!n.leida ? 'no-leida' : ''}`}
                            >
                                <div className="notificaciones-item-icon">
                                    <i className={`fas ${iconoDe(n.tipo)}`}></i>
                                </div>
                                <div className="notificaciones-item-body">
                                    <div className="notificaciones-item-titulo">
                                        {n.titulo}
                                        {!n.leida && <span className="notif-dot"></span>}
                                    </div>
                                    {n.mensaje && (
                                        <div className="notificaciones-item-mensaje">{n.mensaje}</div>
                                    )}
                                    <div className="notificaciones-item-fecha">
                                        {formatearFecha(n.fecha_notificacion)}
                                    </div>
                                </div>
                                {!n.leida && (
                                    <button
                                        type="button"
                                        className="notificaciones-item-marcar"
                                        onClick={() => marcarLeida(n.id)}
                                        disabled={marcandoId === n.id}
                                        aria-label="Marcar como leída"
                                    >
                                        {marcandoId === n.id ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-check"></i>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className="fas fa-bell-slash"></i>
                        </div>
                        <h3>Todavía no tenés notificaciones</h3>
                        <p>
                            Recibirás avisos cuando te confirmen o rechacen una reserva,
                            cuando te consulten por una propiedad o cuando recibas un mensaje nuevo.
                        </p>
                        <Link to="/propiedades" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                            <i className="fas fa-search"></i> Explorar propiedades
                        </Link>
                    </div>
                )}

                {items.length > POR_PAGINA && (
                    <div className="props-paginacion notificaciones-paginacion">
                        <button
                            type="button"
                            className="pag-btn"
                            onClick={() => irAPagina(paginaSegura - 1)}
                            disabled={paginaSegura <= 1}
                            aria-label="Página anterior"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        {totalPaginas > 7 && paginaSegura > 4 && (
                            <button
                                type="button"
                                className="pag-btn"
                                onClick={() => irAPagina(1)}
                            >
                                1
                            </button>
                        )}
                        {totalPaginas > 7 && paginaSegura > 5 && (
                            <span className="pag-dots">…</span>
                        )}

                        {paginasVisibles().map(p => (
                            <button
                                type="button"
                                key={p}
                                className={`pag-btn ${p === paginaSegura ? 'active' : ''}`}
                                onClick={() => irAPagina(p)}
                                aria-current={p === paginaSegura ? 'page' : undefined}
                            >
                                {p}
                            </button>
                        ))}

                        {totalPaginas > 7 && paginaSegura < totalPaginas - 4 && (
                            <span className="pag-dots">…</span>
                        )}
                        {totalPaginas > 7 && paginaSegura < totalPaginas - 3 && (
                            <button
                                type="button"
                                className="pag-btn"
                                onClick={() => irAPagina(totalPaginas)}
                            >
                                {totalPaginas}
                            </button>
                        )}

                        <button
                            type="button"
                            className="pag-btn"
                            onClick={() => irAPagina(paginaSegura + 1)}
                            disabled={paginaSegura >= totalPaginas}
                            aria-label="Página siguiente"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notificaciones;