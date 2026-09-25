import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { enviarMensajeContacto } from '../services/api';

const DATOS = [
    { icono: 'fa-envelope', titulo: 'Email', detalle: 'contacto@alquiler.com.ar', enlace: 'mailto:contacto@alquiler.com.ar' },
    { icono: 'fa-phone-alt', titulo: 'Teléfono', detalle: '+54 9 11 5555-0001', enlace: 'tel:+5491155550001' },
    { icono: 'fa-map-marker-alt', titulo: 'Dirección', detalle: 'Av. Entre Ríos 1234, CABA', enlace: null },
    { icono: 'fa-clock', titulo: 'Horarios', detalle: 'Lun a Vie de 9:00 a 18:00', enlace: null }
];

function Contacto() {
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
                        <i className="fas fa-headset"></i> Contacto
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
                                    <i className={`fas ${dato.icono}`}></i>
                                </div>
                                <h3>{dato.titulo}</h3>
                                <p>{dato.detalle}</p>
                            </a>
                        ) : (
                            <div key={dato.titulo} className="contact-card">
                                <div className="contact-card-icono">
                                    <i className={`fas ${dato.icono}`}></i>
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
                                <i className="fas fa-check-circle"></i>
                                <span><strong>Consultas de alquiler:</strong> disponibilidad de propiedades y condiciones.</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span><strong>Propietarios:</strong> publicá tu propiedad y gestioná tus reservas.</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span><strong>Problemas técnicos:</strong> con tu cuenta o con el sitio.</span>
                            </li>
                        </ul>

                        <div className="contact-social">
                            <a href="https://www.facebook.com" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                            <a href="https://www.instagram.com" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
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
                            <i className="fas fa-paper-plane"></i> {loading ? 'Enviando...' : 'Enviar mensaje'}
                        </button>

                        {loading && (
                            <div className="alert alert-info">
                                <i className="fas fa-spinner fa-spin"></i> Enviando mensaje...
                            </div>
                        )}

                        {errorApi && (
                            <div className="alert alert-error" role="alert">
                                {errorApi}
                            </div>
                        )}

                        {enviado && (
                            <div className="alert alert-success" role="alert">
                                <i className="fas fa-envelope-open-text"></i> Tu mensaje fue enviado.
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