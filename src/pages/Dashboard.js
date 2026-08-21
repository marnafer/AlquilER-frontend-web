// Esta es la página de Dashboard (panel del usuario).
// Muestra estadísticas y acciones rápidas.

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPropiedades, getReservas, getFavoritos } from '../services/api';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

function Dashboard() {
    const { token, usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        propiedades: 0,
        reservas: 0,
        favoritos: 0
    });

    const cargarDatos = useCallback(async () => {
        try {
            // Cargar todo en paralelo
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
        <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                📊 Dashboard
            </h1>
            <p style={{ color: '#475569', marginBottom: '32px' }}>
                Bienvenido, {usuario?.nombre || 'Usuario'} 👋
            </p>

            {/* Estadísticas */}
            <div className="dashboard-stats">
                <div className="dashboard-stat">
                    <div className="icon">🏠</div>
                    <div className="number">{stats.propiedades}</div>
                    <div className="label">Propiedades</div>
                </div>
                <div className="dashboard-stat">
                    <div className="icon">📅</div>
                    <div className="number">{stats.reservas}</div>
                    <div className="label">Reservas</div>
                </div>
                <div className="dashboard-stat">
                    <div className="icon">❤️</div>
                    <div className="number">{stats.favoritos}</div>
                    <div className="label">Favoritos</div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>⚡ Acciones rápidas</h3>
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

                <div className="dashboard-card">
                    <h3>📋 Últimas reservas</h3>
                    <p style={{ color: '#94A3B8', fontSize: '14px' }}>No tenés reservas aún.</p>
                    <Link to="/propiedades" className="action-btn" style={{ marginTop: '12px' }}>
                        Explorar propiedades
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
