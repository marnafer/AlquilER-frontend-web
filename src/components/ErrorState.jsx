import React from 'react';

const ErrorState = ({ mensaje, onReintentar, mensajeBoton = 'Reintentar' }) => (
    <div className="estado-error">
        <div className="estado-error-icono">
            <i className="fas fa-triangle-exclamation"></i>
        </div>
        <h3>Algo salió mal</h3>
        <p>{mensaje}</p>
        {onReintentar && (
            <button className="btn-ver-todas" onClick={onReintentar}>
                <i className="fas fa-rotate-right"></i> {mensajeBoton}
            </button>
        )}
    </div>
);

export default ErrorState;