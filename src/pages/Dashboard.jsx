import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMisPropiedades, getReservas, getFavoritos, getConsultas } from '../services/api';
import Loader from '../components/Loader';

function Dashboard() {
    const { token, usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        propiedades: 0,
        reservas: 0,
        favoritos: 0,
        consultas: 0
    });
    const [reservasRecientes, setReservasRecientes] = useState([]);

    const cargarDatos = useCallback(async () => {
        try {
            const [propRes, reservasRes, favoritosRes, consultasRes] = await Promise.all([
                getMisPropiedades(token),
                getReservas(token),
                getFavoritos(token),
                getConsultas(token)
            ]);

            const props = propRes?.data?.items || propRes?.data || propRes || [];
            const reservas = reservasRes?.data?.items || reservasRes?.data || reservasRes || [];
            const favoritos = favoritosRes?.data?.items || favoritosRes?.data || favoritosRes || [];
            const consultas = consultasRes?.data?.items || consultasRes?.data || consultasRes || [];

            setStats({
                propiedades: Array.isArray(props) ? props.length : 0,
                reservas: Array.isArray(reservas) ? reservas.length : 0,
                favoritos: Array.isArray(favoritos) ? favoritos.length : 0,
                consultas: Array.isArray(consultas) ? consultas.length : 0
            });

            setReservasRecientes(
                Array.isArray(reservas) ? reservas.slice(0, 4) : []
            );
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    if (loading) return <Loader />;

    const inicial = (usuario?.nombre?.[0] || 'U').toUpperCase();

    return (
        <div className="dashboard-page">
            <div className="container">

                {/* HERO / BIENVENIDA */}
                <section className="dash-hero">
                    <div className="dash-hero-content">
                        <div className="dash-avatar">{inicial}</div>
                        <div className="dash-hero-text">
                            <span className="dash-hero-badge">
                                <i className="fas fa-bolt"></i> Panel de control
                            </span>
                            <h1>
                                Hola, <span>{usuario?.nombre || 'Usuario'}</span> 👋
                            </h1>
                            <p>
                                Este es tu resumen de actividad en AlquilER.
                                Publicá propiedades, gestioná tus reservas y tus favoritos.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ESTADÍSTICAS */}
                <section className="dash-stats">
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon teal">
                            <i className="fas fa-building"></i>
                        </div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-number">{stats.propiedades}</span>
                            <span className="dash-stat-label">Propiedades</span>
                        </div>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon emerald">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-number">{stats.reservas}</span>
                            <span className="dash-stat-label">Reservas</span>
                        </div>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon rose">
                            <i className="fas fa-heart"></i>
                        </div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-number">{stats.favoritos}</span>
                            <span className="dash-stat-label">Favoritos</span>
                        </div>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon amber">
                            <i className="fas fa-comments"></i>
                        </div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-number">{stats.consultas}</span>
                            <span className="dash-stat-label">Consultas</span>
                        </div>
                    </div>
                </section>

                {/* GRID PRINCIPAL */}
                <section className="dash-grid">

                    {/* ACCIONES RÁPIDAS */}
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <h3>
                                <i className="fas fa-rocket"></i> Acciones rápidas
                            </h3>
                        </div>
                        <div className="dash-actions">
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
                            <Link to="/perfil" className="dash-action">
                                <span className="dash-action-icon">
                                    <i className="fas fa-user-edit"></i>
                                </span>
                                <div className="dash-action-text">
                                    <strong>Mi perfil</strong>
                                    <small>Actualizá tus datos</small>
                                </div>
                                <i className="fas fa-chevron-right dash-action-arrow"></i>
                            </Link>
                        </div>
                    </div>

                    {/* ÚLTIMAS RESERVAS */}
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <h3>
                                <i className="fas fa-calendar-alt"></i> Últimas reservas
                            </h3>
                            {reservasRecientes.length > 0 && (
                                <Link to="/reservas" className="dash-card-link">
                                    Ver todas <i className="fas fa-arrow-right"></i>
                                </Link>
                            )}
                        </div>

                        {reservasRecientes.length > 0 ? (
                            <ul className="dash-reservas">
                                {reservasRecientes.map((reserva) => {
                                    const estado = (reserva.estado || 'pendiente').toLowerCase();
                                    return (
                                        <li key={reserva.id} className="dash-reserva-item">
                                            <div className="dash-reserva-icon">
                                                <i className="fas fa-home"></i>
                                            </div>
                                            <div className="dash-reserva-info">
                                                <strong>{reserva.propiedad?.titulo || 'Propiedad'}</strong>
                                                <span>
                                                    <i className="far fa-calendar"></i>{' '}
                                                    {(reserva.fecha_inicio_alquiler || '').slice(0, 10) || '—'} → {(reserva.fecha_fin_alquiler || '').slice(0, 10) || '—'}
                                                </span>
                                            </div>
                                            <span className={`dash-reserva-badge ${estado}`}>
                                                {estado}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="dash-empty">
                                <div className="dash-empty-icon">
                                    <i className="fas fa-calendar-times"></i>
                                </div>
                                <p>No tenés reservas aún</p>
                                <Link to="/propiedades" className="dash-empty-btn">
                                    Explorar propiedades
                                </Link>
                            </div>
                        )}
                    </div>

                </section>

            </div>
        </div>
    );
}

export default Dashboard;