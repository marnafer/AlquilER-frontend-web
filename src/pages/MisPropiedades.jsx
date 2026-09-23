import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPropiedades, deletePropiedad } from '../services/api';
import Loader from '../components/Loader';

function MisPropiedades() {
    const { token, usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [propiedades, setPropiedades] = useState([]);
    const [eliminando, setEliminando] = useState(false);
    const [propiedadAEliminar, setPropiedadAEliminar] = useState(null);

    useEffect(() => {
        cargarPropiedades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario]);

    const cargarPropiedades = async () => {
        if (!usuario) return;
        try {
            const todas = await getPropiedades();
            const mias = todas.filter(
                p => String(p.usuario_id) === String(usuario.id)
            );
            setPropiedades(mias);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarClick = (propiedad) => {
        setPropiedadAEliminar(propiedad);
    };

    const cancelarEliminar = () => {
        setPropiedadAEliminar(null);
    };

    const confirmarEliminar = async () => {
        if (!propiedadAEliminar) return;
        setEliminando(true);
        try {
            const result = await deletePropiedad(propiedadAEliminar.id, token);
            if (result.success) {
                setPropiedades(prev =>
                    prev.filter(p => p.id !== propiedadAEliminar.id)
                );
                setPropiedadAEliminar(null);
            } else {
                alert(result.message || result.error || 'No se pudo eliminar');
            }
        } catch (error) {
            alert('Error de conexión al eliminar');
        } finally {
            setEliminando(false);
        }
    };

    if (loading) return <Loader />;

    const totalDisponibles = propiedades.filter(p => p.disponible).length;
    const totalAlquiladas = propiedades.filter(p => !p.disponible).length;

    return (
        <div className="misprops-page">
            <div className="container">

                {/* HERO */}
                <section className="misprops-hero">
                    <div className="misprops-hero-content">
                        <span className="misprops-hero-badge">
                            <i className="fas fa-building"></i> Panel de mis propiedades
                        </span>
                        <h1>
                            Mis <span>Propiedades</span>
                        </h1>
                        <p>
                            Administrá tus propiedades publicadas, editá su información
                            o dá de baja las que ya no ofrezcas.
                        </p>
                    </div>
                    <div className="misprops-hero-actions">
                        <Link to="/propiedades/crear" className="btn-detalle btn-detalle-primario">
                            <i className="fas fa-plus"></i> Publicar nueva
                        </Link>
                    </div>
                </section>

                {/* ESTADÍSTICAS */}
                <section className="misprops-stats">
                    <div className="misprops-stat">
                        <div className="misprops-stat-icon teal">
                            <i className="fas fa-building"></i>
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
                            <i className="fas fa-key"></i>
                        </div>
                        <div>
                            <span className="misprops-stat-num">{totalAlquiladas}</span>
                            <span className="misprops-stat-label">Alquiladas</span>
                        </div>
                    </div>
                </section>

                {/* GRID O EMPTY STATE */}
                {propiedades.length > 0 ? (
                    <section className="misprops-grid">
                        {propiedades.map(prop => (
                            <div className="misprops-card" key={prop.id}>
                                <div className="misprops-card-image">
                                    <img
                                        src={`/uploads/propiedades/${prop.id}.jpg`}
                                        alt={prop.titulo}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.classList.add('sin-imagen');
                                        }}
                                    />
                                    <span className={`misprops-estado ${prop.disponible ? 'disponible' : 'alquilada'}`}>
                                        {prop.disponible ? 'Disponible' : 'Alquilada'}
                                    </span>
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
                                        >
                                            <i className="fas fa-eye"></i> Ver
                                        </Link>
                                        <Link
                                            to={`/propiedades/${prop.id}/editar`}
                                            className="misprops-btn editar"
                                        >
                                            <i className="fas fa-pen"></i> Editar
                                        </Link>
                                        <button
                                            className="misprops-btn eliminar"
                                            onClick={() => handleEliminarClick(prop)}
                                            title="Eliminar"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                ) : (
                    <div className="propiedades-empty">
                        <div className="empty-icon">
                            <i className="fas fa-building"></i>
                        </div>
                        <h3>Todavía no publicaste propiedades</h3>
                        <p>Publicá tu primera propiedad y empezá a recibir consultas.</p>
                        <Link
                            to="/propiedades/crear"
                            className="btn-ver-todas"
                            style={{ marginTop: '20px', display: 'inline-block' }}
                        >
                            <i className="fas fa-plus"></i> Publicar propiedad
                        </Link>
                    </div>
                )}

            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {propiedadAEliminar && (
                <div className="modal-backdrop-custom" onClick={cancelarEliminar}>
                    <div className="modal-custom" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon-danger">
                            <i className="fas fa-trash-alt"></i>
                        </div>
                        <h3>¿Eliminar propiedad?</h3>
                        <p>
                            Estás por eliminar <strong>{propiedadAEliminar.titulo}</strong>.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-detalle btn-detalle-secundario"
                                onClick={cancelarEliminar}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-detalle btn-detalle-danger"
                                onClick={confirmarEliminar}
                                disabled={eliminando}
                            >
                                {eliminando ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-trash"></i> Sí, eliminar
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