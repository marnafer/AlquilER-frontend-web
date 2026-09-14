import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPropiedades, deletePropiedad, getCategorias } from '../services/api';
import { rutaImagenPropiedad } from '../utils/imagenes';
import Loader from '../components/Loader';

function MisPropiedades() {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    const [propiedades, setPropiedades] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eliminando, setEliminando] = useState(null);
    const [mensaje, setMensaje] = useState({ type: '', text: '' });
    const [confirmarEliminar, setConfirmarEliminar] = useState(null);

    const cargarDatos = useCallback(async () => {
        try {
            const [props, cats] = await Promise.all([
                getPropiedades(),
                getCategorias()
            ]);

            // Normalizar respuesta
            const lista = Array.isArray(props) ? props : (props?.data || props?.items || []);
            const listaCats = Array.isArray(cats) ? cats : (cats?.data || cats?.items || []);

            // Filtrar por propietario
            const usuarioId = usuario?.id;
            const mias = lista.filter(p => {
                const pid = p.usuario_id || p.propietario_id || p.user_id;
                return usuarioId && String(pid) === String(usuarioId);
            });

            setPropiedades(mias);
            setCategorias(listaCats);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
            setMensaje({ type: 'error', text: 'No pudimos cargar tus propiedades' });
        } finally {
            setLoading(false);
        }
    }, [usuario?.id]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Auto-ocultar mensajes
    useEffect(() => {
        if (mensaje.text) {
            const timer = setTimeout(() => setMensaje({ type: '', text: '' }), 3500);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    const categoriasMap = categorias.reduce((acc, cat) => {
        acc[cat.id] = cat.nombre;
        return acc;
    }, {});

    const handleEliminar = async (id) => {
        setEliminando(id);
        try {
            const result = await deletePropiedad(id, token);
            if (result?.success !== false) {
                setPropiedades(prev => prev.filter(p => p.id !== id));
                setMensaje({ type: 'success', text: 'Propiedad eliminada correctamente' });
                setConfirmarEliminar(null);
            } else {
                setMensaje({ type: 'error', text: result?.message || 'No se pudo eliminar' });
            }
        } catch (error) {
            console.error('Error eliminando:', error);
            setMensaje({ type: 'error', text: 'Error de conexión' });
        } finally {
            setEliminando(null);
        }
    };

    // Solo propietarios pueden ver esta página
    if (usuario && usuario.rol !== 'propietario') {
        return (
            <div className="misprops-page">
                <div className="container">
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className="fas fa-lock"></i>
                        </div>
                        <h3>Solo para propietarios</h3>
                        <p>
                            Esta sección está reservada para usuarios con rol de propietario.
                            Si querés publicar propiedades, cambiá tu tipo de usuario.
                        </p>
                        <Link
                            to="/perfil"
                            className="btn-ver-todas"
                            style={{ marginTop: '20px', display: 'inline-block' }}
                        >
                            Ir a mi perfil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <Loader />;

    const totalDisponibles = propiedades.filter(p => p.disponible !== false).length;
    const totalAlquiladas = propiedades.length - totalDisponibles;

    return (
        <div className="misprops-page">
            <div className="container">

                {/* HERO */}
                <section className="misprops-hero">
                    <div className="misprops-hero-content">
                        <span className="misprops-hero-badge">
                            <i className="fas fa-building"></i> Panel de propietario
                        </span>
                        <h1>
                            Mis <span>propiedades</span>
                        </h1>
                        <p>
                            Gestioná tus publicaciones: editá, actualizá el estado o eliminá
                            las que ya no estén disponibles.
                        </p>
                    </div>
                    <div className="misprops-hero-actions">
                        <Link to="/propiedades/crear" className="btn-detalle btn-detalle-primario">
                            <i className="fas fa-plus"></i> Publicar nueva
                        </Link>
                    </div>
                </section>

                {/* MENSAJE */}
                {mensaje.text && (
                    <div
                        className={`alert alert-${mensaje.type === 'success' ? 'success' : 'error'}`}
                        style={{ marginBottom: '24px' }}
                    >
                        <i
                            className={`fas ${
                                mensaje.type === 'success'
                                    ? 'fa-check-circle'
                                    : 'fa-exclamation-circle'
                            }`}
                            style={{ marginRight: '8px' }}
                        ></i>
                        {mensaje.text}
                    </div>
                )}

                {/* MINI STATS */}
                {propiedades.length > 0 && (
                    <div className="misprops-stats">
                        <div className="misprops-stat">
                            <div className="misprops-stat-icon teal">
                                <i className="fas fa-home"></i>
                            </div>
                            <div>
                                <span className="misprops-stat-num">{propiedades.length}</span>
                                <span className="misprops-stat-label">Total</span>
                            </div>
                        </div>
                        <div className="misprops-stat">
                            <div className="misprops-stat-icon emerald">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <span className="misprops-stat-num">{totalDisponibles}</span>
                                <span className="misprops-stat-label">Disponibles</span>
                            </div>
                        </div>
                        <div className="misprops-stat">
                            <div className="misprops-stat-icon slate">
                                <i className="fas fa-ban"></i>
                            </div>
                            <div>
                                <span className="misprops-stat-num">{totalAlquiladas}</span>
                                <span className="misprops-stat-label">Alquiladas</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* LISTADO */}
                {propiedades.length > 0 ? (
                    <div className="misprops-grid">
                        {propiedades.map(prop => {
                            const disponible = prop.disponible !== false;
                            const categoriaNombre = categoriasMap[prop.categoria_id];

                            return (
                                <div className="misprops-card" key={prop.id}>
                                    <div className="misprops-card-image">
                                        <img
                                            src={rutaImagenPropiedad(prop) || '/assets/img/logo.png'}
                                            alt={prop.titulo}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.classList.add('sin-imagen');
                                            }}
                                        />
                                        <span
                                            className={`misprops-estado ${disponible ? 'disponible' : 'alquilada'}`}
                                        >
                                            {disponible ? 'Disponible' : 'Alquilada'}
                                        </span>
                                        {categoriaNombre && (
                                            <span className="misprops-categoria">
                                                <i className="fas fa-tag"></i> {categoriaNombre}
                                            </span>
                                        )}
                                    </div>

                                    <div className="misprops-card-body">
                                        <h3>{prop.titulo || 'Sin título'}</h3>
                                        <p className="misprops-direccion">
                                            <i className="fas fa-map-marker-alt"></i>{' '}
                                            {prop.direccion || 'Sin dirección'}
                                        </p>

                                        <div className="misprops-meta">
                                            <div className="misprops-precio">
                                                ${Number(prop.precio || 0).toLocaleString()}
                                                <span>/mes</span>
                                            </div>
                                            <div className="misprops-features">
                                                <span><i className="fas fa-bed"></i> {prop.cantidad_dormitorios || 0}</span>
                                                <span><i className="fas fa-bath"></i> {prop.cantidad_banos || 0}</span>
                                            </div>
                                        </div>

                                        <div className="misprops-actions">
                                            <Link
                                                to={`/propiedades/${prop.id}`}
                                                className="misprops-btn ver"
                                                title="Ver detalle"
                                            >
                                                <i className="fas fa-eye"></i> Ver
                                            </Link>
                                            <Link
                                                to={`/propiedades/${prop.id}/editar`}
                                                className="misprops-btn editar"
                                                title="Editar"
                                            >
                                                <i className="fas fa-pen"></i> Editar
                                            </Link>
                                            <button
                                                className="misprops-btn eliminar"
                                                onClick={() => setConfirmarEliminar(prop)}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className="fas fa-home"></i>
                        </div>
                        <h3>Todavía no publicaste propiedades</h3>
                        <p>
                            Publicá tu primera propiedad y empezá a recibir consultas
                            de posibles inquilinos.
                        </p>
                        <Link
                            to="/propiedades/crear"
                            className="btn-ver-todas"
                            style={{ marginTop: '20px', display: 'inline-block' }}
                        >
                            <i className="fas fa-plus"></i> Publicar mi primera propiedad
                        </Link>
                    </div>
                )}

            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {confirmarEliminar && (
                <div
                    className="modal-backdrop-custom"
                    onClick={() => !eliminando && setConfirmarEliminar(null)}
                >
                    <div className="modal-custom" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon-danger">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>¿Eliminar propiedad?</h3>
                        <p>
                            Estás por eliminar <strong>{confirmarEliminar.titulo}</strong>.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-detalle btn-detalle-secundario"
                                onClick={() => setConfirmarEliminar(null)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-detalle btn-detalle-danger"
                                onClick={() => handleEliminar(confirmarEliminar.id)}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-trash-alt"></i> Sí, eliminar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisPropiedades;