import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getRoles,
    createRol,
    updateRol,
    deleteRol
} from '../../services/api';

const config = {
    titulo: 'Roles',
    nombreSingular: 'rol',
    icono: 'fa-user-shield',
    descripcion: 'Gestioná los roles del sistema.',
    columnaPrincipal: 'nombre',
    obtener: () => getRoles(),
    crear: (data, token) => createRol(data, token),
    actualizar: (id, data, token) => updateRol(id, data, token),
    eliminar: (id, token) => deleteRol(id, token),
    columnas: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' }
    ],
    campos: [
        {
            name: 'nombre',
            label: 'Nombre',
            type: 'text',
            requerido: true,
            min: 3,
            max: 30,
            placeholder: 'Ej: usuario',
            ayuda: 'Solo letras y espacios.'
        }
    ]
};

function RolesAdmin() {
    return <PanelCrud config={config} />;
}

export default RolesAdmin;