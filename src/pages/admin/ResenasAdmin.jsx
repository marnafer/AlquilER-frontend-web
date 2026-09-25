import React, { useMemo } from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import { useAuth } from '../../hooks/useAuth';
import {
    getResenas,
    updateResena,
    deleteResena,
    restoreResena,
    crearResenaAdmin,
    getReservas,
    getUsuarios
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

function ResenasAdmin() {
    const { token } = useAuth();

    const config = useMemo(() => ({
        titulo: 'Reseñas',
        nombreSingular: 'reseña',
        icono: 'fa-star',
        descripcion: 'Moderá las reseñas publicadas sobre las propiedades y los inquilinos.',
        columnaPrincipal: 'id',
        crear: (payload, token) => crearResenaAdmin(payload, token),
        obtener: (token, filtros = {}) => getResenas(token, false, filtros),
        actualizar: (id, data, token) => updateResena(id, data, token),
        eliminar: (id, token) => deleteResena(id, token),
        filtros: [
            {
                parametro: 'tipo',
                label: 'Tipo',
                tipo: 'select',
                opciones: [
                    { value: 'propiedad', label: 'Propiedad' },
                    { value: 'inquilino', label: 'Inquilino' }
                ]
            },
            {
                parametro: 'calificacion',
                label: 'Calificación',
                tipo: 'select',
                opciones: [5, 4, 3, 2, 1].map(n => ({ value: String(n), label: `${n} ${n === 1 ? 'estrella' : 'estrellas'}` }))
            },
            { parametro: 'fecha_desde', label: 'Desde', tipo: 'date' },
            { parametro: 'fecha_hasta', label: 'Hasta', tipo: 'date' }
        ],
        papelera: {
            obtener: (token, filtros = {}) => getResenas(token, true, filtros),
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
                csv: (item) => (item.calificacion != null ? String(item.calificacion) : ''),
                render: (item) => (
                    <span className="d-inline-flex align-items-center gap-1">
                        {estrellas(item.calificacion)}
                        <span>{item.calificacion || '—'}</span>
                    </span>
                )
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
        externos: [
            {
                clave: 'usuarios',
                cargar: async () => {
                    const res = await getUsuarios(token);
                    const items = res?.data?.items ?? res?.data ?? [];
                    return items.map(u => ({
                        id: u.id,
                        nombre: `${u.nombre} ${u.apellido || ''}`.trim() + ` (${u.email})`
                    }));
                }
            },
            {
                clave: 'reservasFinalizadas',
                cargar: async () => {
                    const res = await getReservas(token);
                    const items = res?.data?.items ?? res?.data ?? [];
                    return items
                        .filter(r => r.estado === 'finalizada')
                        .map(r => ({
                            id: r.id,
                            nombre: `#${r.id} — ${r.propiedad?.titulo || `Propiedad ${r.propiedad_id}`}` +
                                ` (${r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido || ''}`.trim() : `Usuario ${r.usuario_id}`})`
                        }));
                }
            }
        ],
        campos: [
            {
                name: 'reserva_id',
                label: 'Reserva',
                type: 'select',
                opciones: 'reservasFinalizadas',
                requerido: true,
                soloCrear: true,
                ayuda: 'Solo se muestran reservas finalizadas.'
            },
            {
                name: 'calificador_id',
                label: 'Calificador',
                type: 'select',
                opciones: 'usuarios',
                requerido: true,
                soloCrear: true,
                ayuda: 'El tipo (propiedad o inquilino) se deduce según quién califique.'
            },
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
    }), [token]);

    return <PanelCrud config={config} />;
}

export default ResenasAdmin;