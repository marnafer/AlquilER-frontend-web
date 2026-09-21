import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getLocalidades,
    getProvincias,
    createLocalidad,
    updateLocalidad,
    deleteLocalidad
} from '../../services/api';

const config = {
    titulo: 'Localidades',
    nombreSingular: 'localidad',
    icono: 'fa-map-pin',
    descripcion: 'Gestioná las localidades y su provincia asociada.',
    columnaPrincipal: 'nombre',
    obtener: () => getLocalidades(),
    crear: (data, token) => createLocalidad(data, token),
    actualizar: (id, data, token) => updateLocalidad(id, data, token),
    eliminar: (id, token) => deleteLocalidad(id, token),
    externos: [
        { clave: 'provincias', cargar: () => getProvincias() }
    ],
    columnas: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'codigo_postal', label: 'C.P.' },
        {
            key: 'provincia_id',
            label: 'Provincia',
            render: (item, externos) => {
                const prov = (externos.provincias || []).find(p => String(p.id) === String(item.provincia_id));
                return prov ? prov.nombre : `#${item.provincia_id}`;
            }
        }
    ],
    campos: [
        {
            name: 'nombre',
            label: 'Nombre',
            type: 'text',
            requerido: true,
            min: 2,
            max: 100,
            placeholder: 'Ej: Crespo'
        },
        {
            name: 'codigo_postal',
            label: 'Código postal',
            type: 'text',
            requerido: true,
            min: 2,
            max: 15,
            placeholder: 'Ej: 3116'
        },
        {
            name: 'provincia_id',
            label: 'Provincia',
            type: 'select',
            opciones: 'provincias',
            requerido: true
        }
    ]
};

function LocalidadesAdmin() {
    return <PanelCrud config={config} />;
}

export default LocalidadesAdmin;