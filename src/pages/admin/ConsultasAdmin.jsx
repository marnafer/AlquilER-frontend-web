import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    getConsultasAdmin,
    getMensajesConsulta,
    enviarMensajeConsulta,
    deleteConsulta,
    restoreConsulta
} from '../../services/api';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

function ConsultasAdmin() {
    const { token, usuario } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [modoPapelera, setModoPapelera] = useState(false);

    const [activa, setActiva] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);

    const [respuesta, setRespuesta] = useState('');
    const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
    const [errorRespuesta, setErrorRespuesta] = useState('');
    const [exitoRespuesta, setExitoRespuesta] = useState('');

    const [procesandoId, setProcesandoId] = useState(null);

    const extraerItems = (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        return [];
    };

    const cargar = useCallback(async () => {
        setLoading(true);
        setMensaje(null);
        try {
            const res = await getConsultasAdmin(token, modoPapelera);
            if (res.status === 403) {
                setMensaje({ type: 'danger', text: 'No autorizado para ver el listado de consultas.' });
            }
            setItems(extraerItems(res));
            setActiva(null);
            setMensajes([]);
        } catch (e) {
            setMensaje({ type: 'danger', text: 'Error al cargar las consultas.' });
        } finally {
            setLoading(false);
        }
    }, [token, modoPapelera]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const abrirConsulta = async (item) => {
        setActiva(item);
        setRespuesta('');
        setErrorRespuesta('');
        setExitoRespuesta('');
        setCargandoMensajes(true);
        try {
            const res = await getMensajesConsulta(item.id, token);
            setMensajes(extraerItems(res));
        } catch (e) {
            setMensajes([]);
        } finally {
            setCargandoMensajes(false);
        }
    };

    const responder = async (e) => {
        e.preventDefault();
        const texto = respuesta.trim();
        if (!texto) {
            setErrorRespuesta('El mensaje es requerido');
            return;
        }
        if (texto.length < 5) {
            setErrorRespuesta('El mensaje debe tener al menos 5 caracteres');
            return;
        }

        setEnviandoRespuesta(true);
        setErrorRespuesta('');
        setExitoRespuesta('');
        try {
            const result = await enviarMensajeConsulta(activa.id, texto, token);
            if (result.success) {
                setRespuesta('');
                setExitoRespuesta('Mensaje enviado correctamente.');
                const res = await getMensajesConsulta(activa.id, token);
                setMensajes(extraerItems(res));
            } else {
                setErrorRespuesta(
                    result.error || result.message || 'No se pudo enviar el mensaje.'
                );
            }
        } catch (err) {
            setErrorRespuesta('Error de conexión al enviar el mensaje.');
        } finally {
            setEnviandoRespuesta(false);
        }
    };

    const eliminar = async (item) => {
        if (!window.confirm(`¿Eliminar la consulta #${item.id} con su conversación?`)) return;
        setProcesandoId(String(item.id));
        try {
            const result = await deleteConsulta(item.id, token);
            if (result.success) {
                setMensaje({ type: 'success', text: 'Consulta movida a la papelera.' });
                cargar();
            } else {
                setMensaje({ type: 'danger', text: result.error || result.message || 'No se pudo eliminar la consulta.' });
            }
        } catch (err) {
            setMensaje({ type: 'danger', text: 'Error de conexión al eliminar la consulta.' });
        } finally {
            setProcesandoId(null);
        }
    };

    const restaurar = async (item) => {
        setProcesandoId(String(item.id));
        try {
            const result = await restoreConsulta(item.id, token);
            if (result.success) {
                setMensaje({ type: 'success', text: 'Consulta restaurada.' });
                cargar();
            } else {
                setMensaje({ type: 'danger', text: result.error || result.message || 'No se pudo restaurar la consulta.' });
            }
        } catch (err) {
            setMensaje({ type: 'danger', text: 'Error de conexión al restaurar la consulta.' });
        } finally {
            setProcesandoId(null);
        }
    };

    const nombreDe = (m) => {
        if (!m) return 'Usuario';
        return m.nombre || m.apellido || m.email || 'Usuario';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return String(fecha).replace('T', ' ').slice(0, 16);
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-page">
            <div className="container">
                <section className="admin-hero">
                    <div className="admin-hero-content">
                        <span className="admin-hero-badge">
                            <i className="fas fa-comments"></i> Administración
                        </span>
                        <h1>Consultas</h1>
                        <p>Leé las consultas de los interesados y respondé a cada conversación.</p>
                    </div>
                    <div className="admin-hero-actions">
                        <button
                            className="btn-detalle btn-detalle-secundario"
                            onClick={() => setModoPapelera(v => !v)}
                        >
                            <i className={modoPapelera ? 'fas fa-list' : 'fas fa-trash-can-arrow-up'}></i>
                            {modoPapelera ? 'Ver activas' : 'Papelera'}
                        </button>
                    </div>
                </section>

                <Alert type={mensaje?.type} message={mensaje?.text} />

                {modoPapelera && (
                    <div className="alert alert-info d-flex align-items-center gap-2">
                        <i className="fas fa-trash-can-arrow-up"></i>
                        <span>Estás viendo la papelera. Las consultas eliminadas aparecen acá y podés restaurarlas.</span>
                    </div>
                )}

                {items.length > 0 ? (
                    <div className="misconsultas-grid">
                        <div className="misconsultas-lista">
                            {items.map(c => (
                                <div
                                    key={c.id}
                                    className={`misconsultas-item admin-consulta-item ${activa && activa.id === c.id ? 'active' : ''}`}
                                    onClick={() => abrirConsulta(c)}
                                >
                                    <div className="misconsultas-item-img">
                                        <i className="fas fa-comments"></i>
                                    </div>
                                    <div className="misconsultas-item-body">
                                        <div className="misconsultas-item-cabecera">
                                            <span className="misconsultas-origen recibida">#{c.id}</span>
                                            <span className="misconsultas-fecha">
                                                {formatearFecha(c.fecha_consulta)}
                                            </span>
                                        </div>
                                        <p className="misconsultas-item-titulo">
                                            {c.propiedad?.titulo || `Propiedad #${c.propiedad_id}`}
                                        </p>
                                        <p className="misconsultas-item-detalle">
                                            De {c.usuario
                                                ? `${c.usuario.nombre} ${c.usuario.apellido || ''}`.trim()
                                                : `Usuario #${c.usuario_id}`}
                                        </p>
                                    </div>
                                    <div className="admin-consulta-acciones" onClick={e => e.stopPropagation()}>
                                        {modoPapelera ? (
                                            <button
                                                className="admin-btn restaurar"
                                                onClick={() => restaurar(c)}
                                                title="Restaurar"
                                                disabled={procesandoId === String(c.id)}
                                            >
                                                <i className={procesandoId === String(c.id) ? 'fas fa-spinner fa-spin' : 'fas fa-rotate-left'}></i>
                                            </button>
                                        ) : (
                                            <button
                                                className="admin-btn eliminar"
                                                onClick={() => eliminar(c)}
                                                title="Eliminar"
                                                disabled={procesandoId === String(c.id)}
                                            >
                                                <i className={procesandoId === String(c.id) ? 'fas fa-spinner fa-spin' : 'fas fa-trash'}></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="misconsultas-hilo">
                            {activa ? (
                                <>
                                    <div className="misconsultas-hilo-cabecera">
                                        <h3>
                                            {activa.propiedad?.titulo || `Propiedad #${activa.propiedad_id}`}
                                        </h3>
                                        <Link
                                            to={`/propiedades/${activa.propiedad_id}`}
                                            className="misconsultas-ver-propiedad"
                                        >
                                            Ver propiedad <i className="fas fa-external-link-alt"></i>
                                        </Link>
                                    </div>

                                    <div className="misconsultas-mensajes">
                                        {cargandoMensajes ? (
                                            <div className="misconsultas-cargando">
                                                <i className="fas fa-spinner fa-spin"></i> Cargando conversación...
                                            </div>
                                        ) : mensajes.length > 0 ? (
                                            mensajes.map(m => {
                                                const esMio = String(m.usuario_id) === String(usuario.id);
                                                return (
                                                    <div
                                                        key={m.id}
                                                        className={`misconsultas-burbuja ${esMio ? 'mio' : 'otro'}`}
                                                    >
                                                        <div className="misconsultas-burbuja-cabecera">
                                                            <strong>{esMio ? 'Vos (Admin)' : nombreDe(m.usuario)}</strong>
                                                            <span>{formatearFecha(m.fecha_mensaje)}</span>
                                                        </div>
                                                        <p>{m.mensaje}</p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="misconsultas-empty-hilo">
                                                Sin mensajes todavía.
                                            </div>
                                        )}
                                    </div>

                                    {modoPapelera || Boolean(activa.deleted_at) ? (
                                        <div className="misconsultas-empty-hilo">
                                            Consulta eliminada: no se pueden agregar mensajes.
                                        </div>
                                    ) : (
                                        <form onSubmit={responder} className="misconsultas-responder" noValidate>
                                            <textarea
                                                rows="2"
                                                placeholder="Responder como administrador..."
                                                value={respuesta}
                                                onChange={(e) => setRespuesta(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: 10,
                                                    border: `1px solid ${errorRespuesta ? '#dc2626' : '#cbd5e1'}`,
                                                    fontFamily: 'inherit',
                                                    fontSize: 14,
                                                    resize: 'vertical'
                                                }}
                                            />
                                            {errorRespuesta && (
                                                <span className="form-error">{errorRespuesta}</span>
                                            )}
                                            {exitoRespuesta && (
                                                <span style={{ color: '#065f46', fontSize: 13 }}>
                                                    <i className="fas fa-check-circle"></i> {exitoRespuesta}
                                                </span>
                                            )}
                                            <button
                                                type="submit"
                                                className="btn-detalle btn-detalle-primario"
                                                disabled={enviandoRespuesta}
                                                style={{ marginTop: 10, justifySelf: 'flex-end' }}
                                            >
                                                {enviandoRespuesta ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin"></i> Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane"></i> Enviar
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </>
                            ) : (
                                <div className="misconsultas-empty-hilo">
                                    <i className="fas fa-comments"></i>
                                    <p>Seleccioná una consulta para ver la conversación.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className={`fas ${modoPapelera ? 'fa-trash-can-arrow-up' : 'fa-comments'}`}></i>
                        </div>
                        <h3>{modoPapelera ? 'La papelera está vacía' : 'No hay consultas'}</h3>
                        <p>
                            {modoPapelera
                                ? 'Las consultas eliminadas aparecerán acá y podrás restaurarlas.'
                                : 'Los interesados consultan sobre las propiedades y las respuestas llegan a este panel.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConsultasAdmin;