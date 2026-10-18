import Icon from '../components/Icon';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { enviarMensajeContacto } from '../services/api';
import { useSEO } from '../hooks/useSEO';

const DATOS = [
    { icono: 'fa-envelope', titulo: 'Email', detalle: 'contacto@alquiler.com.ar', enlace: 'mailto:contacto@alquiler.com.ar' },
    { icono: 'fa-phone-alt', titulo: 'Teléfono', detalle: '+54 9 11 5555-0001', enlace: 'tel:+5491155550001' },
    { icono: 'fa-map-marker-alt', titulo: 'Dirección', detalle: 'Av. Entre Ríos 1234, CABA', enlace: null },
    { icono: 'fa-clock', titulo: 'Horarios', detalle: 'Lun a Vie de 9:00 a 18:00', enlace: null }
];

function Contacto() {
    useSEO(
        'Contacto',
        '¿Tenés una consulta sobre un alquiler en AlquilER? Escribinos y te respondemos. También podés llamarnos o visitarnos.'
    );

    const [formData, setFormData] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
    const [errores, setErrores] = useState({});
    const [errorApi, setErrorApi] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'Ingresá tu nombre.';
        }
        if (!formData.email.trim()) {
            nuevosErrores.email = 'Ingresá tu correo electrónico.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            nuevosErrores.email = 'El correo electrónico no es válido.';
        }
        if (!formData.asunto.trim()) {
            nuevosErrores.asunto = 'Contanos brevemente el motivo.';
        }
        if (formData.mensaje.trim().length < 10) {
            nuevosErrores.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
        }
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorApi('');
        const nuevosErrores = validar();
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        setLoading(true);

        try {
            const result = await enviarMensajeContacto({
                nombre: formData.nombre.trim(),
                email: formData.email.trim(),
                asunto: formData.asunto.trim(),
                mensaje: formData.mensaje.trim()
            });

            if (result.success) {
                setEnviado(true);
                setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
            } else {
                setErrorApi(
                    result.error
                    || result.message
                    || 'No se pudo enviar el mensaje. Intentá de nuevo.'
                );
            }
        } catch (err) {
            setErrorApi('Error de conexión. Intentá de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contacto-page">
            <div className="container">
                <section className="contact-hero">
                    <span className="contact-hero-badge">
                        <Icon name="fas fa-headset" /> Contacto
                    </span>
                    <h1>¿En qué podemos ayudarte?</h1>
                    <p>
                        Resolvé tus dudas sobre alquileres, reservas o publicación de propiedades.
                        Elegí el canal que prefieras y te respondemos a la brevedad.
                    </p>
                </section>

                <div className="contact-cards">
                    {DATOS.map((dato) => (
                        dato.enlace ? (
                            <a key={dato.titulo} href={dato.enlace} className="contact-card">
                                <div className="contact-card-icono">
                                    <Icon name={`fas ${dato.icono}`} />
                                </div>
                                <h3>{dato.titulo}</h3>
                                <p>{dato.detalle}</p>
                            </a>
                        ) : (
                            <div key={dato.titulo} className="contact-card">
                                <div className="contact-card-icono">
                                    <Icon name={`fas ${dato.icono}`} />
                                </div>
                                <h3>{dato.titulo}</h3>
                                <p>{dato.detalle}</p>
                            </div>
                        )
                    ))}
                </div>

                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>Escribinos un mensaje</h2>
                        <p>
                            Completá el formulario y te responderemos a la brevedad.
                            También podés consultar la{' '}
                            <Link to="/preguntas-frecuentes">sección de preguntas frecuentes</Link>.
                        </p>

                        <ul className="contact-lista">
                            <li>
                                <Icon name="fas fa-check-circle" />
                                <span><strong>Consultas de alquiler:</strong> disponibilidad de propiedades y condiciones.</span>
                            </li>
                            <li>
                                <Icon name="fas fa-check-circle" />
                                <span><strong>Propietarios:</strong> publicá tu propiedad y gestioná tus reservas.</span>
                            </li>
                            <li>
                                <Icon name="fas fa-check-circle" />
                                <span><strong>Problemas técnicos:</strong> con tu cuenta o con el sitio.</span>
                            </li>
                        </ul>

                        <div className="contact-social">
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

                    <form className="contact-form" onSubmit={handleSubmit} noValidate>
                        <div className="contact-form-grupo">
                            <label htmlFor="contacto-nombre">Nombre</label>
                            <input
                                type="text"
                                id="contacto-nombre"
                                name="nombre"
                                placeholder="Tu nombre y apellido"
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                            {errores.nombre && <span className="contact-form-error">{errores.nombre}</span>}
                        </div>

                        <div className="contact-form-grupo">
                            <label htmlFor="contacto-email">Correo electrónico</label>
                            <input
                                type="email"
                                id="contacto-email"
                                name="email"
                                placeholder="tucorreo@ejemplo.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errores.email && <span className="contact-form-error">{errores.email}</span>}
                        </div>

                        <div className="contact-form-grupo">
                            <label htmlFor="contacto-asunto">Asunto</label>
                            <input
                                type="text"
                                id="contacto-asunto"
                                name="asunto"
                                placeholder="¿Sobre qué querés escribirnos?"
                                value={formData.asunto}
                                onChange={handleChange}
                            />
                            {errores.asunto && <span className="contact-form-error">{errores.asunto}</span>}
                        </div>

                        <div className="contact-form-grupo">
                            <label htmlFor="contacto-mensaje">Mensaje</label>
                            <textarea
                                id="contacto-mensaje"
                                name="mensaje"
                                rows="5"
                                placeholder="Escribí tu mensaje..."
                                value={formData.mensaje}
                                onChange={handleChange}
                            ></textarea>
                            {errores.mensaje && <span className="contact-form-error">{errores.mensaje}</span>}
                        </div>

                        <button type="submit" className="contact-form-btn" disabled={loading}>
                            <Icon name="fas fa-paper-plane" /> {loading ? 'Enviando...' : 'Enviar mensaje'}
                        </button>

                        {loading && (
                            <div className="alert alert-info">
                                <Icon name="fas fa-spinner fa-spin" /> Enviando mensaje...
                            </div>
                        )}

                        {errorApi && (
                            <div className="alert alert-error" role="alert">
                                {errorApi}
                            </div>
                        )}

                        {enviado && (
                            <div className="alert alert-success" role="alert">
                                <Icon name="fas fa-envelope-open-text" /> Tu mensaje fue enviado.
                                ¡Gracias por escribirnos! Te responderemos a la brevedad.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Contacto;