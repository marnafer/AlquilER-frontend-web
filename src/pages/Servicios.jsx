import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServicios } from '../services/api';
import { iconoServicio } from '../utils/servicios';
import { useSEO } from '../hooks/useSEO';
import Loader from '../components/Loader';

function Servicios() {
    useSEO(
        'Servicios para el alquiler',
        'Conocé los servicios disponibles para tu alquiler en AlquilER: luz, gas, agua, internet y mucho más. Elegí los que necesitás al publicar tu propiedad.'
    );

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getServicios()
            .then(lista => setServicios(Array.isArray(lista) ? lista : []))
            .catch(error => console.error('Error cargando servicios:', error))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="estatica-page">
            <div className="container">
                <section className="estatica-hero">
                    <span className="contact-hero-badge">
                        <i className="fas fa-concierge-bell"></i> Servicios
                    </span>
                    <h1>Todos los servicios</h1>
                    <p>
                        Las comodidades que podés marcar al publicar una propiedad. Hay{' '}
                        {servicios.length} servicios disponibles. Si buscás uno en particular,{' '}
                        <Link to="/propiedades">filtra el catálogo</Link>.
                    </p>
                </section>

                {servicios.length === 0 ? (
                    <p className="form-help" style={{ textAlign: 'center' }}>
                        Todavía no hay servicios cargados.
                    </p>
                ) : (
                    <div className="servicios-grid servicios-grid-catalogo">
                        {servicios.map(serv => (
                            <div className="servicio-card" key={serv.id}>
                                <i className={`fas ${iconoServicio(serv.nombre)} servicio-icon`}></i>
                                <h4>{serv.nombre}</h4>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Servicios;
