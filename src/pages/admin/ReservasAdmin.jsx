import React, { useMemo } from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import { useAuth } from '../../hooks/useAuth';
import {
    getReservasAdmin,
    getReserva,
    confirmarReserva,
    rechazarReserva,
    finalizarReserva,
    cancelarReserva,
    updateReservaEstado,
    crearReservaAdmin,
    deleteReserva,
    restoreReserva,
    getUsuarios,
    getPropiedadesAdmin
} from '../../services/api';

const ESTADOS = [
    { id: 'pendiente', nombre: 'Pendiente' },
    { id: 'confirmada', nombre: 'Confirmada' },
    { id: 'rechazada', nombre: 'Rechazada' },
    { id: 'finalizada', nombre: 'Finalizada' },
    { id: 'cancelada', nombre: 'Cancelada' }
];

const ESTADOS_CREAR = [
    { id: 'pendiente', nombre: 'Pendiente' },
    { id: 'confirmada', nombre: 'Confirmada' }
];

// Transiciones válidas desde cada estado (mismas que permite el backend).
const TRANSICIONES = {
    pendiente: ['pendiente', 'confirmada', 'rechazada', 'cancelada'],
    confirmada: ['confirmada', 'finalizada', 'cancelada'],
    rechazada: ['rechazada'],
    finalizada: ['finalizada'],
    cancelada: ['cancelada']
};

const opcionesEstado = (item) => {
    const permitidos = TRANSICIONES[item?.estado] || [item?.estado].filter(Boolean);
    return ESTADOS.filter(e => permitidos.includes(e.id));
};

const estadoBadge = (estado) => (
    <span className={`admin-badge estado-${estado || ''}`}>
        {(ESTADOS.find(e => e.id === estado)?.nombre) || estado || '—'}
    </span>
);

function ReservasAdmin() {
    const { token } = useAuth();

    const esArrays = (res, campo) =>
        res?.data?.items ?? res?.data ?? [];

    const config = useMemo(() => ({
        titulo: 'Reservas',
        nombreSingular: 'reserva',
        icono: 'fa-calendar-check',
        descripcion: 'Gestioná las reservas de alquiler, cambiá su estado o restaurá eliminadas.',
        columnaPrincipal: 'id',
        crear: (payload, token) => crearReservaAdmin(payload, token),
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
            },
            {
                clave: 'estadosCrear',
                cargar: () => Promise.resolve(ESTADOS_CREAR.map(e => ({ id: e.id, nombre: e.nombre })))
            },
            {
                clave: 'usuarios',
                cargar: async () => {
                    const res = await getUsuarios(token);
                    return esArrays(res).map(u => ({
                        id: u.id,
                        nombre: `${u.nombre} ${u.apellido || ''}`.trim() + ` (${u.email})`
                    }));
                }
            },
            {
                clave: 'propiedades',
                cargar: async () => {
                    const res = await getPropiedadesAdmin(token);
                    return esArrays(res)
                        .filter(p => p.disponible)
                        .map(p => ({ id: p.id, nombre: `${p.titulo} — ${p.direccion || ''}`.trim() }));
                }
            }
        ],
        campos: [
            {
                name: 'usuario_id',
                label: 'Inquilino',
                type: 'select',
                opciones: 'usuarios',
                requerido: true,
                soloCrear: true
            },
            {
                name: 'propiedad_id',
                label: 'Propiedad',
                type: 'select',
                opciones: 'propiedades',
                requerido: true,
                soloCrear: true,
                ayuda: 'Solo se muestran propiedades disponibles.'
            },
            {
                name: 'fecha_inicio_alquiler',
                label: 'Inicio de alquiler',
                type: 'date',
                requerido: true,
                soloCrear: true
            },
            {
                name: 'fecha_fin_alquiler',
                label: 'Fin de alquiler',
                type: 'date',
                requerido: true,
                soloCrear: true
            },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                opciones: 'estadosCrear',
                requerido: true,
                soloCrear: true,
                ayuda: 'Si elegís "Confirmada" el inquilino recibe una notificación.'
            },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                opciones: opcionesEstado,
                requerido: true,
                soloEditar: true,
                ayuda: 'Solo se ofrecen transiciones válidas para el estado actual de la reserva.'
            }
        ]
    }), [token]);

    return <PanelCrud config={config} />;
}

export default ReservasAdmin;