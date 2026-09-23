import React from 'react';
import { Link } from 'react-router-dom';

function Privacidad() {
    return (
        <div className="estatica-page">
            <div className="container">
                <section className="estatica-hero">
                    <span className="contact-hero-badge">
                        <i className="fas fa-shield-halved"></i> Política de privacidad
                    </span>
                    <h1>Política de privacidad</h1>
                    <p>Última actualización: {new Date().getFullYear()}</p>
                </section>

                <div className="estatica-contenido">
                    <h2><i className="fas fa-circle-check"></i> 1. Datos que recopilamos</h2>
                    <ul>
                        <li>Datos de registro: nombre, apellido, correo electrónico, teléfono y domicilio.</li>
                        <li>Datos generados por tu actividad: propiedades publicadas, reservas, consultas, favoritos y reseñas.</li>
                        <li>Datos técnicos: dirección IP y navegador, con fines de seguridad y diagnóstico.</li>
                    </ul>

                    <h2><i className="fas fa-circle-check"></i> 2. Uso de la información</h2>
                    <p>
                        Utilizamos tus datos para operar la plataforma: procesar reservas y
                        consultas, mostrar las propiedades que publicaste, mantener tu sesión
                        iniciada y mejorar la experiencia de uso. La contraseña se almacena de forma
                        encriptada y nunca se muestra a terceros.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 3. Compartir información</h2>
                    <p>
                        Tu nombre y correo pueden verlos las personas con las que interactuás (por
                        ejemplo, un propietario ve el nombre de quien reserva su propiedad). No
                        vendemos tus datos personales a terceros.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 4. Seguridad</h2>
                    <p>
                        Aplicamos medidas técnicas y organizativas razonables para proteger tus
                        datos: encriptación de contraseñas, validación de sesiones y registro de
                        actividad. Ningún sistema es infalible, por eso te recomendamos usar una
                        contraseña segura y no compartirla.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 5. Retención y borrado</h2>
                    <p>
                        Mantenemos tus datos mientras tu cuenta esté activa. Podés solicitar la
                        eliminación de tu cuenta en cualquier momento a través del{' '}
                        <Link to="/contacto">formulario de contacto</Link>.
                    </p>

                    <h2><i className="fas fa-circle-check"></i> 6. Tus derechos</h2>
                    <ul>
                        <li>Acceder a tus datos personales desde tu perfil.</li>
                        <li>Corregir datos inexactos (nombre, teléfono, domicilio, correo).</li>
                        <li>Solicitar el borrado de tu cuenta y de los datos asociados.</li>
                    </ul>

                    <h2><i className="fas fa-circle-check"></i> 7. Cambios en la política</h2>
                    <p>
                        Esta política puede actualizarse. Te avisaremos por correo electrónico ante
                        cambios sustanciales para que puedas decidir si seguís usando la plataforma.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Privacidad;