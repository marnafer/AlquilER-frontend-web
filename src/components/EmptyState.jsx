import React from 'react';

const EmptyState = ({ icono = 'fa-folder-open', titulo, descripcion, action, children }) => (
    <div className="estado-vacio">
        <div className="estado-vacio-icono">
            <i className={`fas ${icono}`}></i>
        </div>
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
        {action || children}
    </div>
);

export default EmptyState;