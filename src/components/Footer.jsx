import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    const año = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Alquil<span>ER</span></h3>
                    <p>Encontrá la propiedad ideal para vos. Departamentos, casas, locales comerciales y más.</p>
                    <div className="social-links">
                        <a href="https://www.facebook.com" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                        <a href="https://www.instagram.com" aria-label="Instagram"><i className="fab fa-instagram"></i></a>

                    </div>
                </div>

                <div className="footer-section">
                    <h4>Navegación</h4>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/propiedades">Propiedades</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Gestión</h4>
                    <ul>
                        <li><Link to="/propiedades/crear">Publicar propiedad</Link></li>
                        <li><Link to="/mis-propiedades">Mis propiedades</Link></li>
                        <li><Link to="/reservas">Mis reservas</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Ayuda</h4>
                    <ul>
                        <li><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link></li>
                        <li><Link to="/terminos">Términos y condiciones</Link></li>
                        <li><Link to="/privacidad">Política de privacidad</Link></li>
                        <li><Link to="/contacto">Contactanos</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {año} AlquilER - Todos los derechos reservados</p>
                <p className="footer-version">v1.0.0</p>
            </div>
        </footer>
    );
}

export default Footer;