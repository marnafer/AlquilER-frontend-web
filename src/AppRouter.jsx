// Enrutador principal de la aplicación
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Hook personalizado para autenticación
import { useAuth } from './hooks/useAuth';
// Componentes comunes
import Header from './components/Header';
import Footer from './components/Footer';
import PropiedadDetalle from './components/PropiedadDetalle';
// Páginas implementadas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Propiedades from './pages/Propiedades';
import Dashboard from './pages/Dashboard';
import Favoritos from './pages/Favoritos';
import MisPropiedades from './pages/MisPropiedades';
import MisReservas from './pages/MisReservas';
import MisConsultas from './pages/MisConsultas';
import PropiedadForm from './pages/PropiedadForm';
import NotFound from './pages/NotFound';

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Componente para proteger rutas que requieren autenticación
function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Componente para rutas solo de invitados (no logueados)
function GuestRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRouter() {
    return (
        <>
            <Header />
            <main className="main">
                <Routes>
                    {/* ============================================
                        RUTAS PÚBLICAS
                       ============================================ */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/propiedades" element={<Propiedades />} />

                    {/* ============================================
                        RUTAS ESPECÍFICAS DE PROPIEDADES
                        ⚠️ IMPORTANTE: van ANTES de /propiedades/:id
                       ============================================ */}

                    {/* Crear propiedad (cualquier usuario) */}
                    <Route
                        path="/propiedades/crear"
                        element={
                            <PrivateRoute>
                                <PropiedadForm />
                            </PrivateRoute>
                        }
                    />

                    {/* Editar propiedad (cualquier usuario) */}
                    <Route
                        path="/propiedades/:id/editar"
                        element={
                            <PrivateRoute>
                                <PropiedadForm />
                            </PrivateRoute>
                        }
                    />

                    {/* ============================================
                        DETALLE DE PROPIEDAD (ruta dinámica)
                        ⚠️ SIEMPRE AL FINAL de las rutas de /propiedades
                       ============================================ */}
                    <Route path="/propiedades/:id" element={<PropiedadDetalle />} />

                    {/* ============================================
                        RUTAS PARA INVITADOS (no logueados)
                       ============================================ */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />

                    {/* ============================================
                        RUTAS PROTEGIDAS (requieren autenticación)
                       ============================================ */}

                    <Route
                        path="/perfil"
                        element={
                            <PrivateRoute>
                                <Perfil />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/favoritos"
                        element={
                            <PrivateRoute>
                                <Favoritos />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/reservas"
                        element={
                            <PrivateRoute>
                                <MisReservas />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/consultas"
                        element={
                            <PrivateRoute>
                                <MisConsultas />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/mis-propiedades"
                        element={
                            <PrivateRoute>
                                <MisPropiedades />
                            </PrivateRoute>
                        }
                    />

                    {/* ============================================
                        RUTA 404 - siempre al final
                       ============================================ */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default AppRouter;