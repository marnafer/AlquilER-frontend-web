export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

        // Si el registro fue exitoso, auto-login para obtener el token inmediatamente
        if (result.success) {
            const loginResult = await login(payload.email, payload.contrasena);
            if (loginResult.success && loginResult.data) {
                return {
                    success: true,
                    message: 'Usuario registrado e iniciado sesión',
                    token: loginResult.token || loginResult.data.token,
                    data: loginResult.data
                };
            }
        }
        return result;
    } catch (error) {
        console.error('❌ Error en register:', error);
        return { success: false, error: error.message };
    }
}

export async function logout(token) {
    try {
        const response = await fetch(`${API_URL}/api/autenticador/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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
        return result;
    } catch (error) {
        console.error('❌ Error en getPerfil:', error);
        return { success: false, error: error.message };
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

// ============================================
// CATÁLOGOS (CATEGORÍAS, LOCALIDADES, PROVINCIAS, SERVICIOS)
// ============================================

export async function getCategorias() {
    try {
        const response = await fetch(`${API_URL}/api/categorias`);
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

export async function getProvincias() {
    try {
        const response = await fetch(`${API_URL}/api/provincias`);
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

export async function getLocalidades() {
    try {
        const response = await fetch(`${API_URL}/api/localidades`);
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

export async function getServicios() {
    try {
        const response = await fetch(`${API_URL}/api/servicios`);
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

export async function getServiciosByPropiedad(propiedadId) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${propiedadId}/servicios`);
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error en getServiciosByPropiedad:', error);
        return [];
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
        // En el backend, las reservas del usuario autenticado se consultan en /mis-reservas
        const response = await fetch(`${API_URL}/api/reservas/mis-reservas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
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

export async function getConsultasByPropiedad(propiedadId) {
    try {
        const response = await fetch(`${API_URL}/api/consultas/propiedad/${propiedadId}`);
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