import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getServicios } from '../services/api';
import ServicioIcono from '../components/ServicioIcono';
import { useSEO } from '../hooks/useSEO';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

function Servicios() {
    useSEO(
        'Servicios para el alquiler',
        'Conocé los servicios disponibles para tu alquiler en AlquilER: luz, gas, agua, internet y mucho más. Elegí los que necesitás al publicar tu propiedad.'
    );

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cargarServicios = useCallback(() => {
        setLoading(true);
        setError('');
        getServicios()
            .then(lista => setServicios(Array.isArray(lista) ? lista : []))
            .catch(err => {
                console.error('Error cargando servicios:', err);
                setError(err.message || 'No pudimos cargar los servicios. Probá de nuevo en unos momentos.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        cargarServicios();
    }, [cargarServicios]);

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="estatica-page">
                <div className="container">
                    <ErrorState mensaje={error} onReintentar={cargarServicios} />
                </div>
            </div>
        );
    }

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
                    <EmptyState
                        icono="fa-concierge-bell"
                        titulo="Todavía no hay servicios cargados"
                        descripcion="Los servicios son las comodidades que podés marcar al publicar una propiedad."
                        action={
                            <Link to="/propiedades/crear" className="btn-ver-todas">
                                <i className="fas fa-plus"></i> Publicar primera propiedad
                            </Link>
                        }
                    />
                ) : (
                    <div className="servicios-grid servicios-grid-catalogo">
                        {servicios.map(serv => (
                            <div className="servicio-card" key={serv.id}>
                                <ServicioIcono nombre={serv.nombre} className="servicio-icon" />
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
