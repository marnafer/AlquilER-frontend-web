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
import PropiedadForm from './pages/PropiedadForm';
import NotFound from './pages/NotFound';

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Componente para proteger rutas que requieren autenticación
function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    // Mientras carga el perfil, no redirigimos (evita flash de redirect)
    if (loading) return null;
    // Si no está autenticado, redirige al login
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Componente para rutas solo de invitados (no logueados)
function GuestRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    // Si está autenticado, redirige al home
    return !isAuthenticated ? children : <Navigate to="/" replace />;
}

// Componente para rutas exclusivas de propietarios (y admins)
function OwnerRoute({ children }) {
    const { isAuthenticated, loading, usuario } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (usuario?.rol !== 'propietario' && usuario?.rol !== 'administrador') {
        return <Navigate to="/" replace />;
    }
    return children;
}

function AppRouter() {
    return (
        <>
            {/* Header se muestra en todas las páginas */}
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
                        para que React Router no las confunda
                       ============================================ */}

                    {/* Crear propiedad (solo propietarios) */}
                    <Route
                        path="/propiedades/crear"
                        element={
                            <OwnerRoute>
                                <PropiedadForm />
                            </OwnerRoute>
                        }
                    />

                    {/* Editar propiedad (solo propietarios) */}
                    <Route
                        path="/propiedades/editar/:id"
                        element={
                            <OwnerRoute>
                                <PropiedadForm />
                            </OwnerRoute>
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

                    {/* Perfil y Dashboard */}
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

                    {/* Favoritos */}
                    <Route
                        path="/favoritos"
                        element={
                            <PrivateRoute>
                                <Favoritos />
                            </PrivateRoute>
                        }
                    />

                    {/* Mis propiedades (solo propietarios) */}
                    <Route
                        path="/mis-propiedades"
                        element={
                            <OwnerRoute>
                                <MisPropiedades />
                            </OwnerRoute>
                        }
                    />

                    {/* ============================================
                        RUTA 404 - siempre al final
                       ============================================ */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            {/* Footer se muestra en todas las páginas */}
            <Footer />
        </>
    );
}

export default AppRouter;