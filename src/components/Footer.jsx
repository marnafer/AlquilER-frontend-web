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
                        <a href="https://www.facebook.com" aria-label="Facebook">
                            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                <path d="M15.12 5.32H16V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.51 1.66-4.51 4.7v3.1H6v4.66h3.75V22h4.66V14.46h3.83l.59-4.66h-4.42V7.05c0-1.07.28-1.73 1.71-1.73z" />
                            </svg>
                        </a>
                        <a href="https://www.instagram.com" aria-label="Instagram">
                            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zM12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384C1.347 2.68.935 3.35.63 4.14.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.741 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.65.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                            </svg>
                        </a>
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