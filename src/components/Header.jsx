import Icon from './Icon';
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
                    <img
                        src="/assets/img/logo-header.webp"
                        alt="AlquilER"
                        className="navbar-brand-logo"
                    />

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
                                    <Icon name="fas fa-bell" />
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
                                                    <Icon name="fas fa-spinner fa-spin" /> Cargando...
                                                </div>
                                            ) : notificaciones.length === 0 ? (
                                                <div className="notif-vacio">
                                                    <Icon name="fas fa-bell-slash" />
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
                                title={<><Icon name="fas fa-user" /> {usuario?.nombre || 'Usuario'}</>}
                                id="basic-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/perfil" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-user-edit" /> Perfil
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/mis-propiedades" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-building" /> Mis Propiedades
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/favoritos" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-heart" /> Favoritos
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/reservas" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-calendar-check" /> Mis Reservas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/consultas" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-comments" /> Consultas
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                    <Icon name="fas fa-sign-out-alt" /> Cerrar Sesión
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
                                title={<><Icon name="fas fa-cog" /> Administración</>}
                                id="admin-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/admin" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-tachometer-alt" /> Panel
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/usuarios" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-users" /> Usuarios
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/categorias" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-tags" /> Categorías
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/provincias" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-map-marked-alt" /> Provincias
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/localidades" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-map-pin" /> Localidades
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/roles" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-user-shield" /> Roles
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/servicios" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-wrench" /> Servicios
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/resenas" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-star" /> Reseñas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/reservas" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-calendar-check" /> Reservas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/consultas" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-comments" /> Consultas
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/logs" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-clock-rotate-left" /> Registros
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/propiedades" onClick={() => setExpanded(false)}>
                                    <Icon name="fas fa-building" /> Propiedades
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