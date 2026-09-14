import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    getConsultas,
    getMisPropiedades,
    getConsultasByPropiedad,
    getMensajesConsulta,
    enviarMensajeConsulta
} from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import Loader from '../components/Loader';

function MisConsultas() {
    const { token, usuario } = useAuth();
    const esPropietarioAdmin = !!usuario && ['propietario', 'administrador'].includes(usuario.rol);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('todas');

    const [activa, setActiva] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);
    const [respuesta, setRespuesta] = useState('');
    const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
    const [errorRespuesta, setErrorRespuesta] = useState('');
    const [exitoRespuesta, setExitoRespuesta] = useState('');

    const cargar = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const enviadasRes = await getConsultas(token);
            const enviadas = (enviadasRes?.data?.items || []).map(c => ({
                consulta: c,
                origen: 'enviada',
                propiedad: c.propiedad || null
            }));

            let recibidas = [];
            if (esPropietarioAdmin) {
                const props = await getMisPropiedades(token) || [];
                const resultados = await Promise.all(
                    props.map(p => getConsultasByPropiedad(p.id, token))
                );
                resultados.forEach((res, idx) => {
                    const consultas = res?.data?.items || [];
                    consultas.forEach(c => recibidas.push({
                        consulta: c,
                        origen: 'recibida',
                        propiedad: props[idx]
                    }));
                });
            }

            setItems([...recibidas, ...enviadas]);
        } catch (e) {
            setError('Error cargando las consultas. Intentalo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [token, esPropietarioAdmin]);

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
            const res = await getMensajesConsulta(item.consulta.id, token);
            setMensajes(res?.data?.items || []);
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
            const result = await enviarMensajeConsulta(activa.consulta.id, texto, token);
            if (result.success) {
                setRespuesta('');
                setExitoRespuesta('Mensaje enviado correctamente.');
                const res = await getMensajesConsulta(activa.consulta.id, token);
                setMensajes(res?.data?.items || []);
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

    const nombreDe = (m) => {
        if (!m) return 'Usuario';
        return m.nombre || m.apellido || m.email || 'Usuario';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const partes = String(fecha).replace('T', ' ').slice(0, 16);
        return partes;
    };

    if (loading) return <Loader />;

    const recibidasCount = items.filter(i => i.origen === 'recibida').length;
    const enviadasCount = items.filter(i => i.origen === 'enviada').length;
    const visibles = items.filter(i => filtro === 'todas' || i.origen === filtro);

    return (
        <div className="misconsultas-page">
            <div className="container">
                {/* HERO */}
                <section className="misconsultas-hero">
                    <div className="misconsultas-hero-content">
                        <span className="misconsultas-hero-badge">
                            <i className="fas fa-comments"></i> Consultas
                        </span>
                        <h1>Mensajes con <span>propietarios</span></h1>
                        <p>
                            Consultá sobre una propiedad o respondé las consultas que recibiste.
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {/* FILTROS */}
                {items.length > 0 && (
                    <div className="misconsultas-filtros">
                        <button
                            className={`misconsultas-filtro ${filtro === 'todas' ? 'active' : ''}`}
                            onClick={() => setFiltro('todas')}
                        >
                            Todas <span className="misconsultas-count">{items.length}</span>
                        </button>
                        {esPropietarioAdmin && (
                            <button
                                className={`misconsultas-filtro ${filtro === 'recibida' ? 'active' : ''}`}
                                onClick={() => setFiltro('recibida')}
                            >
                                Recibidas <span className="misconsultas-count">{recibidasCount}</span>
                            </button>
                        )}
                        <button
                            className={`misconsultas-filtro ${filtro === 'enviada' ? 'active' : ''}`}
                            onClick={() => setFiltro('enviada')}
                        >
                            Enviadas <span className="misconsultas-count">{enviadasCount}</span>
                        </button>
                    </div>
                )}

                {visibles.length > 0 ? (
                    <div className="misconsultas-grid">
                        {/* LISTADO */}
                        <div className="misconsultas-lista">
                            {visibles.map(item => {
                                const c = item.consulta;
                                const img = item.propiedad ? rutaImagenPropiedad(item.propiedad) : '';
                                return (
                                    <button
                                        key={c.id}
                                        className={`misconsultas-item ${activa && activa.consulta.id === c.id ? 'active' : ''}`}
                                        onClick={() => abrirConsulta(item)}
                                    >
                                        <div className="misconsultas-item-img">
                                            {img ? (
                                                <img src={img} alt="" />
                                            ) : (
                                                <i className="fas fa-home"></i>
                                            )}
                                        </div>
                                        <div className="misconsultas-item-body">
                                            <div className="misconsultas-item-cabecera">
                                                <span className={`misconsultas-origen ${item.origen}`}>
                                                    {item.origen === 'recibida' ? 'Recibida' : 'Enviada'}
                                                </span>
                                                <span className="misconsultas-fecha">
                                                    {formatearFecha(c.fecha_consulta)}
                                                </span>
                                            </div>
                                            <p className="misconsultas-item-titulo">
                                                {item.propiedad?.titulo || c.propiedad?.titulo || 'Propiedad'}
                                            </p>
                                            <p className="misconsultas-item-detalle">
                                                {item.origen === 'recibida'
                                                    ? `De ${nombreDe(c.usuario)}`
                                                    : 'Para el propietario'}
                                            </p>
                                        </div>
                                        <i className="fas fa-chevron-right misconsultas-item-arrow"></i>
                                    </button>
                                );
                            })}
                        </div>

                        {/* HILO */}
                        <div className="misconsultas-hilo">
                            {activa ? (
                                <>
                                    <div className="misconsultas-hilo-cabecera">
                                        <h3>
                                            {activa.propiedad?.titulo || activa.consulta.propiedad?.titulo || 'Propiedad'}
                                        </h3>
                                        <Link
                                            to={`/propiedades/${activa.consulta.propiedad_id}`}
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
                                                            <strong>{esMio ? 'Vos' : nombreDe(m.usuario)}</strong>
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

                                    <form onSubmit={responder} className="misconsultas-responder" noValidate>
                                        <textarea
                                            rows="2"
                                            placeholder="Responder..."
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
                            <i className="fas fa-comments"></i>
                        </div>
                        <h3>Todavía no tenés consultas</h3>
                        <p>
                            Consultá sobre una propiedad para iniciar una conversación
                            con su propietario.
                        </p>
                        <Link to="/propiedades" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                            <i className="fas fa-search"></i> Explorar propiedades
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MisConsultas;