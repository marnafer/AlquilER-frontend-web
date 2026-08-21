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
                    <i 
                        className="fas fa-home" 
                        style={{ 
                            background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '20px',
                            marginRight: '8px'
                        }}
                    ></i>
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