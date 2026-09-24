export const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================
// AUTENTICACIÓN Y USUARIOS
// ============================================

export async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/autenticador/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasena: password })
        });
        const result = await response.json();
        // Compatibilidad: garantizar que result.data.token y result.token existan
        if (result.success && result.data) {
            result.token = result.data.access_token || result.data.token;
            if (!result.data.token) {
                result.data.token = result.token;
            }
            result.refresh_token = result.data.refresh_token;
        }
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function register(userData) {
    try {
        const payload = {
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            telefono: userData.telefono || '',
            domicilio: userData.domicilio || '',
            contrasena: userData.contrasena || userData.password,
            rol: userData.rol || 'inquilino'
        };

        const response = await fetch(`${API_URL}/api/autenticador/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logout(token, refreshToken) {
    try {
        const payload = refreshToken ? { refresh_token: refreshToken } : {};
        const response = await fetch(`${API_URL}/api/autenticador/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getPerfil(token) {
    try {
        const response = await fetch(`${API_URL}/api/usuarios/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        // Dejamos el status HTTP para distinguir 401 (token inválido) de otros errores
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message, status: 0 };
    }
}

export async function updatePerfil(id, userData, token) {
    try {
        const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// PROPIEDADES
// ============================================

export async function getPropiedades() {
    try {
        const response = await fetch(`${API_URL}/api/propiedades`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getPropiedades:', error);
        return [];
    }
}

export async function getMisPropiedades(token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/mis-propiedades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getMisPropiedades:', error);
        return [];
    }
}

export async function getPropiedad(id) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${id}`);
        const result = await response.json();
        if (result.success && result.data) {
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error en getPropiedad:', error);
        return null;
    }
}

export async function createPropiedad(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updatePropiedad(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deletePropiedad(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getPropiedadesAdmin(token, soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/admin/propiedades${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function subirImagenPropiedad(propiedadId, file, token) {
    try {
        const formData = new FormData();
        formData.append('propiedad_id', String(propiedadId));
        formData.append('imagen', file);
        const response = await fetch(`${API_URL}/api/propiedad-imagenes`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function establecerImagenPrincipal(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedad-imagenes/${id}/principal`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function eliminarImagenPropiedad(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedad-imagenes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// CATÁLOGOS (CATEGORÍAS, LOCALIDADES, PROVINCIAS, SERVICIOS)
// ============================================

export async function getCategorias(soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/categorias${query}`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getCategorias:', error);
        return [];
    }
}

export async function getProvincias(soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/provincias${query}`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getProvincias:', error);
        return [];
    }
}

export async function getLocalidades(soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/localidades${query}`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getLocalidades:', error);
        return [];
    }
}

export async function getServicios(soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/servicios${query}`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getServicios:', error);
        return [];
    }
}

export async function getRoles(soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/roles${query}`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getRoles:', error);
        return [];
    }
}

export async function getServiciosByPropiedad(propiedadId) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${propiedadId}/servicios`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return result.data || [];
    } catch (error) {
        console.error('Error en getServiciosByPropiedad:', error);
        return [];
    }
}

export async function guardarServiciosPropiedad(propiedadId, ids, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${propiedadId}/servicios/multiple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ servicio_ids: ids })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function sincronizarServiciosPropiedad(propiedadId, ids, token) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${propiedadId}/servicios`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ servicio_ids: ids })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// FAVORITOS
// ============================================

export async function getFavoritos(token) {
    try {
        const response = await fetch(`${API_URL}/api/favoritos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function addFavorito(propiedadId, token) {
    try {
        const response = await fetch(`${API_URL}/api/favoritos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ propiedad_id: Number(propiedadId) })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function removeFavorito(propiedadId, token) {
    try {
        const response = await fetch(`${API_URL}/api/favoritos/propiedad/${propiedadId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// RESERVAS
// ============================================

export async function getReservas(token) {
    try {
        // GET /api/reservas devuelve las reservas del usuario autenticado
        const response = await fetch(`${API_URL}/api/reservas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getReservasAdmin(token, soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/reservas${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createReserva(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function aprobarReserva(id, token) {
    // En el backend "aprobar" equivale a confirmar
    return confirmarReserva(id, token);
}

export async function confirmarReserva(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}/confirmar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function rechazarReserva(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}/rechazar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function finalizarReserva(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}/finalizar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function cancelarReserva(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}/cancelar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getReserva(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateReservaEstado(id, estado, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteReserva(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getReservasByPropiedad(propiedadId, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas?propiedad_id=${propiedadId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// CONSULTAS
// ============================================

export async function createConsulta(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getConsultas(token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getConsultasAdmin(token, soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/admin/consultas${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteConsulta(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getConsultasByPropiedad(propiedadId, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas/propiedad/${propiedadId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getConsultasByUsuario(usuarioId, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas/usuario/${usuarioId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getMensajesConsulta(consultaId, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas/${consultaId}/mensajes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function enviarMensajeConsulta(consultaId, mensaje, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas/${consultaId}/mensajes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mensaje })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// RESEÑAS
// ============================================

export async function createResena(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/resenas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getResenasByPropiedad(propiedadId) {
    try {
        const response = await fetch(`${API_URL}/api/resenas/propiedad/${propiedadId}`);
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - USUARIOS
// ============================================

export async function getUsuarios(token, soloEliminados = false) {
    try {
        const query = soloEliminados ? '?solo_eliminados=true' : '';
        const response = await fetch(`${API_URL}/api/usuarios${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        // Dejamos el status HTTP para distinguir 403/401 de otros errores
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getUsuario(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getResenasByUsuario(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/resenas/usuario/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getFavoritosByUsuario(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/usuarios/${id}/favoritos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteUsuario(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - CATEGORÍAS
// ============================================

export async function createCategoria(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateCategoria(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/categorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategoria(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/categorias/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - PROVINCIAS
// ============================================

export async function createProvincia(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/provincias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateProvincia(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/provincias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteProvincia(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/provincias/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - LOCALIDADES
// ============================================

export async function createLocalidad(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/localidades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateLocalidad(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/localidades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteLocalidad(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/localidades/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - ROLES
// ============================================

export async function createRol(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/roles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateRol(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/roles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteRol(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/roles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - SERVICIOS
// ============================================

export async function createServicio(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/servicios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateServicio(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/servicios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteServicio(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/servicios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - RESEÑAS
// ============================================

export async function getResenas(token, soloEliminados = false, filtros = {}) {
    try {
        const params = new URLSearchParams();
        if (soloEliminados) params.set('solo_eliminados', 'true');
        Object.entries(filtros).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) params.set(k, String(v));
        });
        const qs = params.toString();
        const response = await fetch(`${API_URL}/api/resenas${qs ? `?${qs}` : ''}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateResena(id, data, token) {
    try {
        const response = await fetch(`${API_URL}/api/resenas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteResena(id, token) {
    try {
        const response = await fetch(`${API_URL}/api/resenas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN - RESTAURAR (PAPELERA)
// ============================================

const restore = (endpoint) => async (id, token) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}/${id}/restaurar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const restoreUsuario = restore('/api/usuarios');
export const restoreCategoria = restore('/api/categorias');
export const restoreProvincia = restore('/api/provincias');
export const restoreLocalidad = restore('/api/localidades');
export const restoreRol = restore('/api/roles');
export const restoreServicio = restore('/api/servicios');
export const restoreResena = restore('/api/resenas');
export const restoreReserva = restore('/api/reservas');
export const restoreConsulta = restore('/api/consultas');
export const restorePropiedad = restore('/api/propiedades');

// ============================================
// ADMIN - REGISTROS DE ACTIVIDAD
// ============================================

export async function getLogsActividad(token) {
    try {
        const response = await fetch(`${API_URL}/api/logs-actividad`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        result.status = response.status;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}