// Enrutador principal de la aplicación
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Hook personalizado para autenticación
import { useAuth } from './hooks/useAuth';
// Componentes comunes
import Header from './components/Header';
import Footer from './components/Footer';
import PropiedadDetalle from './components/PropiedadDetalle';
// Páginas de la aplicación
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Propiedades from './pages/Propiedades';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

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

function AppRouter() {
    return (
        <>
            {/* Header se muestra en todas las páginas */}
            <Header />
            <main className="main">
                <Routes>
                    {/* ===== RUTAS PÚBLICAS ===== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/propiedades" element={<Propiedades />} />
                    <Route path="/propiedades/:id" element={<PropiedadDetalle />} />

                    {/* ===== RUTAS PARA INVITADOS (no logueados) ===== */}
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

                    {/* ===== RUTAS PROTEGIDAS (requieren autenticación) ===== */}
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

                    {/* ===== RUTA 404 - siempre al final ===== */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            {/* Footer se muestra en todas las páginas */}
            <Footer />
        </>
    );
}

export default AppRouter;