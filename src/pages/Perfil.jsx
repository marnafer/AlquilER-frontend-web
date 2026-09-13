// Esta es la página de perfil del usuario.
// Muestra los datos personales y permite ver el dashboard o favoritos.

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';

function Perfil() {
    const { usuario, loading } = useAuth();
    if (loading) return <Loader />;

    return (
        <div className="perfil-container">
            <div className="perfil-avatar">
                {usuario?.nombre ? usuario.nombre[0].toUpperCase() : 'U'}
            </div>

            <h1>Mi Perfil</h1>
            <p className="subtitle">Estos son tus datos personales</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <strong>Nombre completo:</strong> {usuario?.nombre} {usuario?.apellido}
                </div>
                <div>
                    <strong>Correo electrónico:</strong> {usuario?.email}
                </div>
                <div>
                    <strong>Teléfono:</strong> {usuario?.telefono || 'No especificado'}
                </div>
                <div>
                    <strong>Rol:</strong> {usuario?.rol === 'propietario' ? 'Propietario' : 'Inquilino'}
                </div>
                <div>
                    <strong>Miembro desde:</strong> {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString() : 'N/A'}
                </div>
            </div>

            <div className="perfil-actions">
                <Link to="/dashboard">📊 Dashboard</Link>
                <Link to="/favoritos">❤️ Favoritos</Link>
            </div>
        </div>
    );
}

export default Perfil;
