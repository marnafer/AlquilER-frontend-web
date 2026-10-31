import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { getPerfilPublico } from '../services/api';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../hooks/useAuth';

function TarjetaResena({ resena }) {
    const autor = [resena.calificador?.nombre, resena.calificador?.apellido]
        .filter(Boolean)
        .join(' ');
    const fecha = resena.fecha_publicacion
        ? new Date(resena.fecha_publicacion)
        : null;
    const fechaValida = fecha && !Number.isNaN(fecha.getTime());

    return (
        <article className="perfil-publico-resena">
            <header className="perfil-publico-resena-header">
                <div>
                    <strong>{autor || 'Usuario'}</strong>
                    {fechaValida && (
                        <time dateTime={resena.fecha_publicacion}>
                            {fecha.toLocaleDateString('es-AR')}
                        </time>
                    )}
                </div>
                <span className="perfil-publico-resena-nota">
                    <Icon name="fas fa-star" />
                    {Number(resena.calificacion || 0).toFixed(1)}
                </span>
            </header>
            <p className={resena.comentario ? '' : 'sin-comentario'}>
                {resena.comentario || 'Sin comentario escrito.'}
            </p>
        </article>
    );
}

function SeccionCalificaciones({ tipo, titulo, promedio, resenas, expandida, onToggle }) {
    const textoPromedio = promedio == null
        ? 'Sin calificaciones'
        : `★ ${Number(promedio).toFixed(2)} / 5`;

    return (
        <section className="perfil-publico-seccion">
            <button
                type="button"
                className="perfil-publico-acordeon"
                aria-expanded={expandida}
                aria-controls={`perfil-publico-${tipo}`}
                onClick={onToggle}
            >
                <span>
                    <strong>{titulo}</strong>
                    <small>Desplegar para ver más</small>
                </span>
                <Icon name={`fas fa-chevron-${expandida ? 'up' : 'down'}`} />
            </button>
            {expandida && (
                <div className="perfil-publico-contenido" id={`perfil-publico-${tipo}`}>
                    <div className="perfil-publico-promedio">
                        <span>Calificación promedio</span>
                        <strong>{textoPromedio}</strong>
                    </div>
                    {resenas.length > 0 ? (
                        resenas.map(resena => (
                            <TarjetaResena key={resena.id} resena={resena} />
                        ))
                    ) : (
                        <p className="perfil-publico-vacio">
                            {tipo === 'inquilino'
                                ? 'Todavía no tiene reseñas como inquilino.'
                                : 'Todavía no tiene reseñas sobre sus propiedades.'}
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}

function PerfilPublico() {
    const { id } = useParams();
    const { token } = useAuth();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inquilinoExpandido, setInquilinoExpandido] = useState(false);
    const [propietarioExpandido, setPropietarioExpandido] = useState(false);
    const idValido = Boolean(id && id.trim());

    const cargarPerfil = useCallback(async () => {
        if (!idValido) {
            setUsuario(null);
            setError('El usuario solicitado no es válido.');
            setLoading(false);
            return;
        }

        if (!token) {
            setUsuario(null);
            setError('Iniciá sesión para ver este perfil.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await getPerfilPublico(id, token);
            if (!response?.success || !response.data) {
                setUsuario(null);
                setError(
                    response?.message
                    || response?.error
                    || 'No se pudo cargar el perfil público.'
                );
                return;
            }
            setUsuario(response.data);
        } catch (requestError) {
            console.error('Error al cargar el perfil público:', requestError);
            setUsuario(null);
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'No se pudo cargar el perfil público.'
            );
        } finally {
            setLoading(false);
        }
    }, [id, idValido, token]);

    useEffect(() => {
        cargarPerfil();
    }, [cargarPerfil]);

    const nombre = usuario
        ? [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim()
        : '';
    useSEO(
        nombre ? `Perfil público de ${nombre}` : 'Perfil público',
        nombre
            ? `Conocé las calificaciones y reseñas de ${nombre} en AlquilER.`
            : 'Información y calificaciones públicas de usuarios de AlquilER.'
    );

    if (loading) return <Loader />;

    return (
        <div className="perfil-publico-page">
            <div className="container">
                <header className="perfil-publico-encabezado">
                    <span className="perfil-publico-etiqueta">
                        <Icon name="fas fa-user" /> Perfil público
                    </span>
                    <h1>Información y calificaciones</h1>
                    <p>Conocé el historial de reseñas de esta persona en AlquilER.</p>
                </header>

                {error ? (
                    <ErrorState
                        mensaje={error}
                        onReintentar={idValido ? cargarPerfil : undefined}
                    />
                ) : usuario ? (
                    <section className="perfil-publico-card" aria-label="Perfil de usuario">
                        <div className="perfil-publico-identidad">
                            <div className="perfil-publico-avatar" aria-hidden="true">
                                {usuario.nombre?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <h2>{nombre || 'Usuario'}</h2>
                        </div>

                        <div className="perfil-publico-separador" />
                        <h3 className="perfil-publico-titulo-seccion">
                            Historial de calificaciones y reseñas
                        </h3>

                        <SeccionCalificaciones
                            tipo="inquilino"
                            titulo="Calificaciones y reseñas que recibió como inquilino"
                            promedio={usuario.calificaciones?.inquilino}
                            resenas={Array.isArray(usuario.resenas?.inquilino)
                                ? usuario.resenas.inquilino
                                : []}
                            expandida={inquilinoExpandido}
                            onToggle={() => setInquilinoExpandido(value => !value)}
                        />

                        {usuario.calificaciones?.propiedades != null && (
                            <SeccionCalificaciones
                                tipo="propietario"
                                titulo="Calificaciones y reseñas que recibió de sus propiedades"
                                promedio={usuario.calificaciones.propiedades}
                                resenas={Array.isArray(usuario.resenas?.propiedades)
                                    ? usuario.resenas.propiedades
                                    : []}
                                expandida={propietarioExpandido}
                                onToggle={() => setPropietarioExpandido(value => !value)}
                            />
                        )}
                    </section>
                ) : null}
            </div>
        </div>
    );
}

export default PerfilPublico;
