import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import { updatePerfil } from '../services/api';
import Loader from '../components/Loader';

function Perfil() {
    const { usuario, token, loading, refreshUser } = useAuth();

    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const { showToast } = useUI();

    const [passNueva, setPassNueva] = useState('');
    const [passRepetir, setPassRepetir] = useState('');
    const [passErrores, setPassErrores] = useState({});
    const [guardandoPass, setGuardandoPass] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        domicilio: ''
    });

    // Cuando carga el usuario, llenamos el form
    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                email: usuario.email || '',
                telefono: usuario.telefono || '',
                domicilio: usuario.domicilio || ''
            });
        }
    }, [usuario]);

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
                    <div className="propiedades-empty">
                        <div className="empty-icon"><i className="fas fa-user-slash"></i></div>
                        <h3>No pudimos cargar tu perfil</h3>
                        <p>Probá iniciando sesión nuevamente.</p>
                        <Link to="/login" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                            Ir al login
                        </Link>
                    </div>
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
                                <i className={`fas ${esAdministrador ? 'fa-shield-halved' : 'fa-user'}`}></i>
                                {rolLabel}
                            </span>
                            <h1>{usuario.nombre} {usuario.apellido}</h1>
                            <p>
                                <i className="fas fa-envelope"></i> {usuario.email}
                            </p>
                            {usuario.created_at && (
                                <p className="perfil-miembro">
                                    <i className="fas fa-calendar-alt"></i>
                                    Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-AR', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}
                                </p>
                            )}
                        </div>
                        <div className="perfil-hero-actions">
                            {!editando && (
                                <button
                                    className="btn-detalle btn-detalle-primario"
                                    onClick={() => setEditando(true)}
                                >
                                    <i className="fas fa-pen"></i> Editar perfil
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
                                <i className="fas fa-id-card"></i> Datos personales
                            </h3>
                            {!editando && (
                                <button
                                    className="perfil-edit-btn"
                                    onClick={() => setEditando(true)}
                                    title="Editar"
                                    aria-label="Editar datos personales"
                                >
                                    <i className="fas fa-pen"></i>
                                </button>
                            )}
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
                                                <i className="fas fa-spinner fa-spin"></i> Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check"></i> Guardar cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="perfil-datos">
                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <i className="fas fa-user"></i>
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
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div className="perfil-dato-info">
                                        <span className="perfil-dato-label">Correo electrónico</span>
                                        <span className="perfil-dato-valor">{usuario.email}</span>
                                    </div>
                                </div>

                                <div className="perfil-dato">
                                    <div className="perfil-dato-icon">
                                        <i className="fas fa-phone"></i>
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
                                        <i className="fas fa-home"></i>
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
                                        <i className="fas fa-user-tag"></i>
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

                    {/* ACCESOS RÁPIDOS */}
                    <div className="perfil-card">
                        <div className="perfil-card-header">
                            <h3>
                                <i className="fas fa-bolt"></i> Accesos rápidos
                            </h3>
                        </div>
                        <div className="dash-actions">
                            <Link to="/dashboard" className="dash-action">
                                <span className="dash-action-icon">
                                    <i className="fas fa-chart-line"></i>
                                </span>
                                <div className="dash-action-text">
                                    <strong>Dashboard</strong>
                                    <small>Ver tu resumen de actividad</small>
                                </div>
                                <i className="fas fa-chevron-right dash-action-arrow"></i>
                            </Link>
                            <Link to="/favoritos" className="dash-action">
                                <span className="dash-action-icon">
                                    <i className="fas fa-heart"></i>
                                </span>
                                <div className="dash-action-text">
                                    <strong>Mis favoritos</strong>
                                    <small>Propiedades guardadas</small>
                                </div>
                                <i className="fas fa-chevron-right dash-action-arrow"></i>
                            </Link>
                            <Link to="/propiedades" className="dash-action">
                                <span className="dash-action-icon">
                                    <i className="fas fa-search"></i>
                                </span>
                                <div className="dash-action-text">
                                    <strong>Explorar propiedades</strong>
                                    <small>Encontrá tu próximo hogar</small>
                                </div>
                                <i className="fas fa-chevron-right dash-action-arrow"></i>
                            </Link>
                            <Link to="/propiedades/crear" className="dash-action primary">
                                <span className="dash-action-icon">
                                    <i className="fas fa-plus"></i>
                                </span>
                                <div className="dash-action-text">
                                    <strong>Publicar propiedad</strong>
                                    <small>Sumá un nuevo alquiler</small>
                                </div>
                                <i className="fas fa-chevron-right dash-action-arrow"></i>
                            </Link>
                        </div>
                    </div>

                </section>

                {/* CAMBIO DE CONTRASEÑA */}
                <section className="perfil-card" style={{ marginTop: '24px' }}>
                    <div className="perfil-card-header">
                        <h3>
                            <i className="fas fa-key"></i> Cambiar contraseña
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
                                        <i className="fas fa-spinner fa-spin"></i> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-key"></i> Actualizar contraseña
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