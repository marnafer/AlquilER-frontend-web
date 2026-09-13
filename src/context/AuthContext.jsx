// Este archivo maneja la autenticación en toda la app.
// Es como un "centro de control" que sabe si el usuario está logueado o no.

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getPerfil } from '../services/api';

// Creo el contexto que van a usar todos los componentes
export const AuthContext = createContext();

// Este es el "proveedor" que envuelve toda la aplicación
export function AuthProvider({ children }) {
    // El token lo guardo en localStorage para que no se pierda al recargar
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    // Acá guardo los datos del usuario (nombre, email, etc)
    const [usuario, setUsuario] = useState(null);
    // Estado para saber si está cargando la info del usuario
    const [loading, setLoading] = useState(true);

    // Cada vez que cambia el token, traigo los datos del usuario
    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const response = await getPerfil(token);
                if (response.success) {
                    setUsuario(response.data);
                } else {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUsuario(null);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setToken(null);
                setUsuario(null);
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

    // Función para iniciar sesión: guardo el token
    const login = (nuevoToken) => {
        localStorage.setItem('token', nuevoToken);
        setToken(nuevoToken);
    };

    // Función para cerrar sesión: limpio todo
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    };

    // Función para refrescar los datos del usuario sin recargar la página
    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const response = await getPerfil(token);
            if (response.success) {
                setUsuario(response.data);
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