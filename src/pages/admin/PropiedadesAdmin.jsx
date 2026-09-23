import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getPropiedadesAdmin,
    deletePropiedad,
    restorePropiedad
} from '../../services/api';

const estadoBadge = (disponible) => (
    <span className={`admin-badge ${disponible ? 'admin-badge-usuario' : 'admin-badge-admin'}`}>
        {disponible ? 'Disponible' : 'No disponible'}
    </span>
);

const config = {
    titulo: 'Propiedades',
    nombreSingular: 'propiedad',
    icono: 'fa-building',
    descripcion: 'Propiedades publicadas en el sistema.',
    columnaPrincipal: 'titulo',
    obtener: (token) => getPropiedadesAdmin(token),
    eliminar: (id, token) => deletePropiedad(id, token),
    papelera: {
        obtener: (token) => getPropiedadesAdmin(token, true),
        restaurar: (id, token) => restorePropiedad(id, token)
    },
    columnas: [
        { key: 'id', label: 'ID' },
        {
            key: 'titulo',
            label: 'Título',
            render: (item) => (
                <div>
                    <div>{item.titulo}</div>
                    {item.direccion && <small className="text-muted">{item.direccion}</small>}
                </div>
            )
        },
        {
            key: 'precio',
            label: 'Precio',
            render: (item) => (item.precio != null
                ? `$${Number(item.precio).toLocaleString('es-AR')}`
                : '—')
        },
        {
            key: 'disponible',
            label: 'Estado',
            render: (item) => estadoBadge(item.disponible)
        },
        {
            key: 'usuario',
            label: 'Propietario',
            render: (item) => {
                const u = item.usuario;
                return u ? `${u.nombre} ${u.apellido}` : '—';
            }
        },
        {
            key: 'categoria',
            label: 'Categoría',
            render: (item) => item.categoria?.nombre ?? '—'
        },
        {
            key: 'localidad',
            label: 'Localidad',
            render: (item) => item.localidad?.nombre ?? '—'
        }
    ]
};

function PropiedadesAdmin() {
    return <PanelCrud config={config} />;
}

export default PropiedadesAdmin;