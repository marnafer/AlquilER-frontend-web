import React from 'react';
import { Link } from 'react-router-dom';

function PropiedadCard({ propiedad }) {
    return (
        <div className="propiedad-card">
            <div className="propiedad-image">
                <img
                    src={`/uploads/propiedades/${propiedad.id}.jpg`}
                    alt={propiedad.titulo || 'Propiedad'}
                    onError={(e) => e.target.src = '/assets/img/propiedad-default.jpg'}
                />
                <span className={`propiedad-badge ${propiedad.disponible ? 'disponible' : 'alquilada'}`}>
                    {propiedad.disponible ? 'Disponible' : 'Alquilada'}
                </span>
            </div>
            <div className="propiedad-info">
                <h3>{propiedad.titulo || 'Propiedad sin título'}</h3>
                <p className="propiedad-direccion">
                    <i className="fas fa-map-marker-alt"></i> {propiedad.direccion || 'Dirección no especificada'}
                </p>
                <p className="propiedad-precio">${Number(propiedad.precio).toLocaleString()}</p>
                <div className="propiedad-features">
                    <span><i className="fas fa-bed"></i> {propiedad.cantidad_dormitorios || 0}</span>
                    <span><i className="fas fa-bath"></i> {propiedad.cantidad_banos || 0}</span>
                    <span><i className="fas fa-arrows-alt"></i> {propiedad.cantidad_ambientes || 0}</span>
                </div>
                <Link to={`/propiedades/${propiedad.id}`} className="btn-ver">
                    <i className="fas fa-eye"></i> Ver más
                </Link>
            </div>
        </div>
    );
}

export default PropiedadCard;