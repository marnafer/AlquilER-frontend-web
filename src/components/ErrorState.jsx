import Icon from './Icon';
import React from 'react';

const ErrorState = ({ mensaje, onReintentar, mensajeBoton = 'Reintentar' }) => (
    <div className="estado-error">
        <div className="estado-error-icono">
            <Icon name="fas fa-triangle-exclamation" />
        </div>
        <h3>Algo salió mal</h3>
        <p>{mensaje}</p>
        {onReintentar && (
            <button className="btn-ver-todas" onClick={onReintentar}>
                <Icon name="fas fa-rotate-right" /> {mensajeBoton}
            </button>
        )}
    </div>
);

export default ErrorState;