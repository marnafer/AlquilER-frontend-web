import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import {
    getNotificaciones,
    getNotificacionesNoLeidas,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas
} from '../services/api';

function Header() {
    const { isAuthenticated, logout, usuario, token } = useAuth();
    const { showToast } = useUI();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const esUsuario = Number(usuario?.rol_id) === 1;

    // ===== Notificaciones (solo rol usuario) =====
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [verDropdown, setVerDropdown] = useState(false);
    const [cargandoNotif, setCargandoNotif] = useState(false);
    const dropdownRef = useRef(null);
    const ultimasNoLeidas = useRef(0);

    const cargarConteo = useCallback(async () => {
        if (!esUsuario || !token) return;
        try {
            const result = await getNotificacionesNoLeidas(token);
            const actuales = Number(result?.data?.no_leidas) || 0;
            setNoLeidas(actuales);
            if (actuales > ultimasNoLeidas.current && actuales > 0) {
                showToast('Tienes notificaciones nuevas', 'info');
            }
            ultimasNoLeidas.current = actuales;
        } catch (error) {
            // Silencioso: el polling no debe molestar
        }
    }, [esUsuario, token, showToast]);

    const cargarLista = useCallback(async () => {
        if (!esUsuario || !token) return;
        setCargandoNotif(true);
        try {
            const result = await getNotificaciones(token);
            if (result.success && result.data) {
                setNotificaciones(result.data.items || []);
                const actuales = Number(result.data.no_leidas) || 0;
                setNoLeidas(actuales);
                ultimasNoLeidas.current = actuales;
            }
        } catch (error) {
            // Silencioso
        } finally {
            setCargandoNotif(false);
        }
    }, [esUsuario, token]);

    useEffect(() => {
        if (esUsuario && token) {
            ultimasNoLeidas.current = 0;
            cargarConteo();
            const intervalo = setInterval(cargarConteo, 30000);
            return () => clearInterval(intervalo);
        }
        setNotificaciones([]);
        setNoLeidas(0);
        ultimasNoLeidas.current = 0;
    }, [esUsuario, token, cargarConteo]);

    // Cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const alClicFuera = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setVerDropdown(false);
            }
        };
        document.addEventListener('mousedown', alClicFuera);
        return () => document.removeEventListener('mousedown', alClicFuera);
    }, []);

    const alMarcarLeida = async (id) => {
        const result = await marcarNotificacionLeida(id, token);
        if (result.success) {
            setNotificaciones(prev =>
                prev.map(n =>
                    n.id === id ? { ...n, leida: true } : n
                )
            );
            setNoLeidas(prev => Math.max(0, prev - 1));
        }
    };

    const alMarcarTodasLeidas = async () => {
        const result = await marcarTodasNotificacionesLeidas(token);
        if (result.success) {
            setNotificaciones(prev =>
                prev.map(n => ({ ...n, leida: true }))
            );
            setNoLeidas(0);
            showToast('Todas las notificaciones marcadas como leídas', 'success');
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setExpanded(false);
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" fixed="top" expanded={expanded}>
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    {/* Ícono de casa minimalista */}
                    <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginRight: '10px' }}
                        aria-hidden="true"
                        focusable="false"
                    >
                        <defs>
                            <linearGradient id="gradientHouse" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1E40AF" />
                                <stop offset="50%" stopColor="#1D4ED8" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M3 10.5 L12 3 L21 10.5"
                            stroke="url(#gradientHouse)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5.5 9.5 V20 A1 1 0 0 0 6.5 21 H9.5 V15.5 A1 1 0 0 1 10.5 14.5 H13.5 A1 1 0 0 1 14.5 15.5 V21 H17.5 A1 1 0 0 0 18.5 20 V9.5"
                            stroke="url(#gradientHouse)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: '22px',
                            background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #3B82F6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        AlquilER
                    </span>
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(expanded ? false : true)}
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/propiedades" onClick={() => setExpanded(false)}>Propiedades</Nav.Link>

                        {isAuthenticated && esUsuario && (
                            <div className="notif-wrap" ref={dropdownRef}>
                                <Button
                                    variant="link"
                                    className="notif-btn"
                                    onClick={() => {
                                        const abrir = !verDropdown;
                                        setVerDropdown(abrir);
                                        if (abrir) cargarLista();
                                    }}
                                    aria-label={noLeidas > 0
                                        ? `Notificaciones, ${noLeidas} sin leer`
                                        : 'Notificaciones'}
                                    aria-expanded={verDropdown}
                                >
                                    <i className="fas fa-bell"></i>
                                    {noLeidas > 0 && (
                                        <span className="notif-badge">{noLeidas}</span>
                                    )}
                                </Button>

                                {verDropdown && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            <span className="notif-titulo">Notificaciones</span>
                                            {noLeidas > 0 && (
                                                <button
                                                    type="button"
                                                    className="notif-leer-todas"
                                                    onClick={alMarcarTodasLeidas}
                                                >
                                                    Marcar todas leídas
                                                </button>
                                            )}
                                        </div>
                                        <div className="notif-body">
                                            {cargandoNotif && notificaciones.length === 0 ? (
                                                <div className="notif-vacio">
                                                    <i className="fas fa-spinner fa-spin"></i> Cargando...
                                                </div>
                                            ) : notificaciones.length === 0 ? (
                                                <div className="notif-vacio">
                                                    <i className="fas fa-bell-slash"></i>
                                                    <span>No tienes notificaciones</span>
                                                </div>
                                            ) : (
                                                notificaciones.slice(0, 20).map(n => (
                                                    <div
                                                        key={n.id}
                                                        className={`notif-item ${!n.leida ? 'notif-item-no-leida' : ''}`}
                                                        onClick={() =>
                                                            !n.leida && alMarcarLeida(n.id)
                                                        }
                                                        role={!n.leida ? 'button' : undefined}
                                                        tabIndex={!n.leida ? 0 : undefined}
                                                        onKeyDown={(e) => {
                                                            if (!n.leida && (e.key === 'Enter' || e.key === ' ')) {
                                                                e.preventDefault();
                                                                alMarcarLeida(n.id);
                                                            }
                                                        }}
                                                    >
                                                        <div className="notif-item-titulo">
                                                            {n.titulo}
                                                            {!n.leida && <span className="notif-dot"></span>}
                                                        </div>
                                                        {n.mensaje && (
                                                            <div className="notif-item-mensaje">{n.mensaje}</div>
                                                        )}
                                                        {n.fecha_notificacion && (
                                                            <div className="notif-item-fecha">
                                                                {formatearFecha(n.fecha_notificacion)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notificaciones.length > 0 && (
                                            <div className="notif-footer">
                                                <Link
                                                    to="/notificaciones"
                                                    onClick={() => setVerDropdown(false)}
                                                >
                                                    Ver todas
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {isAuthenticated ? (
                            <NavDropdown
                                title={<><i className="fas fa-user"></i> {usuario?.nombre || 'Usuario'}</>}
                                id="basic-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/perfil" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-user-edit"></i> Perfil
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/mis-propiedades" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-building"></i> Mis Propiedades
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/favoritos" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-heart"></i> Favoritos
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/reservas" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-calendar-check"></i> Mis Reservas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/consultas" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-comments"></i> Consultas
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                    <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>Ingresar</Nav.Link>
                                <Button
                                    as={Link}
                                    to="/register"
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => setExpanded(false)}
                                    style={{
                                        background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #3B82F6 100%)',
                                        border: 'none'
                                    }}
                                >
                                    Registrarse
                                </Button>
                            </>
                        )}

                        {Number(usuario?.rol_id) === 2 && (
                            <NavDropdown
                                title={<><i className="fas fa-cog"></i> Administración</>}
                                id="admin-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/admin" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-tachometer-alt"></i> Panel
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/usuarios" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-users"></i> Usuarios
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/categorias" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-tags"></i> Categorías
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/provincias" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-map-marked-alt"></i> Provincias
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/localidades" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-map-pin"></i> Localidades
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/roles" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-user-shield"></i> Roles
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/servicios" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-wrench"></i> Servicios
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/resenas" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-star"></i> Reseñas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/reservas" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-calendar-check"></i> Reservas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/consultas" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-comments"></i> Consultas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/logs" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-clock-rotate-left"></i> Registros
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/propiedades" onClick={() => setExpanded(false)}>
                                    <i className="fas fa-building"></i> Propiedades
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;