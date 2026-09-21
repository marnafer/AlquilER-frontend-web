import React from 'react';
import PanelCrud from '../../components/admin/PanelCrud';
import {
    getUsuarios,
    getRoles,
    updatePerfil,
    deleteUsuario
} from '../../services/api';

const config = {
    titulo: 'Usuarios',
    nombreSingular: 'usuario',
    icono: 'fa-users',
    descripcion: 'Gestioná las cuentas registradas en el sistema.',
    columnaPrincipal: 'nombre',
    obtener: (token) => getUsuarios(token),
    crear: null,
    actualizar: (id, data, token) => updatePerfil(id, data, token),
    eliminar: (id, token) => deleteUsuario(id, token),
    externos: [
        { clave: 'roles', cargar: () => getRoles() }
    ],
    columnas: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'email', label: 'Email' },
        { key: 'telefono', label: 'Teléfono' },
        {
            key: 'rol_id',
            label: 'Rol',
            render: (item, externos) => {
                const rol = (externos.roles || []).find(r => String(r.id) === String(item.rol_id));
                return (
                    <span className={`admin-badge ${String(item.rol_id) === '2' ? 'admin-badge-admin' : 'admin-badge-usuario'}`}>
                        {rol ? rol.nombre : `#${item.rol_id}`}
                    </span>
                );
            }
        }
    ],
    campos: [
        { name: 'nombre', label: 'Nombre', type: 'text', requerido: true, min: 2, max: 50, placeholder: 'Juan' },
        { name: 'apellido', label: 'Apellido', type: 'text', requerido: true, min: 2, max: 50, placeholder: 'Pérez' },
        { name: 'email', label: 'Email', type: 'email', requerido: true, max: 100, placeholder: 'juan@mail.com' },
        { name: 'telefono', label: 'Teléfono', type: 'text', requerido: true, min: 6, max: 15, placeholder: '3434556677' },
        { name: 'domicilio', label: 'Domicilio', type: 'text', requerido: true, min: 5, max: 100, placeholder: 'Calle y número' },
        { name: 'contrasena', label: 'Contraseña', type: 'password', requerido: false, min: 6, max: 255, ayuda: 'Dejalo vacío si no querés cambiarla.' }
    ]
};

function UsuariosAdmin() {
    return <PanelCrud config={config} />;
}

export default UsuariosAdmin;