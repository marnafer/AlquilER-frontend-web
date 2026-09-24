import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getReservasAdmin,
    getReserva,
    confirmarReserva,
    rechazarReserva,
    finalizarReserva,
    cancelarReserva,
    updateReservaEstado,
    deleteReserva,
    restoreReserva
} from '../../services/api';

const ESTADOS = [
    { id: 'pendiente', nombre: 'Pendiente' },
    { id: 'confirmada', nombre: 'Confirmada' },
    { id: 'rechazada', nombre: 'Rechazada' },
    { id: 'finalizada', nombre: 'Finalizada' },
    { id: 'cancelada', nombre: 'Cancelada' }
];

const estadoBadge = (estado) => (
    <span className={`admin-badge estado-${estado || ''}`}>
        {(ESTADOS.find(e => e.id === estado)?.nombre) || estado || '—'}
    </span>
);

const config = {
    titulo: 'Reservas',
    nombreSingular: 'reserva',
    icono: 'fa-calendar-check',
    descripcion: 'Gestioná las reservas de alquiler, cambiá su estado o restaurá eliminadas.',
    columnaPrincipal: 'id',
    crear: null,
    obtener: (token) => getReservasAdmin(token),
    actualizar: (id, data, token) => updateReservaEstado(id, data.estado, token),
    eliminar: (id, token) => deleteReserva(id, token),
    papelera: {
        obtener: (token) => getReservasAdmin(token, true),
        restaurar: (id, token) => restoreReserva(id, token)
    },
    acciones: [
        {
            etiqueta: 'Confirmar',
            icono: 'fa-check',
            clase: 'aprobar',
            permitido: (item) => item.estado === 'pendiente',
            ejecutar: (item, token) => confirmarReserva(item.id, token)
        },
        {
            etiqueta: 'Rechazar',
            icono: 'fa-times',
            clase: 'rechazar',
            permitido: (item) => item.estado === 'pendiente',
            ejecutar: (item, token) => rechazarReserva(item.id, token)
        },
        {
            etiqueta: 'Finalizar',
            icono: 'fa-flag-checkered',
            clase: 'finalizar',
            permitido: (item) => item.estado === 'confirmada',
            ejecutar: (item, token) => finalizarReserva(item.id, token)
        },
        {
            etiqueta: 'Cancelar',
            icono: 'fa-ban',
            clase: 'cancelar',
            permitido: (item) => ['pendiente', 'confirmada'].includes(item.estado),
            ejecutar: (item, token) => cancelarReserva(item.id, token)
        }
    ],
    detalle: {
        titulo: (item) => `Reserva #${item.id}`,
        cargar: (item, token) => getReserva(item.id, token),
        filas: [
            {
                label: 'Propiedad',
                valor: (d) => d.propiedad?.titulo || `Propiedad #${d.propiedad_id}`
            },
            {
                label: 'Dirección',
                valor: (d) => d.propiedad?.direccion || '—'
            },
            {
                label: 'Inquilino',
                valor: (d) => (d.usuario ? `${d.usuario.nombre} ${d.usuario.apellido || ''}`.trim() : `#${d.usuario_id}`)
            },
            {
                label: 'Email',
                valor: (d) => d.usuario?.email || '—'
            },
            {
                label: 'Teléfono',
                valor: (d) => d.usuario?.telefono || '—'
            },
            {
                label: 'Estado',
                valor: (d) => estadoBadge(d.estado)
            },
            {
                label: 'Solicitada',
                valor: (d) => (d.fecha_reserva ? String(d.fecha_reserva).slice(0, 16) : '—')
            },
            {
                label: 'Inicio de alquiler',
                valor: (d) => (d.fecha_inicio_alquiler ? String(d.fecha_inicio_alquiler).slice(0, 10) : '—')
            },
            {
                label: 'Fin de alquiler',
                valor: (d) => (d.fecha_fin_alquiler ? String(d.fecha_fin_alquiler).slice(0, 10) : '—')
            },
            {
                label: 'Monto',
                valor: (d) => (d.monto_total != null ? `$${Number(d.monto_total).toLocaleString('es-AR')}` : '—')
            },
            {
                label: 'Comentario',
                valor: (d) => d.comentario || '—'
            }
        ]
    },
    columnas: [
        { key: 'id', label: 'ID' },
        {
            key: 'propiedad',
            label: 'Propiedad',
            render: (item) => item.propiedad?.titulo || `Propiedad #${item.propiedad_id}`
        },
        {
            key: 'usuario',
            label: 'Inquilino',
            render: (item) => item.usuario
                ? `${item.usuario.nombre} ${item.usuario.apellido || ''}`.trim()
                : `Usuario #${item.usuario_id}`
        },
        {
            key: 'fecha_reserva',
            label: 'Solicitada',
            render: (item) => item.fecha_reserva ? String(item.fecha_reserva).slice(0, 16) : '—'
        },
        {
            key: 'fecha_inicio_alquiler',
            label: 'Alquiler',
            render: (item) => (item.fecha_inicio_alquiler && item.fecha_fin_alquiler)
                ? `${String(item.fecha_inicio_alquiler).slice(0, 10)} → ${String(item.fecha_fin_alquiler).slice(0, 10)}`
                : '—'
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (item) => estadoBadge(item.estado)
        }
    ],
    externos: [
        {
            clave: 'estados',
            cargar: () => Promise.resolve(ESTADOS.map(e => ({ id: e.id, nombre: e.nombre })))
        }
    ],
    campos: [
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            opciones: 'estados',
            requerido: true,
            ayuda: 'Los estados finalizada/cancelada se controlan con las acciones de cada fila y no por el selector.'
        }
    ]
};

function ReservasAdmin() {
    return <PanelCrud config={config} />;
}

export default ReservasAdmin;