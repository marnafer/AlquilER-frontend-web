import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getPropiedadesAdmin,
    updatePropiedad,
    deletePropiedad,
    restorePropiedad
} from '../../services/api';

const estados = [
    { value: 1, label: 'Disponible' },
    { value: 0, label: 'No disponible' }
];

const destacados = [
    { value: 1, label: 'Sí, destacada' },
    { value: 0, label: 'No destacada' }
];

const estadoBadge = (disponible) => (
    <span className={`admin-badge ${disponible ? 'estado-disponible' : 'estado-no-disponible'}`}>
        {disponible ? 'Disponible' : 'No disponible'}
    </span>
);

const destacadaBadge = (destacada) => (
    <span className={`admin-badge ${destacada ? 'estado-destacada' : 'estado-neutra'}`}>
        {destacada ? 'Destacada' : '—'}
    </span>
);

const config = {
    titulo: 'Propiedades',
    nombreSingular: 'propiedad',
    icono: 'fa-building',
    descripcion: 'Propiedades publicadas en el sistema.',
    columnaPrincipal: 'titulo',
    obtener: (token) => getPropiedadesAdmin(token),
    crear: '/propiedades/crear',
    crearEtiqueta: 'Nueva propiedad',
    actualizar: (id, payload, token) => updatePropiedad(id, payload, token),
    eliminar: (id, token) => deletePropiedad(id, token),
    normalizarEdicion: (item) => ({
        ...item,
        disponible: item.disponible ? 1 : 0,
        destacada: item.destacada ? 1 : 0
    }),
    campos: [
        { name: 'titulo', label: 'Título', requerido: true, min: 3, max: 120 },
        { name: 'direccion', label: 'Dirección', requerido: true, min: 4, max: 200 },
        { name: 'precio', label: 'Precio mensual', type: 'number', requerido: true, min: 1, ayuda: 'Valor numérico sin separadores.' },
        {
            name: 'disponible',
            label: 'Estado',
            type: 'select',
            opciones: 'estados',
            requerido: true,
            ayuda: 'Si la marcás como no disponible, desaparece del catálogo público.'
        },
        {
            name: 'destacada',
            label: 'Destacada',
            type: 'select',
            opciones: 'destacados',
            requerido: true,
            ayuda: 'Las destacadas se muestran en el inicio de la web.'
        }
    ],
    externos: [
        { clave: 'estados', cargar: () => Promise.resolve(estados) },
        { clave: 'destacados', cargar: () => Promise.resolve(destacados) }
    ],
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
            key: 'destacada',
            label: 'Destacada',
            render: (item) => destacadaBadge(item.destacada)
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