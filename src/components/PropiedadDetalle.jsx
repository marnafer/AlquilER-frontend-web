import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    getPropiedad,
    getCategorias,
    createReserva,
    createConsulta,
    getResenasByPropiedad,
    getServiciosByPropiedad,
    getReservas,
    separarReservas,
    createResena,
    updateResena,
    deleteResena
} from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import ServicioIcono from './ServicioIcono';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import { useSEO } from '../hooks/useSEO';
import Loader from './Loader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const obtenerFechaLocal = () => {
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    return hoy.toISOString().slice(0, 10);
};

function PropiedadDetalle() {
    const { id } = useParams();
    const { usuario, token, isAuthenticated } = useAuth();
    const { confirm } = useUI();
    const [propiedad, setPropiedad] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [error, setError] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [errorReserva, setErrorReserva] = useState('');
    const [exitoReserva, setExitoReserva] = useState('');
    const [validacion, setValidacion] = useState({});

    const [mostrarModalConsulta, setMostrarModalConsulta] = useState(false);
    const [mensajeConsulta, setMensajeConsulta] = useState('');
    const [perfilInteresado, setPerfilInteresado] = useState({
        fecha_mudanza: '',
        cantidad_ocupantes: '',
        tiene_mascotas: '',
        cantidad_mascotas: '0',
        garantias: []
    });
    const [enviandoConsulta, setEnviandoConsulta] = useState(false);
    const [errorConsulta, setErrorConsulta] = useState('');
    const [exitoConsulta, setExitoConsulta] = useState('');
    const [validacionConsulta, setValidacionConsulta] = useState({});

    const [resenas, setResenas] = useState([]);
    const [promedioResenas, setPromedioResenas] = useState(0);
    const [reservas, setReservas] = useState([]);

    // Reseñar
    const [calificacion, setCalificacion] = useState(5);
    const [comentario, setComentario] = useState('');
    const [editandoResena, setEditandoResena] = useState(false);
    const [guardandoResena, setGuardandoResena] = useState(false);
    const [errorResena, setErrorResena] = useState('');
    const [exitoResena, setExitoResena] = useState('');

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
            if (token) {
                const res = await getReservas(token);
                setReservas(separarReservas(res).todas);
            } else {
                setReservas([]);
            }
        } catch (error) {
            console.error('Error cargando detalle:', error);
            setError(error.message || 'No pudimos cargar los detalles de la propiedad.');
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

    const esDuenio = usuario && propiedad && String(usuario.id) === String(propiedad.usuario_id);

    // Reseña propia + reserva finalizada calificable (inquilino sobre la propiedad)
    const { miResena, reservaCalificable } = useMemo(() => {
        if (!usuario || !propiedad || esDuenio) return { miResena: null, reservaCalificable: null };

        const mia = resenas.find(r => String(r.calificador_id) === String(usuario.id)) || null;
        const finalizadas = (reservas || []).filter(r =>
            String(r.propiedad_id) === String(propiedad.id) && r.estado === 'finalizada'
        );
        const disponible = finalizadas.find(r =>
            !resenas.some(x => String(x.reserva_id) === String(r.id))
        ) || null;

        return { miResena: mia, reservaCalificable: disponible };
    }, [resenas, reservas, usuario, propiedad, esDuenio]);

    const abrirFormularioResena = () => {
        setErrorResena('');
        setExitoResena('');
        setCalificacion(miResena ? Number(miResena.calificacion) || 5 : 5);
        setComentario(miResena?.comentario || '');
        setEditandoResena(true);
    };

    const cerrarFormularioResena = () => {
        setEditandoResena(false);
        setErrorResena('');
    };

    const enviarResena = async (e) => {
        e.preventDefault();
        setErrorResena('');
        setExitoResena('');

        const valor = Number(calificacion);
        if (!valor || valor < 1 || valor > 5) {
            setErrorResena('Seleccioná una calificación de 1 a 5 estrellas.');
            return;
        }

        setGuardandoResena(true);
        try {
            const data = {
                calificacion: valor,
                comentario: comentario.trim()
            };
            const resultado = miResena
                ? await updateResena(miResena.id, data, token)
                : await createResena({ ...data, reserva_id: Number(reservaCalificable.id) }, token);

            if (resultado.success) {
                setEditandoResena(false);
                setExitoResena(miResena
                    ? 'Tu reseña se actualizó correctamente.'
                    : 'Reseña publicada. ¡Gracias por tu aporte!'
                );
                await cargarDatos();
            } else {
                setErrorResena(
                    resultado.message || resultado.error || 'No se pudo guardar la reseña.'
                );
            }
        } catch (err) {
            setErrorResena('Error de conexión al guardar la reseña.');
        } finally {
            setGuardandoResena(false);
        }
    };

    const eliminarResena = async () => {
        if (!miResena) return;
        const confirmado = await confirm({
            titulo: '¿Eliminar tu reseña?',
            mensaje: 'No se puede recuperar después de eliminarla.',
            textoAceptar: 'Sí, eliminar',
            textoCancelar: 'Cancelar',
            peligro: true
        });
        if (!confirmado) return;
        setErrorResena('');
        setExitoResena('');
        setGuardandoResena(true);
        try {
            const resultado = await deleteResena(miResena.id, token);
            if (resultado.success) {
                setEditandoResena(false);
                setExitoResena('Tu reseña fue eliminada.');
                await cargarDatos();
            } else {
                setErrorResena(resultado.message || resultado.error || 'No se pudo eliminar la reseña.');
            }
        } catch (err) {
            setErrorResena('Error de conexión al eliminar la reseña.');
        } finally {
            setGuardandoResena(false);
        }
    };

    const abrirModalConsulta = () => {
        setErrorConsulta('');
        setValidacionConsulta({});
        setExitoConsulta('');
        setMensajeConsulta('');
        setPerfilInteresado({
            fecha_mudanza: '',
            cantidad_ocupantes: '',
            tiene_mascotas: '',
            cantidad_mascotas: '0',
            garantias: []
        });
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
        if (!perfilInteresado.fecha_mudanza) errores.fecha_mudanza = 'Indicá cuándo querés mudarte';
        if (
            !perfilInteresado.cantidad_ocupantes
            || Number(perfilInteresado.cantidad_ocupantes) < 1
            || Number(perfilInteresado.cantidad_ocupantes) > 50
        ) errores.cantidad_ocupantes = 'Indicá entre 1 y 50 ocupantes';
        if (perfilInteresado.tiene_mascotas === '') errores.tiene_mascotas = 'Indicá si tenés mascotas';
        if (
            perfilInteresado.tiene_mascotas === 'si'
            && (
                Number(perfilInteresado.cantidad_mascotas) < 1
                || Number(perfilInteresado.cantidad_mascotas) > 20
            )
        ) errores.cantidad_mascotas = 'Indicá entre 1 y 20 mascotas';
        if (Object.keys(errores).length) {
            setValidacionConsulta(errores);
            return;
        }

        setEnviandoConsulta(true);
        try {
            const result = await createConsulta({
                propiedad_id: Number(propiedad.id),
                mensaje: texto,
                perfil_interesado: {
                    fecha_mudanza: perfilInteresado.fecha_mudanza,
                    cantidad_ocupantes: Number(perfilInteresado.cantidad_ocupantes),
                    tiene_mascotas: perfilInteresado.tiene_mascotas === 'si',
                    cantidad_mascotas: perfilInteresado.tiene_mascotas === 'si'
                        ? Number(perfilInteresado.cantidad_mascotas)
                        : 0,
                    garantias: perfilInteresado.garantias
                }
            }, token);
            if (result.success) {
                setMostrarModalConsulta(false);
                setMensajeConsulta('');
                setPerfilInteresado({
                    fecha_mudanza: '',
                    cantidad_ocupantes: '',
                    tiene_mascotas: '',
                    cantidad_mascotas: '0',
                    garantias: []
                });
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

    // El SEO va antes de los returns tempranos porque los hooks no se pueden
    // llamar condicionalmente: hay que declararlo siempre, incluso mientras
    // carga. Con la propiedad todavia en null, useSEO no pisa nada.
    // La API devuelve solo localidad_id, no el nombre resuelto, asi que el titulo
    // se arma con el titulo de la propiedad y la direccion.
    const localidadTexto = propiedad?.direccion || '';
    const tituloSEO = propiedad?.titulo || '';

    const descripcionSEO = propiedad
        ? `${propiedad.titulo || 'Propiedad'} en alquiler${localidadTexto ? ` en ${localidadTexto}` : ''}. ${propiedad.cantidad_ambientes ? `${propiedad.cantidad_ambientes} ambientes. ` : ''}${Number(propiedad.precio || 0).toLocaleString('es-AR')} por mes. Reservá online o consultá directamente con el propietario.`
        : '';

    const imagenSEO = rutaImagenPropiedad(propiedad) || '/assets/img/logo.webp';

    useSEO(tituloSEO, descripcionSEO, { imagen: imagenSEO });

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="container propiedades-page">
                <EmptyState
                    icono="fa-triangle-exclamation"
                    titulo="No se pudo cargar la propiedad"
                    descripcion={error}
                    action={
                        <button className="btn-ver-todas" onClick={cargarDatos}>
                            <i className="fas fa-rotate-right"></i> Reintentar
                        </button>
                    }
                />
            </div>
        );
    }

    if (!propiedad) {
        return (
            <div className="container propiedades-page">
                <EmptyState
                    icono="fa-home"
                    titulo="Propiedad no encontrada"
                    descripcion="La propiedad que buscás no existe o fue eliminada."
                    action={
                        <Link to="/propiedades" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                            Volver al catálogo
                        </Link>
                    }
                />
            </div>
        );
    }

    const categoriaNombre = categorias.find(c => c.id === propiedad.categoria_id)?.nombre;
    const disponible = propiedad.disponible !== false;
    const imagen = rutaImagenPropiedad(propiedad);
    // toISOString() devuelve la fecha en UTC. Argentina es UTC-3, asi que despues
    // de las 21:00 marcaria el dia siguiente como minimo y no dejaria reservar
    // para hoy. Armamos el string con la fecha local.
    const hoy = (() => {
        const d = new Date();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${mes}-${dia}`;
    })();

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
                                            <ServicioIcono nombre={serv.servicio?.nombre ?? serv.nombre} /> {serv.servicio?.nombre ?? serv.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="detalle-politicas">
                            <span className={`detalle-politica-badge ${propiedad.acepta_mascotas ? 'si' : 'no'}`}>
                                <i className="fas fa-paw"></i> {propiedad.acepta_mascotas ? 'Se aceptan mascotas' : 'No se aceptan mascotas'}
                            </span>
                            <span className={`detalle-politica-badge ${propiedad.acepta_hijos ? 'si' : 'no'}`}>
                                <i className="fas fa-children"></i> {propiedad.acepta_hijos ? 'Se aceptan niños' : 'No se aceptan niños'}
                            </span>
                        </div>

                        {(() => {
                            const requisitos = propiedad.requisitos_interesados || {};
                            const garantias = {
                                recibo_sueldo: 'Recibo de sueldo',
                                garantia_propietaria: 'Garantía propietaria',
                                seguro_caucion: 'Seguro de caución',
                                garante: 'Garante'
                            };
                            const garantiasAceptadas = Array.isArray(requisitos.garantias_aceptadas)
                                ? requisitos.garantias_aceptadas
                                : [];
                            const hayRequisitos = requisitos.fecha_disponible_desde
                                || requisitos.max_ocupantes
                                || garantiasAceptadas.length;

                            return hayRequisitos ? (
                                <section
                                    aria-label="Requisitos informados por el propietario"
                                    style={{
                                        marginTop: 18,
                                        padding: 16,
                                        borderRadius: 12,
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>
                                        Requisitos informados por el propietario
                                    </h3>
                                    {requisitos.fecha_disponible_desde && (
                                        <p style={{ margin: '4px 0' }}>
                                            Disponible desde: {requisitos.fecha_disponible_desde}
                                        </p>
                                    )}
                                    {requisitos.max_ocupantes && (
                                        <p style={{ margin: '4px 0' }}>
                                            Máximo de {requisitos.max_ocupantes} ocupantes
                                        </p>
                                    )}
                                    {garantiasAceptadas.length > 0 && (
                                        <p style={{ margin: '4px 0' }}>
                                            Garantías aceptadas: {garantiasAceptadas.map(g => garantias[g] || g).join(', ')}
                                        </p>
                                    )}
                                </section>
                            ) : null;
                        })()}

                        <p
                            className={`propiedad-detalle-descripcion${propiedad.descripcion ? '' : ' vacia'}`}
                        >
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

                    {exitoResena && (
                        <div style={{
                            background: '#d1fae5',
                            color: '#065f46',
                            padding: '12px 16px',
                            borderRadius: 12,
                            fontSize: 14,
                            marginBottom: 16
                        }}>
                            <i className="fas fa-check-circle"></i> {exitoResena}
                        </div>
                    )}

                    {errorResena && (
                        <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                            <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                            {errorResena}
                        </div>
                    )}

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
                                    {miResena && String(r.id) === String(miResena.id) && (
                                        <span className="resena-mia-badge">
                                            <i className="fas fa-star"></i> Tu reseña
                                        </span>
                                    )}
                                    {r.fecha_publicacion && (
                                        <p className="resena-fecha">
                                            <i className="far fa-calendar-alt"></i>{' '}
                                            {String(r.fecha_publicacion).slice(0, 10)}
                                        </p>
                                    )}
                                    {r.comentario && (
                                        <p className="resena-comentario">{r.comentario}</p>
                                    )}
                                    {miResena && String(r.id) === String(miResena.id) && !editandoResena && (
                                        <div className="resena-acciones">
                                            <button
                                                type="button"
                                                className="resena-btn"
                                                onClick={abrirFormularioResena}
                                                disabled={guardandoResena}
                                            >
                                                <i className="fas fa-pen"></i> Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="resena-btn resena-btn-danger"
                                                onClick={eliminarResena}
                                                disabled={guardandoResena}
                                            >
                                                <i className="fas fa-trash"></i> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="resenas-vacio">
                            Todavía no hay reseñas para esta propiedad.
                        </p>
                    )}

                    {editandoResena ? (
                        <form className="resena-form" onSubmit={enviarResena} noValidate>
                            <h3 className="resena-form-titulo">
                                <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>{' '}
                                {miResena ? 'Editar tu reseña' : 'Calificar esta propiedad'}
                            </h3>

                            <div className="resena-selector">
                                <span className="resena-selector-label">Tu calificación:</span>
                                <span className="resena-selector-estrellas">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const valor = i + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={valor}
                                                className={`estrella-btn ${valor <= Number(calificacion) ? 'estrella-llena' : ''}`}
                                                onClick={() => setCalificacion(valor)}
                                                title={`${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`}
                                                aria-label={`Calificar con ${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`}
                                                aria-pressed={valor <= Number(calificacion)}
                                            >
                                                <i className="fas fa-star"></i>
                                            </button>
                                        );
                                    })}
                                </span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="resena-comentario">Comentario (opcional)</label>
                                <textarea
                                    id="resena-comentario"
                                    rows="3"
                                    placeholder="Contá cómo fue tu experiencia con esta propiedad..."
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    maxLength="1000"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: '1px solid #cbd5e1',
                                        fontFamily: 'inherit',
                                        fontSize: 14,
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-detalle btn-detalle-secundario"
                                    onClick={cerrarFormularioResena}
                                    disabled={guardandoResena}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-detalle btn-detalle-primario"
                                    disabled={guardandoResena}
                                >
                                    {guardandoResena ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i>{' '}
                                            {miResena ? 'Guardar cambios' : 'Publicar reseña'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : isAuthenticated && !esDuenio && (miResena || reservaCalificable) ? (
                        <div className="resena-cta">
                            <button
                                type="button"
                                className="btn-detalle btn-detalle-primario"
                                onClick={abrirFormularioResena}
                            >
                                <i className="fas fa-star"></i>{' '}
                                {miResena ? 'Editar mi reseña' : 'Calificar esta propiedad'}
                            </button>
                        </div>
                    ) : isAuthenticated && esDuenio ? (
                        <p className="resenas-vacio">
                            Como propietario podés calificar a tus inquilinos desde Mis Reservas.
                        </p>
                    ) : null}
                </section>
            </div>

            {/* MODAL DE RESERVA */}
            {mostrarModal && (
                <div className="modal-backdrop-custom" onClick={() => !enviando && setMostrarModal(false)}>
                    <div
                        className="modal-custom"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            textAlign: 'left',
                            maxWidth: 460,
                            maxHeight: 'calc(100vh - 40px)',
                            overflowY: 'auto'
                        }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fas fa-calendar-check" style={{ color: '#1E40AF' }}></i>
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
                            <i className="fas fa-question-circle" style={{ color: '#1E40AF' }}></i>
                            Consultar {propiedad.titulo || 'propiedad'}
                        </h3>
                        <p style={{ marginBottom: 16 }}>
                            Completá estos datos para que el propietario pueda revisar tu consulta con la información necesaria.
                        </p>
                        <p style={{ marginBottom: 16, fontSize: 13, color: '#475569' }}>
                            Tus respuestas se compartirán con el propietario de esta propiedad para gestionar tu consulta y priorizar la revisión. No generan un rechazo automático.{' '}
                            <Link to="/privacidad">Ver política de privacidad</Link>.
                        </p>

                        <form onSubmit={enviarConsulta} noValidate>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="fecha-mudanza">¿Cuándo querés mudarte? *</label>
                                <input
                                    id="fecha-mudanza"
                                    type="date"
                                    min={obtenerFechaLocal()}
                                    value={perfilInteresado.fecha_mudanza}
                                    onChange={(e) => setPerfilInteresado(prev => ({ ...prev, fecha_mudanza: e.target.value }))}
                                    className={validacionConsulta.fecha_mudanza ? 'input-error' : ''}
                                    required
                                />
                                {validacionConsulta.fecha_mudanza && <span className="form-error">{validacionConsulta.fecha_mudanza}</span>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="cantidad-ocupantes">Cantidad de ocupantes *</label>
                                <input
                                    id="cantidad-ocupantes"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={perfilInteresado.cantidad_ocupantes}
                                    onChange={(e) => setPerfilInteresado(prev => ({ ...prev, cantidad_ocupantes: e.target.value }))}
                                    className={validacionConsulta.cantidad_ocupantes ? 'input-error' : ''}
                                    required
                                />
                                {validacionConsulta.cantidad_ocupantes && <span className="form-error">{validacionConsulta.cantidad_ocupantes}</span>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label htmlFor="tiene-mascotas">¿Tenés mascotas? *</label>
                                <select
                                    id="tiene-mascotas"
                                    value={perfilInteresado.tiene_mascotas}
                                    onChange={(e) => setPerfilInteresado(prev => ({
                                        ...prev,
                                        tiene_mascotas: e.target.value,
                                        cantidad_mascotas: e.target.value === 'si' ? prev.cantidad_mascotas : '0'
                                    }))}
                                    className={validacionConsulta.tiene_mascotas ? 'input-error' : ''}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="no">No</option>
                                    <option value="si">Sí</option>
                                </select>
                                {perfilInteresado.tiene_mascotas === 'si' && (
                                    <div style={{ marginTop: 10 }}>
                                        <label htmlFor="cantidad-mascotas" style={{ display: 'block', marginBottom: 6 }}>
                                            ¿Cuántas?
                                        </label>
                                        <input
                                            id="cantidad-mascotas"
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={perfilInteresado.cantidad_mascotas}
                                            onChange={(e) => setPerfilInteresado(prev => ({ ...prev, cantidad_mascotas: e.target.value }))}
                                            style={{ display: 'block', width: '100%', boxSizing: 'border-box' }}
                                        />
                                        {validacionConsulta.cantidad_mascotas && <span className="form-error">{validacionConsulta.cantidad_mascotas}</span>}
                                    </div>
                                )}
                                {validacionConsulta.tiene_mascotas && <span className="form-error">{validacionConsulta.tiene_mascotas}</span>}
                            </div>
                            <fieldset className="form-group" style={{ border: 0, padding: 0, margin: '0 0 14px' }}>
                                <legend>¿Qué garantías podrías presentar?</legend>
                                {[
                                    ['recibo_sueldo', 'Recibo de sueldo'],
                                    ['garantia_propietaria', 'Garantía propietaria'],
                                    ['seguro_caucion', 'Seguro de caución'],
                                    ['garante', 'Garante']
                                ].map(([valor, etiqueta]) => (
                                    <label key={valor} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <input
                                            type="checkbox"
                                            checked={perfilInteresado.garantias.includes(valor)}
                                            onChange={(e) => setPerfilInteresado(prev => ({
                                                ...prev,
                                                garantias: e.target.checked
                                                    ? [...prev.garantias, valor]
                                                    : prev.garantias.filter(garantia => garantia !== valor)
                                            }))}
                                        />
                                        {etiqueta}
                                    </label>
                                ))}
                            </fieldset>
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