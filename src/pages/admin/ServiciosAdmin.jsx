import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getServicios,
    createServicio,
    updateServicio,
    deleteServicio,
    restoreServicio
} from '../../services/api';

const config = {
    titulo: 'Servicios',
    nombreSingular: 'servicio',
    icono: 'fa-wrench',
    descripcion: 'Gestioná los servicios que pueden tener las propiedades.',
    columnaPrincipal: 'nombre',
    obtener: () => getServicios(),
    crear: (data, token) => createServicio(data, token),
    actualizar: (id, data, token) => updateServicio(id, data, token),
    eliminar: (id, token) => deleteServicio(id, token),
    papelera: {
        obtener: () => getServicios(true),
        restaurar: (id, token) => restoreServicio(id, token)
    },
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
            max: 50,
            placeholder: 'Ej: Gas natural',
            ayuda: 'Solo letras, números, espacios, guiones y &.'
        }
    ]
};

function ServiciosAdmin() {
    return <PanelCrud config={config} />;
}

export default ServiciosAdmin;