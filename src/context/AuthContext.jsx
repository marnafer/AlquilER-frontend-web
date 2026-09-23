// Este archivo maneja la autenticación en toda la app.
// Es como un "centro de control" que sabe si el usuario está logueado o no.

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getPerfil, logout as apiLogout } from '../services/api';

// Creo el contexto que van a usar todos los componentes
export const AuthContext = createContext();

// Decodifica el payload de un JWT sin necesidad de librerías.
const decodificarJwt = (jwt) => {
    try {
        let parte = jwt.split('.')[1];
        parte = parte.replace(/-/g, '+').replace(/_/g, '/');
        parte = parte.padEnd(parte.length + ((4 - (parte.length % 4)) % 4), '=');
        return JSON.parse(atob(parte));
    } catch (error) {
        return null;
    }
};

// Usuario mínimo reconstruido desde los claims del JWT (sub, email, rol_id).
// Se usa como respaldo cuando el backend falla al traer el perfil (ej: 500).
const usuarioDesdeJwt = (jwt) => {
    const payload = decodificarJwt(jwt);
    if (!payload || !payload.sub) return null;
    const rolId = Number(payload.rol_id);
    return {
        id: Number(payload.sub),
        email: payload.email || '',
        rol_id: rolId === 2 ? 2 : 1,
        rol: rolId === 2 ? 'administrador' : 'usuario'
    };
};

// El backend expone rol como objeto {id, nombre}; lo dejamos como string
// para que Perfil.jsx (usuario.rol === 'administrador') funcione igual.
const normalizarUsuario = (usuario) => {
    if (!usuario) return null;
    const rolNombre = typeof usuario.rol === 'string' ? usuario.rol : usuario.rol?.nombre;
    return {
        ...usuario,
        rol: rolNombre === 'administrador' ? 'administrador' : 'usuario',
        rol_id: usuario.rol_id ?? usuario.rol?.id ?? 1
    };
};

// Este es el "proveedor" que envuelve toda la aplicación
export function AuthProvider({ children }) {
    // El token lo guardo en localStorage para que no se pierda al recargar
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);
    // Acá guardo los datos del usuario (nombre, email, etc)
    const [usuario, setUsuario] = useState(null);
    // Estado para saber si está cargando la info del usuario
    const [loading, setLoading] = useState(true);

    // Cada vez que cambia el token, traigo los datos del usuario
    useEffect(() => {
        const cargarUsuario = async () => {
            const respaldo = usuarioDesdeJwt(token);
            try {
                const response = await getPerfil(token);
                if (response.success && response.data) {
                    setUsuario(normalizarUsuario(response.data));
                } else if (response.status === 401) {
                    // Token inválido o expirado: la sesión realmente no es válida.
                    localStorage.removeItem('token');
                    setToken(null);
                    setUsuario(null);
                } else {
                    // Error del servidor (ej: /usuarios/me con 500) o de red:
                    // no cerramos la sesión, usamos los datos mínimos del JWT.
                    setUsuario(respaldo);
                }
            } catch (error) {
                setUsuario(respaldo);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            cargarUsuario();
        } else {
            setLoading(false);
        }
    }, [token]);

    // El interceptor de api.js renueva el token con el refresh_token; acá
    // sincronizamos el contexto y, si la sesión expira de verdad, cerramos sesión.
    useEffect(() => {
        const alRefrescarToken = () => {
            const nuevoToken = localStorage.getItem('token');
            const nuevoRefreshToken = localStorage.getItem('refresh_token');
            if (nuevoToken) setToken(nuevoToken);
            if (nuevoRefreshToken) setRefreshToken(nuevoRefreshToken);
        };
        const alExpirarSesion = () => {
            logout();
        };

        window.addEventListener('auth:token-refreshed', alRefrescarToken);
        window.addEventListener('auth:session-expired', alExpirarSesion);
        return () => {
            window.removeEventListener('auth:token-refreshed', alRefrescarToken);
            window.removeEventListener('auth:session-expired', alExpirarSesion);
        };
    }, []);

    // Función para iniciar sesión: guardo el token
    const login = (nuevoToken, nuevoRefreshToken) => {
        localStorage.setItem('token', nuevoToken);
        if (nuevoRefreshToken) {
            localStorage.setItem('refresh_token', nuevoRefreshToken);
            setRefreshToken(nuevoRefreshToken);
        }
        setToken(nuevoToken);
    };

    // Función para cerrar sesión: avisamos al backend y limpiamos todo
    const logout = () => {
        if (token) {
            apiLogout(token, refreshToken).catch(() => {});
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setRefreshToken(null);
        setUsuario(null);
    };

    // Función para refrescar los datos del usuario sin recargar la página
    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const response = await getPerfil(token);
            if (response.success && response.data) {
                setUsuario(normalizarUsuario(response.data));
            } else if (response.status !== 401) {
                setUsuario(usuarioDesdeJwt(token));
            }
        } catch (error) {
            console.error('Error al refrescar usuario:', error);
        }
    }, [token]);

    // Esto es lo que pueden usar los componentes
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