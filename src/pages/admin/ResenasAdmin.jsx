import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getResenas,
    updateResena,
    deleteResena,
    restoreResena
} from '../../services/api';

const estrellas = (valor) => (
    <span className="resenas-estrellas">
        {[1, 2, 3, 4, 5].map(i => (
            <i
                key={i}
                className={`fas fa-star ${i <= Number(valor || 0) ? 'estrella-llena' : ''}`}
            ></i>
        ))}
    </span>
);

const config = {
    titulo: 'Reseñas',
    nombreSingular: 'reseña',
    icono: 'fa-star',
    descripcion: 'Moderá las reseñas publicadas sobre las propiedades y los inquilinos.',
    columnaPrincipal: 'id',
    crear: null,
    obtener: (token) => getResenas(token),
    actualizar: (id, data, token) => updateResena(id, data, token),
    eliminar: (id, token) => deleteResena(id, token),
    papelera: {
        obtener: (token) => getResenas(token, true),
        restaurar: (id, token) => restoreResena(id, token)
    },
    columnas: [
        { key: 'id', label: 'ID' },
        {
            key: 'tipo',
            label: 'Tipo',
            render: (item) => item.tipo === 'propiedad' ? 'Propiedad' : 'Inquilino'
        },
        {
            key: 'calificacion',
            label: 'Calificación',
            render: (item) => `${estrellas(item.calificacion)} ${item.calificacion || '—'}`
        },
        {
            key: 'comentario',
            label: 'Comentario',
            render: (item) => item.comentario || '—'
        },
        {
            key: 'calificador',
            label: 'Calificador',
            render: (item) => (
                item.calificador
                    ? `${item.calificador.nombre} ${item.calificador.apellido || ''}`.trim()
                    : `Usuario #${item.calificador_id}`
            )
        },
        {
            key: 'fecha_publicacion',
            label: 'Fecha',
            render: (item) => item.fecha_publicacion ? String(item.fecha_publicacion).slice(0, 10) : '—'
        }
    ],
    campos: [
        {
            name: 'calificacion',
            label: 'Calificación',
            type: 'number',
            requerido: true,
            min: 1,
            max: 5,
            placeholder: '1 a 5',
            ayuda: 'Valor entre 1 y 5 estrellas.'
        },
        {
            name: 'comentario',
            label: 'Comentario',
            type: 'textarea',
            rows: 4,
            min: 3,
            max: 1000,
            placeholder: 'Escribí el comentario de la reseña...',
            ayuda: 'Opcional. Mínimo 3 caracteres, máximo 1000.'
        }
    ]
};

function ResenasAdmin() {
    return <PanelCrud config={config} />;
}

export default ResenasAdmin;