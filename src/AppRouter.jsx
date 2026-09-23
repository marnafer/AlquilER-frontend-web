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
import Contacto from './pages/Contacto';
import PreguntasFrecuentes from './pages/PreguntasFrecuentes';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
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
// Páginas de administración
import AdminHome from './pages/admin/AdminHome';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import CategoriasAdmin from './pages/admin/CategoriasAdmin';
import ProvinciasAdmin from './pages/admin/ProvinciasAdmin';
import LocalidadesAdmin from './pages/admin/LocalidadesAdmin';
import RolesAdmin from './pages/admin/RolesAdmin';
import ServiciosAdmin from './pages/admin/ServiciosAdmin';
import ResenasAdmin from './pages/admin/ResenasAdmin';
import ReservasAdmin from './pages/admin/ReservasAdmin';
import ConsultasAdmin from './pages/admin/ConsultasAdmin';
import LogsAdmin from './pages/admin/LogsAdmin';
import PropiedadesAdmin from './pages/admin/PropiedadesAdmin';

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

// Componente para rutas de administración (logueado y rol admin)
function AdminRoute({ children }) {
    const { isAuthenticated, loading, usuario } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return Number(usuario?.rol_id) === 2 ? children : <Navigate to="/" replace />;
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
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
                    <Route path="/terminos" element={<Terminos />} />
                    <Route path="/privacidad" element={<Privacidad />} />

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
                        RUTAS DE ADMINISTRACIÓN (solo rol admin)
                       ============================================ */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminHome />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios"
                        element={
                            <AdminRoute>
                                <UsuariosAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/categorias"
                        element={
                            <AdminRoute>
                                <CategoriasAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/provincias"
                        element={
                            <AdminRoute>
                                <ProvinciasAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/localidades"
                        element={
                            <AdminRoute>
                                <LocalidadesAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/roles"
                        element={
                            <AdminRoute>
                                <RolesAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/servicios"
                        element={
                            <AdminRoute>
                                <ServiciosAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/resenas"
                        element={
                            <AdminRoute>
                                <ResenasAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/reservas"
                        element={
                            <AdminRoute>
                                <ReservasAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/consultas"
                        element={
                            <AdminRoute>
                                <ConsultasAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/logs"
                        element={
                            <AdminRoute>
                                <LogsAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/propiedades"
                        element={
                            <AdminRoute>
                                <PropiedadesAdmin />
                            </AdminRoute>
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