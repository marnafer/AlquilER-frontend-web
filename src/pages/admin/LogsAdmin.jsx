import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import { getLogsActividad } from '../../services/api';

const config = {
    titulo: 'Registros de actividad',
    nombreSingular: 'registro',
    icono: 'fa-clock-rotate-left',
    descripcion: 'Últimas acciones registradas por los usuarios del sistema.',
    soloLectura: true,
    obtener: (token) => getLogsActividad(token),
    columnas: [
        { key: 'id', label: 'ID' },
        {
            key: 'usuario_nombre',
            label: 'Usuario',
            render: (item) => (
                <div>
                    <div>{item.usuario_nombre || '—'}</div>
                    {item.usuario_email && (
                        <small className="text-muted">{item.usuario_email}</small>
                    )}
                </div>
            )
        },
        { key: 'accion', label: 'Acción' },
        { key: 'ip_address', label: 'IP' },
        {
            key: 'fecha',
            label: 'Fecha',
            render: (item) => String(item.fecha ?? '').slice(0, 16)
        }
    ]
};

function LogsAdmin() {
    return <PanelCrud config={config} />;
}

export default LogsAdmin;