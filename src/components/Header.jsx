import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import {
    getNotificaciones,
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

    const cargarNotificaciones = useCallback(async () => {
        if (!esUsuario || !token) return;
        setCargandoNotif(true);
        try {
            const result = await getNotificaciones(token);
            if (result.success && result.data) {
                setNotificaciones(result.data.items || []);
                setNoLeidas(Number(result.data.no_leidas) || 0);
                const nuevas = Number(result.data.no_leidas) || 0;
                if (nuevas > ultimasNoLeidas.current && nuevas > 0) {
                    showToast('Tienes notificaciones nuevas', 'info');
                }
                ultimasNoLeidas.current = nuevas;
            }
        } catch (error) {
            // Silencioso: el polling no debe molestar
        } finally {
            setCargandoNotif(false);
        }
    }, [esUsuario, token, showToast]);

    useEffect(() => {
        if (esUsuario && token) {
            ultimasNoLeidas.current = 0;
            cargarNotificaciones();
            const intervalo = setInterval(cargarNotificaciones, 30000);
            return () => clearInterval(intervalo);
        }
        setNotificaciones([]);
        setNoLeidas(0);
        ultimasNoLeidas.current = 0;
    }, [esUsuario, token, cargarNotificaciones]);

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
                    {/* Ícono de casa personalizado con SVG */}
                    <svg 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginRight: '10px' }}
                    >
                        <path 
                            d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21" 
                            stroke="url(#gradientHouse)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <defs>
                            <linearGradient id="gradientHouse" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0f766e" />
                                <stop offset="50%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#0d9488" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    <span 
                        style={{ 
                            fontWeight: 700, 
                            fontSize: '22px',
                            background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%)',
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
                        <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Inicio</Nav.Link>
                        <Nav.Link as={Link} to="/propiedades" onClick={() => setExpanded(false)}>Propiedades</Nav.Link>
                        
                        {isAuthenticated && esUsuario && (
                            <div className="notif-wrap" ref={dropdownRef}>
                                <Button
                                    variant="link"
                                    className="notif-btn"
                                    onClick={() => setVerDropdown(!verDropdown)}
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
                                            background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%)',
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