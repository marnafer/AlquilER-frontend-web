import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getProvincias,
    createProvincia,
    updateProvincia,
    deleteProvincia,
    restoreProvincia
} from '../../services/api';

const config = {
    titulo: 'Provincias',
    nombreSingular: 'provincia',
    icono: 'fa-map-marked-alt',
    descripcion: 'Gestioná las provincias del catálogo.',
    columnaPrincipal: 'nombre',
    obtener: () => getProvincias(),
    crear: (data, token) => createProvincia(data, token),
    actualizar: (id, data, token) => updateProvincia(id, data, token),
    eliminar: (id, token) => deleteProvincia(id, token),
    papelera: {
        obtener: () => getProvincias(true),
        restaurar: (id, token) => restoreProvincia(id, token)
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
            max: 100,
            placeholder: 'Ej: Entre Ríos',
            ayuda: 'Solo letras y espacios.'
        }
    ]
};

function ProvinciasAdmin() {
    return <PanelCrud config={config} />;
}

export default ProvinciasAdmin;