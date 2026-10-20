import Icon from '../components/Icon';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { updatePerfil, getMisResenasPropiedades, getMisResenasComoInquilino } from '../services/api';
import { useSEO } from '../hooks/useSEO';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

function Perfil() {
    useSEO('Mi perfil', 'Gestioná tus datos personales y tu contraseña en AlquilER.', { noindex: true });

    const { usuario, token, loading, refreshUser } = useAuth();

    useEffect(() => {
        if (!token) return;
        let activo = true;
        (async () => {
            try {
                const [resProp, resInq] = await Promise.all([
                    getMisResenasPropiedades(token),
                    getMisResenasComoInquilino(token)
                ]);
                if (!activo) return;
                const itemsProp = Array.isArray(resProp?.data?.items)
                    ? resProp.data.items
                    : (Array.isArray(resProp?.data) ? resProp.data : []);
                const itemsInq = Array.isArray(resInq?.data?.items)
                    ? resInq.data.items
                    : (Array.isArray(resInq?.data) ? resInq.data : []);
                const prom = (arr) => arr.length
                    ? arr.reduce((a, r) => a + (Number(r.calificacion) || 0), 0) / arr.length
                    : 0;
                setReputacion({
                    inquilino: { promedio: prom(itemsInq), total: itemsInq.length },
                    propietario: { promedio: prom(itemsProp), total: itemsProp.length }
                });
            } catch (e) {
                // silencioso
            }
        })();
        return () => { activo = false; };
    }, [token]);
    const { theme, toggleTheme } = useTheme();

    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const { showToast } = useUI();

    const [passNueva, setPassNueva] = useState('');
    const [passRepetir, setPassRepetir] = useState('');
    const [passErrores, setPassErrores] = useState({});
    const [guardandoPass, setGuardandoPass] = useState(false);

    const [reputacion, setReputacion] = useState({
        inquilino: { promedio: 0, total: 0 },
        propietario: { promedio: 0, total: 0 }
    });

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        domicilio: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            const result = await updatePerfil(usuario.id, formData, token);

            if (result.success) {
                showToast('Perfil actualizado correctamente');
                setEditando(false);
                // Refrescamos el usuario en el contexto (sin recargar la página)
                await refreshUser();
            } else {
                showToast(result.message || 'Error al actualizar el perfil', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        // Restauramos los valores originales
        setFormData({
            nombre: usuario?.nombre || '',
            apellido: usuario?.apellido || '',
            email: usuario?.email || '',
            telefono: usuario?.telefono || '',
            domicilio: usuario?.domicilio || ''
        });
        setEditando(false);
    };


    const handleCambiarContrasena = async (e) => {
        e.preventDefault();
        const errores = {};

        if (!passNueva) {
            errores.nueva = 'Ingresá la nueva contraseña.';
        } else if (passNueva.length < 8) {
            errores.nueva = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if (passRepetir !== passNueva) {
            errores.repetir = 'Las contraseñas no coinciden.';
        }

        setPassErrores(errores);
        if (Object.keys(errores).length > 0) return;

        setGuardandoPass(true);
        try {
            const result = await updatePerfil(usuario.id, { contrasena: passNueva }, token);

            if (result.success) {
                setPassNueva('');
                setPassRepetir('');
                showToast('Contraseña cambiada correctamente');
            } else {
                if (result.validation_errors) setPassErrores(result.validation_errors);
                showToast(result.message || result.error || 'No se pudo cambiar la contraseña', 'error');
            }
        } catch (err) {
            showToast('Error de conexión', 'error');
        } finally {
            setGuardandoPass(false);
        }
    };

    if (loading) return <Loader />;

    if (!usuario) {
        return (
            <div className="perfil-page">
                <div className="container">
                    <EmptyState
                        icono="fa-user-slash"
                        titulo="No pudimos cargar tu perfil"
                        descripcion="Probá iniciando sesión nuevamente."
                        action={
                            <Link to="/login" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                                Ir al login
                            </Link>
                        }
                    />
                </div>
            </div>
        );
    }

    const inicial = (usuario.nombre?.[0] || 'U').toUpperCase();
    const esAdministrador = usuario.rol === 'administrador';
    const rolLabel = esAdministrador ? 'Administrador' : 'Usuario';

    return (
        <div className="perfil-page">
            <div className="container">

                {/* HERO / CABECERA DEL PERFIL */}
                <section className="perfil-hero">
                    <div className="perfil-hero-content">
                        <div className="perfil-avatar">
                            {inicial}
                        </div>
                        <div className="perfil-hero-text">
                            <span className="perfil-rol-badge">
                                <Icon name={`fas ${esAdministrador ? 'fa-shield-halved' : 'fa-user'}`} />
                                {rolLabel}
                            </span>
                            <h1>{usuario.nombre} {usuario.apellido}</h1>
                            <p>
                                <Icon name="fas fa-envelope" /> {usuario.email}
                            </p>
                            {usuario.created_at && (
                                <p className="perfil-miembro">
                                    <Icon name="fas fa-calendar-alt" />
                                    Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-AR', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}
                                </p>
                            )}
                        </div>
                        <div className="perfil-hero-actions">
                            <button
                                type="button"
                                className="btn-detalle btn-detalle-secundario"
                                onClick={toggleTheme}
                                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                            >
                                <Icon name={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                                {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                            </button>
                            {!editando && (
                                <button
                                    className="btn-detalle btn-detalle-primario"
                                    onClick={() => setEditando(true)}
                                >
                                    <Icon name="fas fa-pen" /> Editar perfil
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* GRID PRINCIPAL */}
                <section className="perfil-grid">

                    {/* DATOS PERSONALES */}
                    <div className="perfil-card">
                        <div className="perfil-card-header">
                            <h3>
                                <Icon name="fas fa-id-card" /> Datos personales
                            </h3>
                        </div>

                        {editando ? (
                            <form onSubmit={handleSubmit} className="perfil-form">
                                <div className="form-row">
                                    <div className="perfil-form-group">
                                        <label htmlFor="nombre">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="perfil-form-group">
                                        <label htmlFor="apellido">Apellido</label>
                                        <input
                                            type="text"
                                            id="apellido"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="perfil-form-group">
                                    <label htmlFor="email">Correo electrónico</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="perfil-form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Ej: 341 1234567"
                                    />
                                </div>

                                <div className="perfil-form-group">
                                    <label htmlFor="domicilio">Domicilio</label>
                                    <input
                                        type="text"
                                        id="domicilio"
                                        name="domicilio"
                                        value={formData.domicilio}
                                        onChange={handleChange}
                                        placeholder="Ej: Av. San Martín 123"
                                    />
                                </div>

                                <div className="perfil-form-acciones">
                                    <button
                                        type="button"
                                        className="btn-detalle btn-detalle-secundario"
                                        onClick={handleCancelar}
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-detalle btn-detalle-primario"
                                        disabled={guardando}
                                    >
                                        {guardando ? (
                                            <>
                                                <Icon name="fas fa-spinner fa-spin" /> Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="fas fa-check" /> Guardar cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="perfil-datos">
                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <Icon name="fas fa-user" />
                                    </div>
                                    <div className="perfil-dato-info">
                                        <span className="perfil-dato-label">Nombre completo</span>
                                        <span className="perfil-dato-valor">
                                            {usuario.nombre} {usuario.apellido}
                                        </span>
                                    </div>
                                </div>

                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <Icon name="fas fa-envelope" />
                                    </div>
                                    <div className="perfil-dato-info">
                                        <span className="perfil-dato-label">Correo electrónico</span>
                                        <span className="perfil-dato-valor">{usuario.email}</span>
                                    </div>
                                </div>

                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <Icon name="fas fa-phone" />
                                    </div>
                                    <div className="perfil-dato-info">
                                        <span className="perfil-dato-label">Teléfono</span>
                                        <span className="perfil-dato-valor">
                                            {usuario.telefono || <em className="perfil-vacio">No especificado</em>}
                                        </span>
                                    </div>
                                </div>

                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <Icon name="fas fa-home" />
                                    </div>
                                    <div className="perfil-dato-info">
                                        <span className="perfil-dato-label">Domicilio</span>
                                        <span className="perfil-dato-valor">
                                            {usuario.domicilio || <em className="perfil-vacio">No especificado</em>}
                                        </span>
                                    </div>
                                </div>

                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <Icon name="fas fa-user-tag" />
                                    </div>
                                    <div className="perfil-dato-info">
                                        <span className="perfil-dato-label">Tipo de usuario</span>
                                        <span className="perfil-dato-valor">
                                            {rolLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                        {/* REPUTACIÓN */}
                        <div className="perfil-card">
                            <div className="perfil-card-header">
                                <h3>
                                    <Icon name="fas fa-star" /> Mi reputación
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <span className="perfil-dato-label">Como inquilino</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Icon
                                                key={i}
                                                name="fas fa-star"
                                                style={{ color: i < Math.round(reputacion.inquilino.promedio) ? '#f59e0b' : 'var(--gray-400)', fontSize: 18 }}
                                            />
                                        ))}
                                        <span style={{ fontWeight: 700, marginLeft: 4 }}>
                                            {reputacion.inquilino.promedio ? reputacion.inquilino.promedio.toFixed(1) : '—'}
                                        </span>
                                        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>
                                            ({reputacion.inquilino.total} {reputacion.inquilino.total === 1 ? 'reseña' : 'reseñas'})
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="perfil-dato-label">Como propietario</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Icon
                                                key={i}
                                                name="fas fa-star"
                                                style={{ color: i < Math.round(reputacion.propietario.promedio) ? '#f59e0b' : 'var(--gray-400)', fontSize: 18 }}
                                            />
                                        ))}
                                        <span style={{ fontWeight: 700, marginLeft: 4 }}>
                                            {reputacion.propietario.promedio ? reputacion.propietario.promedio.toFixed(1) : '—'}
                                        </span>
                                        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>
                                            ({reputacion.propietario.total} {reputacion.propietario.total === 1 ? 'reseña' : 'reseñas'})
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="perfil-form-help">
                                Mirá las reseñas que recibiste como inquilino, las de tus propiedades y las que
                                escribiste a lo largo de tus alquileres.
                            </p>
                            <Link to="/mis-resenas" className="btn-detalle btn-detalle-primario">
                                <Icon name="fas fa-star" /> Ver mis reseñas
                            </Link>
                        </div>

                </section>

                {/* ACCESOS RÁPIDOS */}
                <section className="perfil-card" style={{ marginTop: '24px' }}>
                    <div className="perfil-card-header">
                        <h3>
                            <Icon name="fas fa-bolt" /> Accesos rápidos
                        </h3>
                    </div>
                    <div className="dash-actions">
                            <Link to="/dashboard" className="dash-action">
                                <span className="dash-action-icon">
                                    <Icon name="fas fa-chart-line" />
                                </span>
                                <div className="dash-action-text">
                                    <strong>Dashboard</strong>
                                    <small>Ver tu resumen de actividad</small>
                                </div>
                                <Icon name="fas fa-chevron-right dash-action-arrow" />
                            </Link>
                            <Link to="/favoritos" className="dash-action">
                                <span className="dash-action-icon">
                                    <Icon name="fas fa-heart" />
                                </span>
                                <div className="dash-action-text">
                                    <strong>Mis favoritos</strong>
                                    <small>Propiedades guardadas</small>
                                </div>
                                <Icon name="fas fa-chevron-right dash-action-arrow" />
                            </Link>
                            <Link to="/propiedades" className="dash-action">
                                <span className="dash-action-icon">
                                    <Icon name="fas fa-search" />
                                </span>
                                <div className="dash-action-text">
                                    <strong>Explorar propiedades</strong>
                                    <small>Encontrá tu próximo hogar</small>
                                </div>
                                <Icon name="fas fa-chevron-right dash-action-arrow" />
                            </Link>
                            <Link to="/propiedades/crear" className="dash-action primary">
                                <span className="dash-action-icon">
                                    <Icon name="fas fa-plus" />
                                </span>
                                <div className="dash-action-text">
                                    <strong>Publicar propiedad</strong>
                                    <small>Sumá un nuevo alquiler</small>
                                </div>
                                <Icon name="fas fa-chevron-right dash-action-arrow" />
                            </Link>
                        </div>

                </section>

                {/* CAMBIO DE CONTRASEÑA */}
                <section className="perfil-card" style={{ marginTop: '24px' }}>
                    <div className="perfil-card-header">
                        <h3>
                            <Icon name="fas fa-key" /> Cambiar contraseña
                        </h3>
                    </div>
                    <p className="perfil-form-help">
                        Definí una nueva contraseña de al menos 8 caracteres. Se actualizará tu acceso
                        en la sesión actual.
                    </p>

                    <form onSubmit={handleCambiarContrasena} className="perfil-form" noValidate>
                        <div className="form-row">
                            <div className="perfil-form-group">
                                <label htmlFor="pass-nueva">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="pass-nueva"
                                    name="passNueva"
                                    value={passNueva}
                                    onChange={(e) => setPassNueva(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    className={passErrores.nueva ? 'input-error' : ''}
                                />
                                {passErrores.nueva && <span className="form-error">{passErrores.nueva}</span>}
                            </div>
                            <div className="perfil-form-group">
                                <label htmlFor="pass-repetir">Repetir contraseña</label>
                                <input
                                    type="password"
                                    id="pass-repetir"
                                    name="passRepetir"
                                    value={passRepetir}
                                    onChange={(e) => setPassRepetir(e.target.value)}
                                    placeholder="Repetí la nueva contraseña"
                                    className={passErrores.repetir ? 'input-error' : ''}
                                />
                                {passErrores.repetir && <span className="form-error">{passErrores.repetir}</span>}
                            </div>
                        </div>

                        <div className="perfil-form-acciones">
                            <button
                                type="submit"
                                className="btn-detalle btn-detalle-primario"
                                disabled={guardandoPass}
                            >
                                {guardandoPass ? (
                                    <>
                                        <Icon name="fas fa-spinner fa-spin" /> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="fas fa-key" /> Actualizar contraseña
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>

            </div>
        </div>
    );
}

export default Perfil;