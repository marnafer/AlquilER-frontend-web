import React from 'react';
import { Link } from 'react-router-dom';

function Terminos() {
    return (
        <div className="estatica-page">
            <div className="container">
                <section className="estatica-hero">
                    <span className="contact-hero-badge">
                        <i className="fas fa-file-contract"></i> Términos y condiciones
                    </span>
                    <h1>Términos y condiciones</h1>
                    <p>Última actualización: {new Date().getFullYear()}</p>
                </section>

                <div className="estatica-contenido">
                    <h2><i className="fas fa-circle-check"></i> 1. Aceptación de los términos</h2>
                    <p>
                        Al utilizar el sitio AlquilER ("la plataforma"), aceptás estos términos y
                        condiciones en su totalidad. Si no estás de acuerdo, te pedimos que no
                        utilices la plataforma.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 2. Descripción del servicio</h2>
                    <p>
                        AlquilER funciona como un punto de encuentro entre propietarios e
                        inquilinos. La plataforma permite publicar propiedades, gestionar reservas,
                        realizar consultas y calificar la experiencia entre las partes. AlquilER no
                        interviene en los contratos de alquiler que se celebren fuera de la
                        plataforma.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 3. Cuentas y responsabilidad del usuario</h2>
                    <ul>
                        <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
                        <li>Debés proporcionar datos reales y mantenerlos actualizados.</li>
                        <li>La información publicada debe ser veraz y no puede infringir derechos de terceros.</li>
                    </ul>

                    <h2><i className="fas fa-circle-check"></i> 4. Publicación de propiedades</h2>
                    <p>
                        Al publicar una propiedad declarás que tenés derecho a ofrecerla en alquiler.
                        Las imágenes, el precio y las características deben reflejar fielmente el
                        inmueble. La plataforma se reserva el derecho de quitar publicaciones que
                        incumplan estas reglas.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 5. Reservas y cancelaciones</h2>
                    <p>
                        Las reservas se gestionan entre las partes dentro de la plataforma. Tanto el
                        inquilino como el propietario pueden cancelar una reserva pendiente o
                        confirmada. Las condiciones particulares de cada alquiler (por ejemplo, el
                        depósito en garantía) se acuerdan directamente entre las partes.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 6. Limitación de responsabilidad</h2>
                    <p>
                        AlquilER no garantiza que los anuncios estén libres de errores ni es
                        responsable por los daños derivados de los acuerdos celebrados entre
                        propietarios e inquilinos. La plataforma actúa como mero canal de
                        publicación y contacto.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 7. Modificaciones</h2>
                    <p>
                        Podemos modificar estos términos en cualquier momento. La fecha de
                        "última actualización" indica la versión vigente. El uso continuado de la
                        plataforma implica la aceptación de los cambios.
                    </p>

                    <p>
                        Ante cualquier duda, escribinos a{' '}
                        <Link to="/contacto">contacto@alquiler.com.ar</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Terminos;