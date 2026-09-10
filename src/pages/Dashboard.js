import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPropiedades, getReservas, getFavoritos } from '../services/api';
import Loader from '../components/Loader';

function Dashboard() {
    const { token, usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        propiedades: 0,
        reservas: 0,
        favoritos: 0
    });
    const [reservasRecientes, setReservasRecientes] = useState([]);

    const cargarDatos = useCallback(async () => {
        try {
            const [propRes, reservasRes, favoritosRes] = await Promise.all([
                getPropiedades(),
                getReservas(token),
                getFavoritos(token)
            ]);

            const props = propRes.data || propRes || [];
            const reservas = reservasRes.data || reservasRes || [];
            const favoritos = favoritosRes.data || favoritosRes || [];

            setStats({
                propiedades: props.length,
                reservas: reservas.length,
                favoritos: favoritos.length
            });

            setReservasRecientes(reservas.slice(0, 3));
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

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Bienvenido, {usuario?.nombre || 'Usuario'}</p>
            </div>

            {/* Estadísticas */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <span className="stat-icon">🏠</span>
                    <div>
                        <span className="stat-number">{stats.propiedades}</span>
                        <span className="stat-label">Propiedades</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <div>
                        <span className="stat-number">{stats.reservas}</span>
                        <span className="stat-label">Reservas</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">❤️</span>
                    <div>
                        <span className="stat-number">{stats.favoritos}</span>
                        <span className="stat-label">Favoritos</span>
                    </div>
                </div>
            </div>

            {/* Acciones rápidas y reservas recientes */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Acciones rápidas</h3>
                    <div className="actions-list">
                        <Link to="/propiedades/crear" className="action-btn primary">
                            + Publicar propiedad
                        </Link>
                        <Link to="/propiedades" className="action-btn">
                            🔍 Buscar propiedades
                        </Link>
                        <Link to="/perfil" className="action-btn">
                            👤 Mi perfil
                        </Link>
                        <Link to="/favoritos" className="action-btn">
                            ❤️ Mis favoritos
                        </Link>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Últimas reservas</h3>
                    {reservasRecientes.length > 0 ? (
                        <ul className="reservas-list">
                            {reservasRecientes.map((reserva) => (
                                <li key={reserva.id} className="reserva-item">
                                    <div>
                                        <span className="reserva-titulo">
                                            {reserva.propiedad_titulo || 'Propiedad'}
                                        </span>
                                        <span className="reserva-fecha">
                                            {reserva.fecha_desde} → {reserva.fecha_hasta}
                                        </span>
                                    </div>
                                    <span className={`reserva-estado ${reserva.estado || 'pendiente'}`}>
                                        {reserva.estado || 'Pendiente'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-message">No tenés reservas aún</p>
                    )}
                    <Link to="/reservas" className="ver-todas">Ver todas las reservas</Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;