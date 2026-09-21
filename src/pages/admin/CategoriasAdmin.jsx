import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
} from '../../services/api';

const config = {
    titulo: 'Categorías',
    nombreSingular: 'categoría',
    icono: 'fa-tags',
    descripcion: 'Gestioná las categorías de propiedades publicadas.',
    columnaPrincipal: 'nombre',
    obtener: () => getCategorias(),
    crear: (data, token) => createCategoria(data, token),
    actualizar: (id, data, token) => updateCategoria(id, data, token),
    eliminar: (id, token) => deleteCategoria(id, token),
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
            placeholder: 'Ej: Casa',
            ayuda: 'Solo letras, números, espacios, guiones y &.'
        }
    ]
};

function CategoriasAdmin() {
    return <PanelCrud config={config} />;
}

export default CategoriasAdmin;