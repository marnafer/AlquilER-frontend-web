import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropiedad, getCategorias, createReserva, createConsulta, getResenasByPropiedad, getServiciosByPropiedad } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

function PropiedadDetalle() {
    const { id } = useParams();
    const { usuario, token, isAuthenticated } = useAuth();
    const [propiedad, setPropiedad] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [errorReserva, setErrorReserva] = useState('');
    const [exitoReserva, setExitoReserva] = useState('');
    const [validacion, setValidacion] = useState({});

    const [mostrarModalConsulta, setMostrarModalConsulta] = useState(false);
    const [mensajeConsulta, setMensajeConsulta] = useState('');
    const [enviandoConsulta, setEnviandoConsulta] = useState(false);
    const [errorConsulta, setErrorConsulta] = useState('');
    const [exitoConsulta, setExitoConsulta] = useState('');
    const [validacionConsulta, setValidacionConsulta] = useState({});

    const [resenas, setResenas] = useState([]);
    const [promedioResenas, setPromedioResenas] = useState(0);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [prop, cats, resenasRes, serviciosRes] = await Promise.all([
                getPropiedad(id),
                getCategorias(),
                getResenasByPropiedad(id),
                getServiciosByPropiedad(id)
            ]);
            setPropiedad(prop);
            setCategorias(cats);
            const servItems = serviciosRes?.items || serviciosRes || [];
            setServicios(Array.isArray(servItems) ? servItems : []);
            if (resenasRes && resenasRes.success && Array.isArray(resenasRes.data.items)) {
                setResenas(resenasRes.data.items);
                setPromedioResenas(Number(resenasRes.data.promedio) || 0);
            } else {
                setResenas([]);
                setPromedioResenas(0);
            }
        } catch (error) {
            console.error('Error cargando detalle:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderEstrellas = (valor) =>
        Array.from({ length: 5 }).map((_, i) => (
            <i
                key={i}
                className={`fas fa-star ${i < Math.round(Number(valor) || 0) ? 'estrella-llena' : ''}`}
            ></i>
        ));

    const abrirModalConsulta = () => {
        setErrorConsulta('');
        setValidacionConsulta({});
        setExitoConsulta('');
        setMensajeConsulta('');
        setMostrarModalConsulta(true);
    };

    const enviarConsulta = async (e) => {
        e.preventDefault();
        setErrorConsulta('');
        setExitoConsulta('');
        setValidacionConsulta({});

        const errores = {};
        const texto = mensajeConsulta.trim();
        if (!texto) errores.mensaje = 'El mensaje es requerido';
        else if (texto.length < 5) errores.mensaje = 'El mensaje debe tener al menos 5 caracteres';
        if (Object.keys(errores).length) {
            setValidacionConsulta(errores);
            return;
        }

        setEnviandoConsulta(true);
        try {
            const result = await createConsulta({
                propiedad_id: Number(propiedad.id),
                mensaje: texto
            }, token);
            if (result.success) {
                setMostrarModalConsulta(false);
                setMensajeConsulta('');
                setExitoConsulta('Consulta enviada correctamente. El propietario la podrá ver en su panel de consultas.');
            } else {
                if (result.validation_errors) setValidacionConsulta(result.validation_errors);
                setErrorConsulta(
                    result.error || result.message || 'No se pudo enviar la consulta.'
                );
            }
        } catch (err) {
            setErrorConsulta('Error de conexión al enviar la consulta.');
        } finally {
            setEnviandoConsulta(false);
        }
    };

    if (loading) return <Loader />;
    if (!propiedad) {

    return (
            <div className="container propiedades-page">
                <div className="propiedades-empty">
                    <div className="empty-icon"><i className="fas fa-home"></i></div>
                    <h3>Propiedad no encontrada</h3>
                    <p>La propiedad que buscás no existe o fue eliminada.</p>
                    <Link to="/propiedades" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    const categoriaNombre = categorias.find(c => c.id === propiedad.categoria_id)?.nombre;
    const disponible = propiedad.disponible !== false;
    const imagen = rutaImagenPropiedad(propiedad);
    const esDuenio = usuario && String(usuario.id) === String(propiedad.usuario_id);
    const hoy = new Date().toISOString().slice(0, 10);

    const abrirModal = () => {
        setErrorReserva('');
        setValidacion({});
        setMostrarModal(true);
    };

    const enviarReserva = async (e) => {
        e.preventDefault();
        setErrorReserva('');
        setExitoReserva('');
        setValidacion({});

        const errores = {};
        if (!fechaInicio) errores.fechaInicio = 'La fecha de inicio es requerida';
        if (!fechaFin) errores.fechaFin = 'La fecha de fin es requerida';
        if (fechaInicio && fechaFin && fechaFin <= fechaInicio) {
            errores.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
        }
        if (Object.keys(errores).length) {
            setValidacion(errores);
            return;
        }

        setEnviando(true);
        try {
            const result = await createReserva({
                propiedad_id: Number(propiedad.id),
                fecha_inicio_alquiler: fechaInicio,
                fecha_fin_alquiler: fechaFin
            }, token);
            if (result.success) {
                setMostrarModal(false);
                setFechaInicio('');
                setFechaFin('');
                setExitoReserva('Reserva solicitada correctamente. El propietario la revisará en tu panel de reservas.');
            } else {
                if (result.validation_errors) setValidacion(result.validation_errors);
                setErrorReserva(
                    result.message || result.error || 'No se pudo crear la reserva.'
                );
            }
        } catch (err) {
            setErrorReserva('Error de conexión al crear la reserva.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="props-page">
            <div className="container propiedades-page">
                <Link to="/propiedades" className="detalle-volver">
                    <i className="fas fa-arrow-left"></i> Volver a propiedades
                </Link>

                <div className="propiedad-detalle">
                    <div className="propiedad-detalle-imagen">
                        {!imagen || imgError ? (
                            <div className="propiedad-placeholder">
                                <i className="fas fa-home"></i>
                            </div>
                        ) : (
                            <img
                                src={imagen}
                                alt={propiedad.titulo || 'Propiedad'}
                                onError={() => setImgError(true)}
                            />
                        )}
                        <div className="detalle-chips">
                            {categoriaNombre && (
                                <span className="propiedad-categoria">{categoriaNombre}</span>
                            )}
                            <span className={`propiedad-badge ${disponible ? 'disponible' : 'alquilada'}`}>
                                {disponible ? 'Disponible' : 'Alquilada'}
                            </span>
                        </div>
                        <div className="propiedad-precio-pill detalle-precio-pill">
                            ${Number(propiedad.precio || 0).toLocaleString()}<span>/mes</span>
                        </div>
                    </div>

                    <div className="propiedad-detalle-contenido">
                        <div className="propiedad-detalle-header">
                            <h1>{propiedad.titulo || 'Propiedad'}</h1>
                            <p className="propiedad-direccion">
                                <i className="fas fa-map-marker-alt"></i>{' '}
                                {propiedad.direccion || 'Dirección no especificada'}
                            </p>
                        </div>

                        <div className="propiedad-detalle-features">
                            <div className="detalle-feature">
                                <i className="fas fa-bed"></i>
                                <span className="feature-num">{propiedad.cantidad_dormitorios || 0}</span>
                                <span className="feature-label">Dormitorios</span>
                            </div>
                            <div className="detalle-feature">
                                <i className="fas fa-bath"></i>
                                <span className="feature-num">{propiedad.cantidad_banos || 0}</span>
                                <span className="feature-label">Baños</span>
                            </div>
                            <div className="detalle-feature">
                                <i className="fas fa-arrows-alt"></i>
                                <span className="feature-num">{propiedad.cantidad_ambientes || 0}</span>
                                <span className="feature-label">Ambientes</span>
                            </div>
                            <div className="detalle-feature">
                                <i className="fas fa-users"></i>
                                <span className="feature-num">{propiedad.capacidad || 0}</span>
                                <span className="feature-label">Capacidad</span>
                            </div>
                        </div>

                        {servicios.length > 0 && (
                            <div className="detalle-servicios">
                                <h3 className="detalle-servicios-titulo">
                                    <i className="fas fa-concierge-bell"></i> Servicios
                                </h3>
                                <div className="detalle-servicios-lista">
                                    {servicios.map(serv => (
                                        <span className="detalle-servicio-badge" key={serv.id}>
                                            <i className="fas fa-circle-check"></i> {serv.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="propiedad-detalle-descripcion">
                            {propiedad.descripcion || 'Sin descripción'}
                        </p>

                        {exitoReserva && (
                            <div style={{
                                background: '#d1fae5',
                                color: '#065f46',
                                padding: '12px 16px',
                                borderRadius: 12,
                                fontSize: 14,
                                marginBottom: 16
                            }}>
                                <i className="fas fa-check-circle"></i> {exitoReserva}
                            </div>
                        )}

                        {exitoConsulta && (
                            <div style={{
                                background: '#d1fae5',
                                color: '#065f46',
                                padding: '12px 16px',
                                borderRadius: 12,
                                fontSize: 14,
                                marginBottom: 16
                            }}>
                                <i className="fas fa-check-circle"></i> {exitoConsulta}
                            </div>
                        )}

                        <div className="propiedad-detalle-acciones">
                            {!isAuthenticated ? (
                                <Link
                                    to="/login"
                                    className="btn-detalle btn-detalle-primario"
                                >
                                    <i className="fas fa-calendar-check"></i> Reservar ahora
                                </Link>
                            ) : (
                                <button
                                    className="btn-detalle btn-detalle-primario"
                                    disabled={!disponible || esDuenio}
                                    onClick={abrirModal}
                                    title={esDuenio ? 'No podés reservar tu propia propiedad' : ''}
                                >
                                    <i className="fas fa-calendar-check"></i>{' '}
                                    {esDuenio
                                        ? 'Es tu propiedad'
                                        : (disponible ? 'Reservar ahora' : 'No disponible')}
                                </button>
                            )}
                            {!isAuthenticated ? (
                                <Link
                                    to="/login"
                                    className="btn-detalle btn-detalle-secundario"
                                >
                                    <i className="fas fa-question-circle"></i> Consultar
                                </Link>
                            ) : (
                                <button
                                    className="btn-detalle btn-detalle-secundario"
                                    disabled={esDuenio}
                                    onClick={abrirModalConsulta}
                                    title={esDuenio ? 'No podés consultar tu propia propiedad' : ''}
                                >
                                    <i className="fas fa-question-circle"></i>{' '}
                                    {esDuenio ? 'Es tu propiedad' : 'Consultar'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* RESEÑAS */}
                <section className="resenas-section">
                    <div className="resenas-header">
                        <h2>
                            <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> Reseñas
                        </h2>
                        {resenas.length > 0 && (
                            <div className="resenas-promedio">
                                <span className="resenas-promedio-num">
                                    {Number(promedioResenas).toFixed(1)}
                                </span>
                                <span className="resenas-estrellas">{renderEstrellas(promedioResenas)}</span>
                                <span className="resenas-promedio-total">
                                    {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}
                                </span>
                            </div>
                        )}
                    </div>

                    {resenas.length > 0 ? (
                        <div className="resenas-lista">
                            {resenas.map(r => (
                                <article className="resena-item" key={r.id}>
                                    <div className="resena-item-top">
                                        <span className="resena-autor">
                                            <i className="fas fa-user"></i>{' '}
                                            {r.calificador
                                                ? `${r.calificador.nombre} ${r.calificador.apellido || ''}`.trim()
                                                : `Usuario #${r.calificador_id}`}
                                        </span>
                                        <span className="resenas-estrellas">{renderEstrellas(r.calificacion)}</span>
                                    </div>
                                    {r.fecha_publicacion && (
                                        <p className="resena-fecha">
                                            <i className="far fa-calendar-alt"></i>{' '}
                                            {String(r.fecha_publicacion).slice(0, 10)}
                                        </p>
                                    )}
                                    {r.comentario && (
                                        <p className="resena-comentario">{r.comentario}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="resenas-vacio">
                            Todavía no hay reseñas para esta propiedad.
                        </p>
                    )}
                </section>
            </div>

            {/* MODAL DE RESERVA */}
            {mostrarModal && (
                <div className="modal-backdrop-custom" onClick={() => !enviando && setMostrarModal(false)}>
                    <div
                        className="modal-custom"
                        onClick={(e) => e.stopPropagation()}
                        style={{ textAlign: 'left', maxWidth: 460 }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fas fa-calendar-check" style={{ color: '#0f766e' }}></i>
                            Reservar {propiedad.titulo || 'propiedad'}
                        </h3>
                        <p style={{ marginBottom: 16 }}>
                            Elegí las fechas de tu alquiler. El propietario tendrá que aprobar tu solicitud.
                        </p>

                        <form onSubmit={enviarReserva} noValidate>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="fecha-inicio">
                                    Fecha de inicio <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="date"
                                    id="fecha-inicio"
                                    name="fecha-inicio"
                                    min={hoy}
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className={validacion.fechaInicio || validacion.fecha_inicio_alquiler ? 'input-error' : ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: `1px solid ${(validacion.fechaInicio || validacion.fecha_inicio_alquiler) ? '#dc2626' : '#cbd5e1'}`
                                    }}
                                />
                                {(validacion.fechaInicio || validacion.fecha_inicio_alquiler) && (
                                    <span className="form-error">
                                        {validacion.fechaInicio || validacion.fecha_inicio_alquiler}
                                    </span>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="fecha-fin">
                                    Fecha de fin <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="date"
                                    id="fecha-fin"
                                    name="fecha-fin"
                                    min={fechaInicio || hoy}
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className={validacion.fechaFin || validacion.fecha_fin_alquiler ? 'input-error' : ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: `1px solid ${(validacion.fechaFin || validacion.fecha_fin_alquiler) ? '#dc2626' : '#cbd5e1'}`
                                    }}
                                />
                                {(validacion.fechaFin || validacion.fecha_fin_alquiler) && (
                                    <span className="form-error">
                                        {validacion.fechaFin || validacion.fecha_fin_alquiler}
                                    </span>
                                )}
                            </div>

                            {errorReserva && (
                                <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                                    <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                                    {errorReserva}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-detalle btn-detalle-secundario"
                                    onClick={() => setMostrarModal(false)}
                                    disabled={enviando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-detalle btn-detalle-primario"
                                    disabled={enviando}
                                >
                                    {enviando ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i> Solicitar reserva
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        {/* MODAL DE CONSULTA */}
            {mostrarModalConsulta && (
                <div className="modal-backdrop-custom" onClick={() => !enviandoConsulta && setMostrarModalConsulta(false)}>
                    <div
                        className="modal-custom"
                        onClick={(e) => e.stopPropagation()}
                        style={{ textAlign: 'left', maxWidth: 460 }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fas fa-question-circle" style={{ color: '#0f766e' }}></i>
                            Consultar {propiedad.titulo || 'propiedad'}
                        </h3>
                        <p style={{ marginBottom: 16 }}>
                            Escribile una consulta al propietario. Te responderá en tu panel de consultas.
                        </p>

                        <form onSubmit={enviarConsulta} noValidate>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="mensaje-consulta">
                                    Mensaje <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <textarea
                                    id="mensaje-consulta"
                                    rows="4"
                                    placeholder="Ej: ¿El precio incluye expensas? ¿Permite mascotas?"
                                    value={mensajeConsulta}
                                    onChange={(e) => setMensajeConsulta(e.target.value)}
                                    className={validacionConsulta.mensaje ? 'input-error' : ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: `1px solid ${validacionConsulta.mensaje ? '#dc2626' : '#cbd5e1'}`,
                                        fontFamily: 'inherit',
                                        fontSize: 14,
                                        resize: 'vertical'
                                    }}
                                />
                                {validacionConsulta.mensaje && (
                                    <span className="form-error">
                                        {validacionConsulta.mensaje}
                                    </span>
                                )}
                            </div>

                            {errorConsulta && (
                                <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                                    <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                                    {errorConsulta}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-detalle btn-detalle-secundario"
                                    onClick={() => setMostrarModalConsulta(false)}
                                    disabled={enviandoConsulta}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-detalle btn-detalle-primario"
                                    disabled={enviandoConsulta}
                                >
                                    {enviandoConsulta ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i> Enviar consulta
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

export default PropiedadDetalle;