// Este archivo maneja la autenticación en toda la app.
// Las credenciales viven en cookies HttpOnly administradas por el backend.

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getPerfil, logout as apiLogout } from '../services/api';

export const AuthContext = createContext();

const SESION_CON_COOKIE = 'cookie-session';

const normalizarUsuario = (usuario) => {
    if (!usuario) return null;
    const rolNombre = typeof usuario.rol === 'string' ? usuario.rol : usuario.rol?.nombre;
    return {
        ...usuario,
        rol: rolNombre === 'administrador' ? 'administrador' : 'usuario',
        rol_id: usuario.rol_id ?? usuario.rol?.id ?? 1
    };
};

export function AuthProvider({ children }) {
    const [token, setToken] = useState(SESION_CON_COOKIE);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Elimina credenciales guardadas por versiones anteriores con localStorage.
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        let activo = true;
        setLoading(true);

        const cargarUsuario = async () => {
            try {
                const response = await getPerfil(token);
                if (!activo) return;

                if (response.success && response.data) {
                    setUsuario(normalizarUsuario(response.data));
                } else if (response.status === 401) {
                    setToken(null);
                    setUsuario(null);
                } else {
                    setUsuario(null);
                }
            } catch (error) {
                if (activo) {
                    console.error('Error al cargar el usuario autenticado:', error);
                    setUsuario(null);
                }
            } finally {
                if (activo) setLoading(false);
            }
        };

        cargarUsuario();
        return () => {
            activo = false;
        };
    }, [token]);

    useEffect(() => {
        const alExpirarSesion = () => {
            logout();
        };

        window.addEventListener('auth:session-expired', alExpirarSesion);
        return () => {
            window.removeEventListener('auth:session-expired', alExpirarSesion);
        };
    }, []);

    const login = () => {
        setUsuario(null);
        setToken(SESION_CON_COOKIE);
    };

    const logout = () => {
        apiLogout().catch((error) => {
            console.error('Error al cerrar la sesión en el servidor:', error);
        });
        setToken(null);
        setUsuario(null);
        setLoading(false);
    };

    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const response = await getPerfil(token);
            if (response.success && response.data) {
                setUsuario(normalizarUsuario(response.data));
            } else if (response.status === 401) {
                setToken(null);
                setUsuario(null);
            }
        } catch (error) {
            console.error('Error al refrescar usuario:', error);
        }
    }, [token]);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{
            token,
            usuario,
            loading,
            login,
            logout,
            isAuthenticated,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}
