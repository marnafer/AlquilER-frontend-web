import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';

function Header() {
    const { isAuthenticated, logout, usuario } = useAuth();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

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
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;