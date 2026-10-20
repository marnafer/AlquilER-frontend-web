import Icon from '../components/Icon';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    getResenasByUsuario,
    getMisResenasPropiedades,
    getResenasByCalificador
} from '../services/api';
import { useSEO } from '../hooks/useSEO';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const PESTANAS = [
    { clave: 'recibidas', label: 'Recibidas', icono: 'fas fa-inbox' },
    { clave: 'propiedades', label: 'De mis propiedades', icono: 'fas fa-building' },
    { clave: 'escritas', label: 'Escribí', icono: 'fas fa-pen' }
];

const normalizarItems = (result) => {
    const data = result?.data || result || {};
    const items = Array.isArray(data.items)
        ? data.items
        : (Array.isArray(data) ? data : []);
    return items;
};

const promedioDe = (items) => {
    if (!items.length) return 0;
    const suma = items.reduce((acc, r) => acc + (Number(r.calificacion) || 0), 0);
    return suma / items.length;
};

function MisResenas() {
    useSEO('Mis reseñas', 'Las reseñas que recibiste y las que escribiste en AlquilER.', { noindex: true });

    const { usuario, token } = useAuth();

    const [pestana, setPestana] = useState('recibidas');
    const [recibidas, setRecibidas] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [escritas, setEscritas] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarDatos = useCallback(async () => {
        if (!usuario || !token) return;
        setLoading(true);
        try {
            const [resRecibidas, resPropiedades, resEscritas] = await Promise.all([
                getResenasByUsuario(usuario.id, token),
                getMisResenasPropiedades(token),
                getResenasByCalificador(usuario.id, token)
            ]);
            setRecibidas(normalizarItems(resRecibidas));
            setPropiedades(normalizarItems(resPropiedades));
            setEscritas(normalizarItems(resEscritas));
        } catch (error) {
            console.error('Error cargando reseñas:', error);
            setRecibidas([]);
            setPropiedades([]);
            setEscritas([]);
        } finally {
            setLoading(false);
        }
    }, [usuario, token]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const renderEstrellas = (n) => {
        const valor = Math.round(Number(n) || 0);
        return [...Array(5)].map((_, i) => (
            <Icon
                key={i}
                name={`fas fa-star ${i < valor ? 'estrella-llena' : ''}`}
                style={{ color: i < valor ? '#f59e0b' : 'var(--gray-400)', fontSize: 16, marginRight: 2 }}
            />
        ));
    };

    const itemsPorPestana = {
        recibidas,
        propiedades,
        escritas
    };

    const items = itemsPorPestana[pestana] || [];
    const promedio = promedioDe(items);

    if (loading) return <Loader />;

    const textoVacio = {
        recibidas: {
            titulo: 'Todavía no recibiste reseñas como inquilino',
            descripcion: 'Cuando el propietario de un alquiler finalizado te califique, la vas a ver acá.'
        },
        propiedades: {
            titulo: 'Todavía no hay reseñas de tus propiedades',
            descripcion: 'Cuando un inquilino califique una de tus propiedades, la vas a ver acá.'
        },
        escritas: {
            titulo: 'Todavía no escribiste reseñas',
            descripcion: 'Después de una reserva finalizada vas a poder calificar la propiedad y al propietario.'
        }
    }[pestana];

    return (
        <div className="misresenas-page">
            <div className="container">

                {/* HERO */}
                <section className="fav-hero">
                    <div className="fav-hero-content">
                        <span className="fav-hero-badge">
                            <Icon name="fas fa-star" style={{ color: '#f59e0b' }} /> Reputación
                        </span>
                        <h1>
                            Mis <span>reseñas</span>
                        </h1>
                        <p>
                            Revisá las reseñas que recibiste y las que escribiste a lo largo de tus alquileres.
                        </p>
                    </div>
                    <div className="fav-hero-icon">
                        <Icon name="fas fa-star" style={{ color: '#f59e0b' }} />
                    </div>
                </section>

                {/* PESTAÑAS */}
                <div className="misresenas-tabs" role="tablist">
                    {PESTANAS.map(tab => {
                        const cantidad = (itemsPorPestana[tab.clave] || []).length;
                        return (
                            <button
                                key={tab.clave}
                                type="button"
                                role="tab"
                                aria-selected={pestana === tab.clave}
                                className={`misresenas-tab ${pestana === tab.clave ? 'active' : ''}`}
                                onClick={() => setPestana(tab.clave)}
                            >
                                <Icon name={tab.icono} /> {tab.label}
                                {cantidad > 0 && <span className="misresenas-tab-count">{cantidad}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* RESUMEN */}
                {items.length > 0 && (
                    <div className="misresenas-resumen">
                        <div className="misresenas-resumen-num">
                            {promedio.toFixed(1)}
                        </div>
                        <div className="misresenas-resumen-info">
                            <span className="resenas-estrellas">{renderEstrellas(promedio)}</span>
                            <span className="misresenas-resumen-total">
                                {items.length} {items.length === 1 ? 'reseña' : 'reseñas'}
                            </span>
                        </div>
                    </div>
                )}

                {/* LISTA */}
                {items.length > 0 ? (
                    <div className="resenas-lista misresenas-lista">
                        {items.map(r => {
                            const prop = r.reserva?.propiedad;
                            return (
                                <article className="resena-item" key={r.id}>
                                    <div className="resena-item-top">
                                        <span className="resena-autor">
                                            <Icon name="fas fa-user" />{' '}
                                            {r.calificador
                                                ? `${r.calificador.nombre} ${r.calificador.apellido || ''}`.trim()
                                                : `Usuario #${r.calificador_id}`}
                                        </span>
                                        <span className="resenas-estrellas">{renderEstrellas(r.calificacion)}</span>
                                    </div>

                                    {prop && (
                                        <Link
                                            to={`/propiedades/${prop.id}`}
                                            className="misresenas-propiedad"
                                        >
                                            <Icon name="fas fa-building" /> {prop.titulo || `Propiedad #${prop.id}`}
                                        </Link>
                                    )}

                                    {r.fecha_publicacion && (
                                        <p className="resena-fecha">
                                            <Icon name="far fa-calendar-alt" />{' '}
                                            {String(r.fecha_publicacion).slice(0, 10)}
                                        </p>
                                    )}
                                    {r.comentario && (
                                        <p className="resena-comentario">{r.comentario}</p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icono="fa-star"
                        titulo={textoVacio.titulo}
                        descripcion={textoVacio.descripcion}
                        action={
                            <Link to="/reservas" className="btn-ver-todas" style={{ marginTop: '20px', display: 'inline-block' }}>
                                <Icon name="fas fa-calendar-check" /> Ver mis reservas
                            </Link>
                        }
                    />
                )}

            </div>
        </div>
    );
}

export default MisResenas;
