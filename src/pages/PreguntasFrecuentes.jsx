import React from 'react';
import { Link } from 'react-router-dom';

const PREGUNTAS = [
    {
        pregunta: '¿Cómo hago para alquilar una propiedad?',
        respuesta: 'Buscá en el catálogo la propiedad que te guste, entrá en su detalle y tocá "Reservar". Completá las fechas y el propietario recibirá tu solicitud. Cuando la acepte, la reserva queda confirmada.'
    },
    {
        pregunta: '¿Cuánto cuesta publicar una propiedad?',
        respuesta: 'Publicar una propiedad en AlquilER es totalmente gratis. Solo tenés que registrarte, ir a "Publicar propiedad" y completar los datos del inmueble.'
    },
    {
        pregunta: '¿Cómo sé si mi reserva fue aceptada?',
        respuesta: 'El estado de tus reservas lo ves en la sección "Mis reservas". Ahí vas a encontrar los estados: pendiente, confirmada, rechazada, cancelada o finalizada.'
    },
    {
        pregunta: '¿Puedo cancelar una reserva?',
        respuesta: 'Sí. Si la reserva está pendiente o confirmada, tanto el inquilino como el propietario pueden cancelarla desde "Mis reservas".'
    },
    {
        pregunta: '¿Cómo califico a un propietario o inquilino?',
        respuesta: 'Una vez que una reserva queda finalizada, podés calificar con estrellas y dejar un comentario desde la sección "Mis reservas". El propietario puede calificar al inquilino y viceversa.'
    },
    {
        pregunta: '¿Qué son los servicios de una propiedad?',
        respuesta: 'Son las comodidades que ofrece el inmueble: wifi, aire acondicionado, cochera, seguridad, entre otras. Cuando publicás una propiedad podés marcar cuáles tiene, y los inquilinos las ven en el detalle.'
    },
    {
        pregunta: '¿Necesito crear una cuenta para consultar?',
        respuesta: 'Para hacer consultas a los propietarios y guardar favoritos necesitás estar registrado e iniciar sesión. La búsqueda y el catálogo están disponibles para todos.'
    }
];

function PreguntasFrecuentes() {
    return (
        <div className="estatica-page">
            <div className="container">
                <section className="estatica-hero">
                    <span className="contact-hero-badge">
                        <i className="fas fa-circle-question"></i> Preguntas frecuentes
                    </span>
                    <h1>Resolvé tus dudas</h1>
                    <p>
                        Las respuestas a las preguntas más comunes sobre alquileres, reservas y
                        publicación de propiedades. Si no encontrás lo que buscás,{' '}
                        <Link to="/contacto">contactanos</Link>.
                    </p>
                </section>

                <div className="faq-list">
                    {PREGUNTAS.map((item, i) => (
                        <details key={i} className="faq-item">
                            <summary>
                                {item.pregunta}
                                <i className="fas fa-chevron-down faq-icono"></i>
                            </summary>
                            <div className="faq-respuesta">{item.respuesta}</div>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PreguntasFrecuentes;