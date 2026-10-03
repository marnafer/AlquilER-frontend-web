// Enrutador principal de la aplicación
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Hook personalizado para autenticación
import { useAuth } from './hooks/useAuth';
// Componentes del shell: se cargan siempre, no se parten
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
// Páginas implementadas: cada una viaja en su propio chunk
const Home = lazy(() => import('./pages/Home'));
const Contacto = lazy(() => import('./pages/Contacto'));
const PreguntasFrecuentes = lazy(() => import('./pages/PreguntasFrecuentes'));
const Servicios = lazy(() => import('./pages/Servicios'));
const Terminos = lazy(() => import('./pages/Terminos'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RecuperarContrasena = lazy(() => import('./pages/RecuperarContrasena'));
const RestablecerContrasena = lazy(() => import('./pages/RestablecerContrasena'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Propiedades = lazy(() => import('./pages/Propiedades'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Favoritos = lazy(() => import('./pages/Favoritos'));
const MisPropiedades = lazy(() => import('./pages/MisPropiedades'));
const MisReservas = lazy(() => import('./pages/MisReservas'));
const MisConsultas = lazy(() => import('./pages/MisConsultas'));
const Notificaciones = lazy(() => import('./pages/Notificaciones'));
const PropiedadForm = lazy(() => import('./pages/PropiedadForm'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PropiedadDetalle = lazy(() => import('./components/PropiedadDetalle'));
// Páginas de administración
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const UsuariosAdmin = lazy(() => import('./pages/admin/UsuariosAdmin'));
const CategoriasAdmin = lazy(() => import('./pages/admin/CategoriasAdmin'));
const ProvinciasAdmin = lazy(() => import('./pages/admin/ProvinciasAdmin'));
const LocalidadesAdmin = lazy(() => import('./pages/admin/LocalidadesAdmin'));
const RolesAdmin = lazy(() => import('./pages/admin/RolesAdmin'));
const ServiciosAdmin = lazy(() => import('./pages/admin/ServiciosAdmin'));
const ResenasAdmin = lazy(() => import('./pages/admin/ResenasAdmin'));
const ReservasAdmin = lazy(() => import('./pages/admin/ReservasAdmin'));
const ConsultasAdmin = lazy(() => import('./pages/admin/ConsultasAdmin'));
const LogsAdmin = lazy(() => import('./pages/admin/LogsAdmin'));
const PropiedadesAdmin = lazy(() => import('./pages/admin/PropiedadesAdmin'));

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
                <Suspense fallback={<Loader />}>
                <Routes>
                    {/* ============================================
                        RUTAS PÚBLICAS
                       ============================================ */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/propiedades" element={<Propiedades />} />
                    <Route path="/servicios" element={<Servicios />} />
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
                        path="/recuperar-contrasena"
                        element={
                            <GuestRoute>
                                <RecuperarContrasena />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/restablecer-contrasena"
                        element={
                            <GuestRoute>
                                <RestablecerContrasena />
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
                        path="/notificaciones"
                        element={
                            <PrivateRoute>
                                <Notificaciones />
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
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

export default AppRouter;