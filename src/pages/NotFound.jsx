// Esta página se muestra cuando el usuario entra a una ruta que no existe.
// Es la clásica página de error 404.

import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h1 style={{ 
                fontSize: '72px', 
                fontWeight: '800', 
                color: '#CBD5E1',
                marginBottom: '16px'
            }}>
                404
            </h1>
            <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#0F172A',
                marginBottom: '12px'
            }}>
                ¡Ups! Página no encontrada
            </h2>
            <p style={{ 
                fontSize: '16px', 
                color: '#64748B',
                marginBottom: '32px'
            }}>
                La página que estás buscando no existe o fue movida.
            </p>
            <Link 
                to="/" 
                style={{ 
                    display: 'inline-block',
                    padding: '12px 32px',
                    background: '#1D4ED8',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#1E40AF';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#1D4ED8';
                }}
            >
                Volver al inicio
            </Link>
        </div>
    );
}

export default NotFound;
